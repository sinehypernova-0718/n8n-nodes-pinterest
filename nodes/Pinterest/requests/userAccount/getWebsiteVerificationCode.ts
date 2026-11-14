import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function getWebsiteVerificationCodeRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: '/user_account/websites/verification',
	};

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const adAccountId = additionalFields.ad_account_id;
	if (typeof adAccountId === 'string' && adAccountId.trim() !== '') {
		const trimmed = adAccountId.trim();
		if (!/^\d+$/.test(trimmed) || trimmed.length > 18) {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must contain only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		requestOptions.qs = { ad_account_id: trimmed };
	}

	return requestOptions;
}
