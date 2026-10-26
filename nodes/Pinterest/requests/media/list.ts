import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function listMediaRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false);
	if (typeof returnAll !== 'boolean') {
		throw new NodeOperationError(this.getNode(), 'Return All must be a boolean', { itemIndex });
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {};

	if (returnAll) {
		qs.page_size = 250;
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 50);
		if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 250) {
			throw new NodeOperationError(
				this.getNode(),
				'Limit must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = limit;
	}

	const pageBookmark = bookmark ?? additionalFields.bookmark;
	if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
		qs.bookmark = pageBookmark.trim();
	} else if (pageBookmark !== undefined && pageBookmark !== '') {
		throw new NodeOperationError(this.getNode(), 'Bookmark must be a string', { itemIndex });
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: '/media',
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return requestOptions;
}
