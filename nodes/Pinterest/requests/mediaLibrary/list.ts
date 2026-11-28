import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getBusinessId, splitCsv } from './common';

export async function listMediaLibraryAssetsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	paginationToken?: string,
): Promise<IHttpRequestOptions> {
	const businessId = getBusinessId.call(this, itemIndex);
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false);
	if (typeof returnAll !== 'boolean') {
		throw new NodeOperationError(this.getNode(), 'Return All must be a boolean', { itemIndex });
	}
	const qs: IDataObject = {
		page_size: returnAll ? 250 : this.getNodeParameter('limit', itemIndex, 50),
	};
	const pageSize = qs.page_size;
	if (
		typeof pageSize !== 'number' ||
		!Number.isInteger(pageSize) ||
		pageSize < 1 ||
		pageSize > 250
	) {
		throw new NodeOperationError(this.getNode(), 'Limit must be an integer between 1 and 250', {
			itemIndex,
		});
	}
	const additional = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	for (const key of ['names', 'asset_ids', 'asset_types', 'tags'] as const) {
		if (
			Array.isArray(additional[key]) &&
			additional[key].some((entry) => typeof entry !== 'string')
		) {
			throw new NodeOperationError(this.getNode(), `${key} must contain only strings`, {
				itemIndex,
			});
		}
		const values = splitCsv(additional[key]);
		if (values.length) {
			if (key === 'asset_ids' && values.some((id) => !/^\d{1,20}$/.test(id))) {
				throw new NodeOperationError(this.getNode(), 'Asset IDs must contain only digits', {
					itemIndex,
				});
			}
			if (key === 'asset_types' && values.some((type) => !['IMAGE', 'VIDEO'].includes(type))) {
				throw new NodeOperationError(this.getNode(), 'Asset types must be IMAGE or VIDEO', {
					itemIndex,
				});
			}
			qs[key] = values;
		}
	}
	for (const key of ['has_been_promoted', 'from_date', 'to_date', 'sort_order'] as const) {
		const value = additional[key];
		if (value !== undefined && value !== '') {
			if (
				(key === 'from_date' || key === 'to_date') &&
				(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
			) {
				throw new NodeOperationError(this.getNode(), `${key} must use YYYY-MM-DD format`, {
					itemIndex,
				});
			}
			if (key === 'sort_order' && !['ASC', 'DESC'].includes(value as string)) {
				throw new NodeOperationError(this.getNode(), 'Sort order must be ASC or DESC', {
					itemIndex,
				});
			}
			qs[key] = value;
		}
	}
	const token = paginationToken ?? additional.pagination_token;
	if (typeof token === 'string' && token !== '') qs.pagination_token = token;
	return {
		method: 'GET',
		url: `/media_library/businesses/${businessId}/assets`,
		qs,
		arrayFormat: 'repeat',
	};
}
