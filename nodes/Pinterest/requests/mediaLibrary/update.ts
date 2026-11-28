import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getBusinessId, parseAssetsJson } from './common';

export async function updateMediaLibraryAssetsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const businessId = getBusinessId.call(this, itemIndex);
	const assets = parseAssetsJson(
		this.getNodeParameter('assets', itemIndex, ''),
		itemIndex,
		this.getNode(),
	);
	for (const [index, asset] of assets.entries()) {
		if (typeof asset.asset_id !== 'string' || !/^\d{1,20}$/.test(asset.asset_id.trim())) {
			throw new NodeOperationError(
				this.getNode(),
				`Asset ${index + 1} requires a numeric asset_id`,
				{ itemIndex },
			);
		}
		if (
			(asset.name === undefined || asset.name === null) &&
			(asset.tags === undefined || asset.tags === null)
		) {
			throw new NodeOperationError(this.getNode(), `Asset ${index + 1} must include name or tags`, {
				itemIndex,
			});
		}
		asset.asset_id = asset.asset_id.trim();
		if (
			asset.name !== undefined &&
			asset.name !== null &&
			(typeof asset.name !== 'string' || asset.name.trim() === '')
		) {
			throw new NodeOperationError(this.getNode(), `Asset ${index + 1} name cannot be empty`, {
				itemIndex,
			});
		}
		if (
			asset.tags !== undefined &&
			asset.tags !== null &&
			(!Array.isArray(asset.tags) || asset.tags.some((tag) => typeof tag !== 'string'))
		) {
			throw new NodeOperationError(
				this.getNode(),
				`Asset ${index + 1} tags must be an array of strings`,
				{ itemIndex },
			);
		}
		if (typeof asset.name === 'string') asset.name = asset.name.trim();
	}
	return {
		method: 'PATCH',
		url: `/media_library/businesses/${businessId}/assets`,
		body: { assets },
	};
}
