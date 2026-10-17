import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const BOARD_CREATE_PRIVACY_VALUES = ['PUBLIC', 'PROTECTED', 'SECRET'];

export async function createBoardRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const name = (this.getNodeParameter('name', itemIndex, '') as string).trim();
	if (!name) {
		throw new NodeOperationError(this.getNode(), 'Name is required to create a board', {
			itemIndex,
		});
	}

	const privacy = this.getNodeParameter('privacy', itemIndex, 'PUBLIC') as string;
	if (typeof privacy !== 'string' || !BOARD_CREATE_PRIVACY_VALUES.includes(privacy)) {
		throw new NodeOperationError(
			this.getNode(),
			`Privacy must be one of: ${BOARD_CREATE_PRIVACY_VALUES.join(', ')}`,
			{ itemIndex },
		);
	}

	const isAdsOnly = this.getNodeParameter('is_ads_only', itemIndex, false) as boolean;
	if (typeof isAdsOnly !== 'boolean') {
		throw new NodeOperationError(this.getNode(), 'Is Ads Only must be a boolean', { itemIndex });
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {
		name,
		privacy,
		is_ads_only: isAdsOnly,
	};

	const description = additionalFields.description;
	if (description !== undefined && description !== '') {
		if (typeof description !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Description must be a string', { itemIndex });
		}
		body.description = description;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: '/boards',
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
