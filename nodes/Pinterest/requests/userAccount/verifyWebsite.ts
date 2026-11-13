import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const VERIFICATION_METHOD_VALUES = ['FILENAME', 'METATAG', 'DNSTXT'] as const;

export async function verifyWebsiteRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const website = (this.getNodeParameter('website', itemIndex, '') as string).trim();
	if (!website) {
		throw new NodeOperationError(this.getNode(), 'Website is required', { itemIndex });
	}

	const verificationMethod = this.getNodeParameter(
		'verificationMethod',
		itemIndex,
		'METATAG',
	) as string;
	if (!(VERIFICATION_METHOD_VALUES as readonly string[]).includes(verificationMethod)) {
		throw new NodeOperationError(
			this.getNode(),
			`Verification Method must be one of: ${VERIFICATION_METHOD_VALUES.join(', ')}`,
			{ itemIndex },
		);
	}

	const body: IDataObject = {
		website,
		verification_method: verificationMethod,
	};

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: '/user_account/websites',
		body,
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
