import { randomBytes } from 'crypto';
import type { IDataObject } from 'n8n-workflow';

const CRLF = '\r\n';

export interface MultipartFilePart {
	fileName: string;
	contentType: string;
	data: Buffer;
}

export interface MultipartBody {
	body: Buffer;
	contentType: string;
}

/**
 * Escapes a value that is placed inside a quoted multipart header parameter.
 * Line breaks and null bytes are rejected to prevent header injection.
 */
function escapeHeaderParameter(value: string, label: string): string {
	if (/[\r\n\0]/.test(value)) {
		throw new Error(`${label} must not contain line breaks or null characters`);
	}

	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function toFieldValue(value: unknown, fieldName: string): string {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}

	throw new Error(`Upload parameter "${fieldName}" must be a string, number, or boolean`);
}

/**
 * Builds a multipart/form-data body without relying on the `form-data` package.
 *
 * Amazon S3 POST policies require the file part to be the last part of the
 * form, so every upload parameter is written before the file. The returned
 * content type contains the boundary that must be sent with the request.
 */
export function buildMultipartBody(fields: IDataObject, file: MultipartFilePart): MultipartBody {
	const boundary = `----n8nPinterestBoundary${randomBytes(16).toString('hex')}`;
	const chunks: Buffer[] = [];

	for (const [name, value] of Object.entries(fields)) {
		const fieldName = escapeHeaderParameter(name, 'Upload parameter name');
		if (fieldName.trim() === '') {
			throw new Error('Upload parameter names must not be empty');
		}

		const fieldValue = toFieldValue(value, name);
		chunks.push(
			Buffer.from(
				`--${boundary}${CRLF}` +
					`Content-Disposition: form-data; name="${fieldName}"${CRLF}` +
					CRLF +
					fieldValue +
					CRLF,
				'utf8',
			),
		);
	}

	const fileName = escapeHeaderParameter(file.fileName, 'File name');
	const contentType = escapeHeaderParameter(file.contentType, 'File content type');

	chunks.push(
		Buffer.from(
			`--${boundary}${CRLF}` +
				`Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
				`Content-Type: ${contentType}${CRLF}` +
				CRLF,
			'utf8',
		),
	);
	chunks.push(file.data);
	chunks.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8'));

	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}
