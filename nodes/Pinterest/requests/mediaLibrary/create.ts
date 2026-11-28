import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getBusinessId, parseAssetsJson } from './common';

export async function createMediaLibraryAssetsRequest(
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
		if (
			typeof asset.media_id !== 'string' ||
			!/^\d+$/.test(asset.media_id.trim()) ||
			typeof asset.name !== 'string' ||
			asset.name.trim() === ''
		) {
			throw new NodeOperationError(
				this.getNode(),
				`Asset ${index + 1} requires media_id as a string of digits and a non-empty name`,
				{ itemIndex },
			);
		}
		asset.media_id = asset.media_id.trim();
		asset.name = asset.name.trim();
		if (
			asset.tags !== undefined &&
			(!Array.isArray(asset.tags) || asset.tags.some((tag) => typeof tag !== 'string'))
		) {
			throw new NodeOperationError(
				this.getNode(),
				`Asset ${index + 1} tags must be an array of strings`,
				{ itemIndex },
			);
		}
		if (
			asset.ad_account_id !== undefined &&
			(typeof asset.ad_account_id !== 'string' || !/^\d{1,20}$/.test(asset.ad_account_id))
		) {
			throw new NodeOperationError(
				this.getNode(),
				`Asset ${index + 1} ad_account_id must contain up to 20 digits`,
				{ itemIndex },
			);
		}
	}
	return {
		method: 'POST',
		url: `/media_library/businesses/${businessId}/assets`,
		body: { assets },
	};
}
