import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function getPinRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const pinId = (this.getNodeParameter('pinId', itemIndex, '') as string).trim();
	if (!pinId) {
		throw new NodeOperationError(this.getNode(), 'Pin ID is required to get a Pin', { itemIndex });
	}
	if (!/^\d+$/.test(pinId)) {
		throw new NodeOperationError(this.getNode(), 'Pin ID must contain only digits', { itemIndex });
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: `/pins/${pinId}`,
	};

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {};

	const adAccountId = additionalFields.ad_account_id;
	if (typeof adAccountId === 'string' && adAccountId.trim() !== '') {
		const trimmedAdAccountId = adAccountId.trim();
		if (!/^\d+$/.test(trimmedAdAccountId) || trimmedAdAccountId.length > 18) {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must contain only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		qs.ad_account_id = trimmedAdAccountId;
	}

	if (additionalFields.pin_metrics === true) {
		qs.pin_metrics = true;
	}

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return requestOptions;
}
