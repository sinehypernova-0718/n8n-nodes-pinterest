import type { IDataObject, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const MEDIA_STATUS_VALUES = new Set(['registered', 'processing', 'succeeded', 'failed']);

export interface NormalizeMediaOptions {
	requireStatus?: boolean;
	requireVideoType?: boolean;
}

function isDataObject(value: unknown): value is IDataObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reduces a Pinterest media object to the fields this node exposes.
 *
 * Registration responses contain an S3 upload URL and temporary AWS
 * credentials. Those values must never reach node output, execution history, or
 * downstream nodes, so only the safe media fields are returned.
 */
export function normalizeMediaUpload(
	value: unknown,
	node: INode,
	itemIndex: number,
	options: NormalizeMediaOptions = {},
): IDataObject {
	if (!isDataObject(value)) {
		throw new NodeOperationError(node, 'Pinterest returned an invalid media upload response', {
			itemIndex,
		});
	}

	const mediaId = value.media_id;
	if (typeof mediaId !== 'string' || !/^\d+$/.test(mediaId)) {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload response without a valid media ID',
			{ itemIndex },
		);
	}

	const mediaType = value.media_type;
	if (typeof mediaType !== 'string' || mediaType.trim() === '') {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload response without a valid media type',
			{ itemIndex },
		);
	}
	if (options.requireVideoType === true && mediaType !== 'video') {
		throw new NodeOperationError(
			node,
			`Pinterest returned an unexpected media type "${mediaType}" for a video upload`,
			{ itemIndex },
		);
	}

	const status = value.status;
	if (status !== undefined && (typeof status !== 'string' || !MEDIA_STATUS_VALUES.has(status))) {
		throw new NodeOperationError(
			node,
			'Pinterest returned an unrecognized media upload status',
			{ itemIndex },
		);
	}
	if (options.requireStatus === true && typeof status !== 'string') {
		throw new NodeOperationError(
			node,
			'Pinterest returned a media upload response without a status',
			{ itemIndex },
		);
	}

	const normalized: IDataObject = {
		media_id: mediaId,
		media_type: mediaType,
	};
	if (typeof status === 'string') {
		normalized.status = status;
	}

	return normalized;
}

export function normalizeMediaUploadList(
	value: unknown,
	node: INode,
	itemIndex: number,
): IDataObject[] {
	if (!isDataObject(value) || !Array.isArray(value.items)) {
		throw new NodeOperationError(
			node,
			'Pinterest returned an invalid media upload list response',
			{ itemIndex },
		);
	}

	return value.items.map((item) => normalizeMediaUpload(item, node, itemIndex));
}
