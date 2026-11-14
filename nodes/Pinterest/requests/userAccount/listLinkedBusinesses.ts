import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

export async function listLinkedBusinessesRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	void itemIndex;
	// No parameters — raw array response (not paginated)
	return {
		method: 'GET',
		url: '/user_account/businesses',
	};
}
