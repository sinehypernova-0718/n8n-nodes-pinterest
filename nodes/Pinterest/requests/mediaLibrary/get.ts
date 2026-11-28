import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getBusinessId } from './common';

export async function getMediaLibraryAssetRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const businessId = getBusinessId.call(this, itemIndex);
	const assetId = this.getNodeParameter('assetId', itemIndex, '');
	if (typeof assetId !== 'string' || !/^\d{1,20}$/.test(assetId.trim())) {
		throw new NodeOperationError(this.getNode(), 'Asset ID must contain only digits', {
			itemIndex,
		});
	}
	return { method: 'GET', url: `/media_library/businesses/${businessId}/assets/${assetId.trim()}` };
}
