import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getAssetIds, getBusinessId } from './common';

export async function deleteMediaLibraryAssetsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const businessId = getBusinessId.call(this, itemIndex);
	const assetIds = getAssetIds(
		this.getNodeParameter('assetIds', itemIndex, ''),
		itemIndex,
		this.getNode(),
	);
	return {
		method: 'DELETE',
		url: `/media_library/businesses/${businessId}/assets`,
		qs: { asset_ids: assetIds },
		arrayFormat: 'repeat',
	};
}

export function normalizeMediaLibraryAssetDeletion(
	value: unknown,
	node: INode,
	itemIndex: number,
): IDataObject {
	if (value === undefined || value === null || value === '') return {};
	if (typeof value === 'object' && !Array.isArray(value)) return value as IDataObject;
	throw new NodeOperationError(
		node,
		'Pinterest returned an unexpected response body when removing media library assets',
		{ itemIndex },
	);
}
