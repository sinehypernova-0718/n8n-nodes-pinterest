import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const BOARD_UPDATE_PRIVACY_VALUES = ['PUBLIC', 'SECRET'];

export async function updateBoardRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const rawBoardId = this.getNodeParameter('boardId', itemIndex, '');
	if (typeof rawBoardId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Board ID must be a string', { itemIndex });
	}
	const boardId = rawBoardId.trim();
	if (!boardId) {
		throw new NodeOperationError(this.getNode(), 'Board ID is required to update a board', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(boardId)) {
		throw new NodeOperationError(this.getNode(), 'Board ID must contain only digits', {
			itemIndex,
		});
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {};

	const name = additionalFields.name;
	if (name !== undefined && name !== '') {
		if (typeof name !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Name must be a string', { itemIndex });
		}
		body.name = name;
	}

	const description = additionalFields.description;
	if (description !== undefined && description !== '') {
		if (typeof description !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Description must be a string', { itemIndex });
		}
		body.description = description;
	}

	const privacy = additionalFields.privacy;
	if (privacy !== undefined && privacy !== '') {
		if (typeof privacy !== 'string' || !BOARD_UPDATE_PRIVACY_VALUES.includes(privacy)) {
			throw new NodeOperationError(
				this.getNode(),
				`Privacy must be one of: ${BOARD_UPDATE_PRIVACY_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		body.privacy = privacy;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'PATCH',
		url: `/boards/${boardId}`,
		body,
	};

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
