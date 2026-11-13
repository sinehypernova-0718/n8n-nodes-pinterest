import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function getWebsitesRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;

	const qs: IDataObject = {};

	if (returnAll) {
		qs.page_size = 250;
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 25) as number;
		if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
			throw new NodeOperationError(
				this.getNode(),
				'Limit must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = limit;
	}

	if (typeof bookmark === 'string' && bookmark.trim() !== '') {
		qs.bookmark = bookmark.trim();
	}

	return {
		method: 'GET',
		url: '/user_account/websites',
		qs,
	};
}
