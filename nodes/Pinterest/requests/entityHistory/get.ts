import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// order — from the OpenAPI spec enum
const ORDER_VALUES = ['ASCENDING', 'DESCENDING'] as const;

// Unix timestamps are integers (seconds) in the OpenAPI spec
const UNIX_TIMESTAMP_PATTERN = /^\d+$/;

function parseUnixTimestamp(
	value: unknown,
	fieldName: string,
	itemIndex: number,
	self: IExecuteFunctions,
): number {
	if (typeof value !== 'string' && typeof value !== 'number') {
		throw new NodeOperationError(self.getNode(), `${fieldName} must be a Unix timestamp`, {
			itemIndex,
		});
	}

	const normalized = String(value).trim();
	if (normalized === '') {
		throw new NodeOperationError(self.getNode(), `${fieldName} is required`, { itemIndex });
	}

	if (!UNIX_TIMESTAMP_PATTERN.test(normalized)) {
		throw new NodeOperationError(
			self.getNode(),
			`${fieldName} must be a Unix timestamp in seconds`,
			{ itemIndex },
		);
	}

	return Number(normalized);
}

function parseUserIdFilter(
	value: unknown,
	itemIndex: number,
	self: IExecuteFunctions,
): number {
	if (typeof value !== 'string' && typeof value !== 'number') {
		throw new NodeOperationError(self.getNode(), 'User ID Filter must be an integer', {
			itemIndex,
		});
	}

	const normalized = String(value).trim();
	if (!/^\d+$/.test(normalized)) {
		throw new NodeOperationError(self.getNode(), 'User ID Filter must be an integer', {
			itemIndex,
		});
	}

	return Number(normalized);
}

function parseCommaSeparatedList(
	value: unknown,
	fieldName: string,
	itemIndex: number,
	self: IExecuteFunctions,
): string[] {
	if (value === undefined || value === null) return [];

	if (Array.isArray(value)) {
		const entries = value.map((entry) => (typeof entry === 'string' ? entry.trim() : ''));
		if (entries.some((entry) => entry === '')) {
			throw new NodeOperationError(
				self.getNode(),
				`${fieldName} must not contain empty values`,
				{ itemIndex },
			);
		}
		return entries;
	}

	if (typeof value !== 'string') {
		throw new NodeOperationError(self.getNode(), `${fieldName} must be a string`, { itemIndex });
	}

	const trimmed = value.trim();
	if (trimmed === '') return [];

	const entries = trimmed.split(',').map((entry) => entry.trim());
	if (entries.some((entry) => entry === '')) {
		throw new NodeOperationError(
			self.getNode(),
			`${fieldName} must be a comma-separated list without empty values`,
			{ itemIndex },
		);
	}

	return entries;
}

export async function getEntityHistoryRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const adAccountId = (this.getNodeParameter('ad_account_id', itemIndex, '') as string).trim();
	if (!adAccountId) {
		throw new NodeOperationError(this.getNode(), 'Ad Account ID is required', { itemIndex });
	}
	if (!/^\d+$/.test(adAccountId) || adAccountId.length > 18) {
		throw new NodeOperationError(
			this.getNode(),
			'Ad Account ID must contain only digits and be at most 18 characters',
			{ itemIndex },
		);
	}

	const entityId = (this.getNodeParameter('entity_id', itemIndex, '') as string).trim();
	if (!entityId) {
		throw new NodeOperationError(this.getNode(), 'Entity ID is required', { itemIndex });
	}

	const startTime = parseUnixTimestamp(
		this.getNodeParameter('start_time', itemIndex, ''),
		'Start Time',
		itemIndex,
		this,
	);
	const endTime = parseUnixTimestamp(
		this.getNodeParameter('end_time', itemIndex, ''),
		'End Time',
		itemIndex,
		this,
	);

	if (endTime < startTime) {
		throw new NodeOperationError(this.getNode(), 'End Time must be on or after Start Time', {
			itemIndex,
		});
	}

	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;

	const qs: IDataObject = {
		ad_account_id: adAccountId,
		entity_id: entityId,
		start_time: startTime,
		end_time: endTime,
	};

	if (returnAll) {
		qs.page_size = 250;
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
		if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
			throw new NodeOperationError(
				this.getNode(),
				'Limit must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = limit;
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const entityIds = parseCommaSeparatedList(
		additionalFields.entity_ids,
		'Entity IDs',
		itemIndex,
		this,
	);
	if (entityIds.length > 0) {
		qs.entity_ids = entityIds.join(',');
	}

	const fieldFilters = parseCommaSeparatedList(
		additionalFields.field_filters,
		'Field Filters',
		itemIndex,
		this,
	);
	if (fieldFilters.length > 0) {
		qs.field_filters = fieldFilters.join(',');
	}

	const advertiserId = additionalFields.advertiser_id;
	if (typeof advertiserId === 'string' && advertiserId.trim() !== '') {
		qs.advertiser_id = advertiserId.trim();
	}

	const userIdFilter = additionalFields.user_id_filter;
	if (userIdFilter !== undefined && userIdFilter !== '' && userIdFilter !== null) {
		qs.user_id_filter = parseUserIdFilter(userIdFilter, itemIndex, this);
	}

	const order = this.getNodeParameter('order', itemIndex, '');
	if (order !== undefined && order !== '') {
		if (typeof order !== 'string' || !(ORDER_VALUES as readonly string[]).includes(order)) {
			throw new NodeOperationError(
				this.getNode(),
				`Order must be one of: ${ORDER_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.order = order;
	}

	const pageBookmark = bookmark ?? additionalFields.bookmark;
	if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
		qs.bookmark = pageBookmark.trim();
	}

	return {
		method: 'GET',
		url: '/ad_accounts/entity_history',
		qs,
	};
}
