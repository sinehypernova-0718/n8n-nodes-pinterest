import type {
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INode,
} from 'n8n-workflow';
import { NodeOperationError, sleepWithAbort } from 'n8n-workflow';
import { PINTEREST_API_BASE_URL } from '../../constants';
import { mapPinterestApiError } from '../../errors';
import { buildMultipartBody } from './multipart';
import { normalizeMediaUpload } from './normalize';
import { validatePinterestUploadUrl } from './validateUploadUrl';

const MAX_VIDEO_UPLOAD_BYTES = 512 * 1024 * 1024;
const UPLOAD_TIMEOUT_MIN_MS = 60_000;
const UPLOAD_TIMEOUT_PER_MB_MS = 1_000;
const UPLOAD_TIMEOUT_MAX_MS = 600_000;

const VIDEO_EXTENSION_TO_CONTENT_TYPE = new Map<string, string>([
	['.mp4', 'video/mp4'],
	['.m4v', 'video/x-m4v'],
	['.mov', 'video/quicktime'],
]);

const VIDEO_CONTENT_TYPE_TO_EXTENSION = new Map<string, string>(
	[...VIDEO_EXTENSION_TO_CONTENT_TYPE.entries()].map(([extension, contentType]) => [
		contentType,
		extension,
	]),
);

interface MediaRegistration {
	mediaId: string;
	uploadUrl: string;
	uploadParameters: IDataObject;
}

interface VideoFileInfo {
	fileName: string;
	contentType: string;
}

interface PollingOptions {
	waitForProcessing: boolean;
	pollIntervalMs: number;
	pollTimeoutMs: number;
}

function isDataObject(value: unknown): value is IDataObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extracts only a safe HTTP status or transport code from a media storage
 * failure. The raw error is intentionally discarded because HTTP client errors
 * can retain the request configuration, which includes the upload URL and the
 * signed form parameters.
 */
function describeUploadFailure(error: unknown): string {
	if (!isDataObject(error)) {
		return '';
	}

	const httpCode = error.httpCode;
	if (typeof httpCode === 'string' && /^\d{3}$/.test(httpCode)) {
		return ` (HTTP ${httpCode})`;
	}

	const response = error.response;
	if (isDataObject(response) && typeof response.status === 'number') {
		return ` (HTTP ${response.status})`;
	}

	const code = error.code;
	if (typeof code === 'string' && /^[A-Z][A-Z0-9_]*$/.test(code)) {
		return ` (${code})`;
	}

	return '';
}

function getDeclaredBinarySize(binaryData: IBinaryData): number | undefined {
	if (typeof binaryData.bytes === 'number' && Number.isFinite(binaryData.bytes)) {
		return binaryData.bytes;
	}
	if (typeof binaryData.fileSize === 'string') {
		const size = Number(binaryData.fileSize);
		if (Number.isFinite(size)) {
			return size;
		}
	}
	return undefined;
}

function extensionForContentType(contentType: string): string {
	const extension = VIDEO_CONTENT_TYPE_TO_EXTENSION.get(contentType);
	if (extension === undefined) {
		throw new Error(`Unsupported video content type "${contentType}"`);
	}
	return extension;
}

function getVideoFileInfo(binaryData: IBinaryData): VideoFileInfo {
	const rawFileName = typeof binaryData.fileName === 'string' ? binaryData.fileName : '';
	const baseName = rawFileName.split(/[\\/]/).pop()?.trim() ?? '';
	const dotIndex = baseName.lastIndexOf('.');
	const extension = dotIndex >= 0 ? baseName.slice(dotIndex).toLowerCase() : '';

	if (extension !== '' && !VIDEO_EXTENSION_TO_CONTENT_TYPE.has(extension)) {
		throw new Error(
			`Unsupported video file extension "${extension}". Use .mp4, .m4v, or .mov.`,
		);
	}

	const rawMimeType = typeof binaryData.mimeType === 'string' ? binaryData.mimeType : '';
	const mimeType = rawMimeType.split(';')[0].trim().toLowerCase();

	let contentType = extension !== '' ? VIDEO_EXTENSION_TO_CONTENT_TYPE.get(extension) : undefined;
	if (contentType === undefined && mimeType.startsWith('video/')) {
		if (!VIDEO_CONTENT_TYPE_TO_EXTENSION.has(mimeType)) {
			throw new Error(`Unsupported video content type "${mimeType}". Use MP4, M4V, or MOV.`);
		}
		contentType = mimeType;
	}
	if (contentType === undefined) {
		contentType = 'video/mp4';
	}

	let fileName = baseName;
	if (fileName === '' || fileName === extension) {
		fileName = `video${extension !== '' ? extension : extensionForContentType(contentType)}`;
	} else if (extension === '') {
		fileName = `${fileName}${extensionForContentType(contentType)}`;
	}

	fileName = fileName.replace(/[\r\n\0]/g, '').trim();
	if (fileName === '') {
		fileName = `video${extensionForContentType(contentType)}`;
	}

	return { fileName, contentType };
}

function parseRegistrationResponse(
	response: unknown,
	node: INode,
	itemIndex: number,
): MediaRegistration {
	if (!isDataObject(response)) {
		throw new NodeOperationError(
			node,
			'Pinterest returned an invalid media upload registration response',
			{ itemIndex },
		);
	}

	const mediaId = response.media_id;
	if (typeof mediaId !== 'string' || !/^\d+$/.test(mediaId)) {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload registration response without a valid media ID',
			{ itemIndex },
		);
	}

	if (response.media_type !== 'video') {
		throw new NodeOperationError(
			node,
			'Pinterest returned an unexpected media type for a video upload',
			{ itemIndex },
		);
	}

	const uploadUrl = response.upload_url;
	if (typeof uploadUrl !== 'string' || uploadUrl.trim() === '') {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload registration response without an upload URL',
			{ itemIndex },
		);
	}

	const rawUploadParameters = response.upload_parameters;
	if (!isDataObject(rawUploadParameters)) {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload registration response without upload parameters',
			{ itemIndex },
		);
	}

	const uploadParameters: IDataObject = {};
	for (const [name, value] of Object.entries(rawUploadParameters)) {
		if (name.trim() === '' || /[\r\n\0]/.test(name)) {
			throw new NodeOperationError(
				node,
				'Pinterest returned an invalid media upload parameter name',
				{ itemIndex },
			);
		}
		if (
			typeof value !== 'string' &&
			typeof value !== 'number' &&
			typeof value !== 'boolean'
		) {
			throw new NodeOperationError(
				node,
				`Pinterest returned an invalid value for the media upload parameter "${name}"`,
				{ itemIndex },
			);
		}
		uploadParameters[name] = value;
	}

	if (Object.keys(uploadParameters).length === 0) {
		throw new NodeOperationError(
			node,
			'Pinterest returned an empty set of media upload parameters',
			{ itemIndex },
		);
	}

	return {
		mediaId,
		uploadUrl: uploadUrl.trim(),
		uploadParameters,
	};
}

async function registerMediaUpload(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<MediaRegistration> {
	const options: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		url: '/media',
		method: 'POST',
		json: true,
		body: { media_type: 'video' },
		abortSignal: this.getExecutionCancelSignal(),
	};

	let response: unknown;
	try {
		response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'pinterestOAuth2Api',
			options,
		);
	} catch (error) {
		throw mapPinterestApiError(error, { itemIndex });
	}

	return parseRegistrationResponse(response, this.getNode(), itemIndex);
}

async function uploadToMediaStorage(
	this: IExecuteFunctions,
	itemIndex: number,
	registration: MediaRegistration,
	file: VideoFileInfo & { data: Buffer },
): Promise<void> {
	let validatedUrl: ReturnType<typeof validatePinterestUploadUrl>;
	try {
		validatedUrl = validatePinterestUploadUrl(registration.uploadUrl);
	} catch (error) {
		throw new NodeOperationError(this.getNode(), (error as Error).message, { itemIndex });
	}

	let multipart: ReturnType<typeof buildMultipartBody>;
	try {
		multipart = buildMultipartBody(registration.uploadParameters, file);
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Pinterest returned invalid media upload parameters: ${(error as Error).message}`,
			{ itemIndex },
		);
	}

	const uploadTimeoutMs = Math.min(
		UPLOAD_TIMEOUT_MAX_MS,
		Math.max(
			UPLOAD_TIMEOUT_MIN_MS,
			Math.ceil(file.data.length / (1024 * 1024)) * UPLOAD_TIMEOUT_PER_MB_MS,
		),
	);

	const options: IHttpRequestOptions = {
		url: validatedUrl.url,
		method: 'POST',
		headers: {
			'Content-Type': multipart.contentType,
		},
		body: multipart.body,
		json: false,
		returnFullResponse: true,
		disableFollowRedirect: true,
		allowedDomains: validatedUrl.hostname,
		timeout: uploadTimeoutMs,
		abortSignal: this.getExecutionCancelSignal(),
	};

	let response: unknown;
	try {
		response = await this.helpers.httpRequest(options);
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to upload the video file to Pinterest media storage${describeUploadFailure(
				error,
			)}. Verify that the file is a supported video and try again.`,
			{ itemIndex },
		);
	}

	if (
		!isDataObject(response) ||
		typeof response.statusCode !== 'number' ||
		response.statusCode < 200 ||
		response.statusCode >= 300
	) {
		throw new NodeOperationError(
			this.getNode(),
			'Pinterest media storage did not confirm the video upload',
			{ itemIndex },
		);
	}
}

async function fetchMediaStatus(
	this: IExecuteFunctions,
	itemIndex: number,
	mediaId: string,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		url: `/media/${mediaId}`,
		method: 'GET',
		json: true,
		abortSignal: this.getExecutionCancelSignal(),
	};

	let response: unknown;
	try {
		response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'pinterestOAuth2Api',
			options,
		);
	} catch (error) {
		throw mapPinterestApiError(error, { itemIndex });
	}

	const normalized = normalizeMediaUpload(response, this.getNode(), itemIndex, {
		requireStatus: true,
		requireVideoType: true,
	});

	if (normalized.media_id !== mediaId) {
		throw new NodeOperationError(
			this.getNode(),
			'Pinterest returned details for a different media upload',
			{ itemIndex },
		);
	}

	return normalized;
}

function readPollingOptions(this: IExecuteFunctions, itemIndex: number): PollingOptions {
	const waitForProcessing = this.getNodeParameter('waitForProcessing', itemIndex, true);
	if (typeof waitForProcessing !== 'boolean') {
		throw new NodeOperationError(
			this.getNode(),
			'Wait for Processing must be a boolean',
			{ itemIndex },
		);
	}

	const pollIntervalMs = this.getNodeParameter('pollIntervalMs', itemIndex, 2000);
	if (
		typeof pollIntervalMs !== 'number' ||
		!Number.isInteger(pollIntervalMs) ||
		pollIntervalMs < 500 ||
		pollIntervalMs > 30000
	) {
		throw new NodeOperationError(
			this.getNode(),
			'Poll Interval must be an integer between 500 and 30000 milliseconds',
			{ itemIndex },
		);
	}

	const pollTimeoutMs = this.getNodeParameter('pollTimeoutMs', itemIndex, 60000);
	if (
		typeof pollTimeoutMs !== 'number' ||
		!Number.isInteger(pollTimeoutMs) ||
		pollTimeoutMs < 1000 ||
		pollTimeoutMs > 600000
	) {
		throw new NodeOperationError(
			this.getNode(),
			'Poll Timeout must be an integer between 1000 and 600000 milliseconds',
			{ itemIndex },
		);
	}

	return { waitForProcessing, pollIntervalMs, pollTimeoutMs };
}

async function waitForMediaProcessing(
	this: IExecuteFunctions,
	itemIndex: number,
	mediaId: string,
	initialStatus: IDataObject,
	pollIntervalMs: number,
	pollTimeoutMs: number,
): Promise<IDataObject> {
	let currentStatus = initialStatus;
	const startedAt = Date.now();

	while (true) {
		if (currentStatus.status === 'succeeded') {
			return currentStatus;
		}
		if (currentStatus.status === 'failed') {
			throw new NodeOperationError(
				this.getNode(),
				`Pinterest failed to process the uploaded video (media ID ${mediaId})`,
				{ itemIndex },
			);
		}

		const elapsed = Date.now() - startedAt;
		if (elapsed >= pollTimeoutMs) {
			throw new NodeOperationError(
				this.getNode(),
				`Timed out waiting for Pinterest to process the uploaded video (media ID ${mediaId}, last status "${String(
					currentStatus.status,
				)}"). Use the Get Upload operation to check the status later.`,
				{ itemIndex },
			);
		}

		const remaining = pollTimeoutMs - elapsed;
		await sleepWithAbort(
			Math.min(pollIntervalMs, remaining),
			this.getExecutionCancelSignal(),
		);

		currentStatus = await fetchMediaStatus.call(this, itemIndex, mediaId);
	}
}

export async function uploadMediaVideo(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const node = this.getNode();

	const rawBinaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data');
	if (typeof rawBinaryPropertyName !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Binary Property must be a string', {
			itemIndex,
		});
	}
	const binaryPropertyName = rawBinaryPropertyName.trim();
	if (binaryPropertyName === '') {
		throw new NodeOperationError(
			this.getNode(),
			'Binary Property is required to upload a video',
			{ itemIndex },
		);
	}

	let binaryData: IBinaryData;
	try {
		binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Could not read the video file from binary property "${binaryPropertyName}": ${
				(error as Error).message
			}`,
			{ itemIndex },
		);
	}

	const declaredSize = getDeclaredBinarySize(binaryData);
	if (declaredSize !== undefined && declaredSize > MAX_VIDEO_UPLOAD_BYTES) {
		throw new NodeOperationError(
			this.getNode(),
			`The video file exceeds the ${Math.floor(
				MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024),
			)} MB limit supported by this node`,
			{ itemIndex },
		);
	}

	let buffer: Buffer;
	try {
		buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Could not read the video file from binary property "${binaryPropertyName}": ${
				(error as Error).message
			}`,
			{ itemIndex },
		);
	}

	if (buffer.length === 0) {
		throw new NodeOperationError(this.getNode(), 'The video file is empty', { itemIndex });
	}
	if (buffer.length > MAX_VIDEO_UPLOAD_BYTES) {
		throw new NodeOperationError(
			this.getNode(),
			`The video file exceeds the ${Math.floor(
				MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024),
			)} MB limit supported by this node`,
			{ itemIndex },
		);
	}

	let fileInfo: VideoFileInfo;
	try {
		fileInfo = getVideoFileInfo(binaryData);
	} catch (error) {
		throw new NodeOperationError(this.getNode(), (error as Error).message, { itemIndex });
	}

	const pollingOptions = readPollingOptions.call(this, itemIndex);
	const registration = await registerMediaUpload.call(this, itemIndex);

	await uploadToMediaStorage.call(this, itemIndex, registration, {
		...fileInfo,
		data: buffer,
	});

	const initialStatus = await fetchMediaStatus.call(this, itemIndex, registration.mediaId);

	if (!pollingOptions.waitForProcessing) {
		if (initialStatus.status === 'failed') {
			throw new NodeOperationError(
				node,
				`Pinterest failed to process the uploaded video (media ID ${registration.mediaId})`,
				{ itemIndex },
			);
		}
		return initialStatus;
	}

	return waitForMediaProcessing.call(
		this,
		itemIndex,
		registration.mediaId,
		initialStatus,
		pollingOptions.pollIntervalMs,
		pollingOptions.pollTimeoutMs,
	);
}
