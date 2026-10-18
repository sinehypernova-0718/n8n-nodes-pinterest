import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function listBoardSectionsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const rawBoardId = this.getNodeParameter('boardId', itemIndex, '');
	if (typeof rawBoardId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Board ID must be a string', { itemIndex });
	}
	const boardId = rawBoardId.trim();
	if (!boardId) {
		throw new NodeOperationError(this.getNode(), 'Board ID is required to list board sections', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(boardId)) {
		throw new NodeOperationError(this.getNode(), 'Board ID must contain only digits', {
			itemIndex,
		});
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {};

	const pageSize = additionalFields.page_size;
	if (pageSize !== undefined && pageSize !== '') {
		if (
			typeof pageSize !== 'number' ||
			!Number.isInteger(pageSize) ||
			pageSize < 1 ||
			pageSize > 250
		) {
			throw new NodeOperationError(
				this.getNode(),
				'Page Size must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = pageSize;
	}

	const adAccountId = additionalFields.ad_account_id;
	if (adAccountId !== undefined && adAccountId !== '') {
		if (typeof adAccountId !== 'string') {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must be a string containing only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		const trimmedAdAccountId = adAccountId.trim();
		if (trimmedAdAccountId !== '') {
			if (!/^\d+$/.test(trimmedAdAccountId) || trimmedAdAccountId.length > 18) {
				throw new NodeOperationError(
					this.getNode(),
					'Ad Account ID must contain only digits and be at most 18 characters',
					{ itemIndex },
				);
			}
			qs.ad_account_id = trimmedAdAccountId;
		}
	}

	const pageBookmark = bookmark ?? additionalFields.bookmark;
	if (pageBookmark !== undefined && pageBookmark !== '') {
		if (typeof pageBookmark !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Bookmark must be a string', { itemIndex });
		}
		qs.bookmark = pageBookmark;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: `/boards/${boardId}/sections`,
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return requestOptions;
}
