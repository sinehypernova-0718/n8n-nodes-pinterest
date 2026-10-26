import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function getMediaRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const rawMediaId = this.getNodeParameter('mediaId', itemIndex, '');
	if (typeof rawMediaId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Media ID must be a string', { itemIndex });
	}

	const mediaId = rawMediaId.trim();
	if (mediaId === '') {
		throw new NodeOperationError(this.getNode(), 'Media ID is required to get a media upload', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(mediaId)) {
		throw new NodeOperationError(this.getNode(), 'Media ID must contain only digits', {
			itemIndex,
		});
	}

	return {
		method: 'GET',
		url: `/media/${mediaId}`,
	};
}
