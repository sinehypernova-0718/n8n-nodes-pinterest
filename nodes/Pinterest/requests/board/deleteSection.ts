import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function deleteBoardSectionRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const rawBoardId = this.getNodeParameter('boardId', itemIndex, '');
	if (typeof rawBoardId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Board ID must be a string', { itemIndex });
	}
	const boardId = rawBoardId.trim();
	if (!boardId) {
		throw new NodeOperationError(
			this.getNode(),
			'Board ID is required to delete a board section',
			{ itemIndex },
		);
	}
	if (!/^\d+$/.test(boardId)) {
		throw new NodeOperationError(this.getNode(), 'Board ID must contain only digits', {
			itemIndex,
		});
	}

	const rawSectionId = this.getNodeParameter('sectionId', itemIndex, '');
	if (typeof rawSectionId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Section ID must be a string', { itemIndex });
	}
	const sectionId = rawSectionId.trim();
	if (!sectionId) {
		throw new NodeOperationError(
			this.getNode(),
			'Section ID is required to delete a board section',
			{ itemIndex },
		);
	}
	if (!/^\d+$/.test(sectionId)) {
		throw new NodeOperationError(this.getNode(), 'Section ID must contain only digits', {
			itemIndex,
		});
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'DELETE',
		url: `/boards/${boardId}/sections/${sectionId}`,
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
