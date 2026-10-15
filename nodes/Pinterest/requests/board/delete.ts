import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function deleteBoardRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const boardId = this.getNodeParameter('boardId', itemIndex, '') as string;
	if (typeof boardId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Board ID must be a string', { itemIndex });
	}
	const trimmedBoardId = boardId.trim();
	if (!trimmedBoardId) {
		throw new NodeOperationError(this.getNode(), 'Board ID is required to delete a board', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(trimmedBoardId)) {
		throw new NodeOperationError(this.getNode(), 'Board ID must contain only digits', {
			itemIndex,
		});
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'DELETE',
		url: `/boards/${trimmedBoardId}`,
	};

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

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
			requestOptions.qs = { ad_account_id: trimmedAdAccountId };
		}
	}

	return requestOptions;
}
