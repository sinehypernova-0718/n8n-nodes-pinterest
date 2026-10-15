import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function deletePinRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const pinId = (this.getNodeParameter('pinId', itemIndex, '') as string).trim();
	if (!pinId) {
		throw new NodeOperationError(this.getNode(), 'Pin ID is required to delete a Pin', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(pinId)) {
		throw new NodeOperationError(this.getNode(), 'Pin ID must contain only digits', { itemIndex });
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'DELETE',
		url: `/pins/${pinId}`,
	};

	const adAccountId = (this.getNodeParameter('adAccountId', itemIndex, '') as string).trim();
	if (adAccountId !== '') {
		if (!/^\d+$/.test(adAccountId) || adAccountId.length > 18) {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must contain only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		requestOptions.qs = { ad_account_id: adAccountId };
	}

	return requestOptions;
}
