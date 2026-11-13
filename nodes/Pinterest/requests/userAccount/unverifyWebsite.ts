import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function unverifyWebsiteRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const website = (this.getNodeParameter('website', itemIndex, '') as string).trim();
	if (!website) {
		throw new NodeOperationError(
			this.getNode(),
			'Website is required to unverify a website',
			{ itemIndex },
		);
	}

	return {
		method: 'DELETE',
		url: '/user_account/websites',
		qs: { website } as IDataObject,
	};
}
