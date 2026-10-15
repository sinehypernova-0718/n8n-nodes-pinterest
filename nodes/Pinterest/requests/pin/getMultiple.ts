import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const APP_TYPE_VALUES = ['ALL', 'MOBILE', 'TABLET', 'WEB'];

const METRIC_TYPE_VALUES = [
	'IMPRESSION',
	'OUTBOUND_CLICK',
	'PIN_CLICK',
	'SAVE',
	'SAVE_RATE',
	'TOTAL_COMMENTS',
	'TOTAL_REACTIONS',
	'USER_FOLLOW',
	'PROFILE_VISIT',
	'VIDEO_MRC_VIEW',
	'VIDEO_10S_VIEW',
	'QUARTILE_95_PERCENT_VIEW',
	'VIDEO_V50_WATCH_TIME',
	'VIDEO_START',
	'VIDEO_AVG_WATCH_TIME',
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseUtcDate(value: string, fieldName: string, itemIndex: number, self: IExecuteFunctions): number {
	if (!DATE_PATTERN.test(value)) {
		throw new NodeOperationError(
			self.getNode(),
			`${fieldName} must be in YYYY-MM-DD format`,
			{ itemIndex },
		);
	}

	const timestamp = Date.parse(`${value}T00:00:00.000Z`);
	if (Number.isNaN(timestamp)) {
		throw new NodeOperationError(self.getNode(), `${fieldName} is not a valid calendar date`, {
			itemIndex,
		});
	}

	const normalized = new Date(timestamp).toISOString().slice(0, 10);
	if (normalized !== value) {
		throw new NodeOperationError(self.getNode(), `${fieldName} is not a valid calendar date`, {
			itemIndex,
		});
	}

	return timestamp;
}

export async function getMultiplePinsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const rawPinIds = (this.getNodeParameter('pinIds', itemIndex, '') as string).trim();
	if (!rawPinIds) {
		throw new NodeOperationError(this.getNode(), 'Pin IDs are required', { itemIndex });
	}

	const pinIds = rawPinIds.split(',').map((pinId) => pinId.trim());

	if (pinIds.some((pinId) => pinId === '')) {
		throw new NodeOperationError(this.getNode(), 'Pin IDs must not contain empty values', {
			itemIndex,
		});
	}
	if (pinIds.length > 100) {
		throw new NodeOperationError(
			this.getNode(),
			'Pin IDs must contain between 1 and 100 values',
			{ itemIndex },
		);
	}
	for (const pinId of pinIds) {
		if (!/^\d+$/.test(pinId)) {
			throw new NodeOperationError(
				this.getNode(),
				'Each Pin ID must contain only digits',
				{ itemIndex },
			);
		}
	}

	const startDate = (this.getNodeParameter('startDate', itemIndex, '') as string).trim();
	if (!startDate) {
		throw new NodeOperationError(this.getNode(), 'Start Date is required', { itemIndex });
	}
	const startTimestamp = parseUtcDate(startDate, 'Start Date', itemIndex, this);

	const endDate = (this.getNodeParameter('endDate', itemIndex, '') as string).trim();
	if (!endDate) {
		throw new NodeOperationError(this.getNode(), 'End Date is required', { itemIndex });
	}
	const endTimestamp = parseUtcDate(endDate, 'End Date', itemIndex, this);

	if (endTimestamp < startTimestamp) {
		throw new NodeOperationError(
			this.getNode(),
			'End Date must be on or after Start Date',
			{ itemIndex },
		);
	}
	if (endTimestamp - startTimestamp > 90 * DAY_IN_MS) {
		throw new NodeOperationError(
			this.getNode(),
			'End Date cannot be more than 90 days after Start Date',
			{ itemIndex },
		);
	}

	const todayStart = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
	if (startTimestamp < todayStart - 90 * DAY_IN_MS) {
		throw new NodeOperationError(
			this.getNode(),
			'Start Date cannot be more than 90 days before today',
			{ itemIndex },
		);
	}

	const appTypes = this.getNodeParameter('appTypes', itemIndex, 'ALL') as string;
	if (!APP_TYPE_VALUES.includes(appTypes)) {
		throw new NodeOperationError(
			this.getNode(),
			`App Types must be one of: ${APP_TYPE_VALUES.join(', ')}`,
			{ itemIndex },
		);
	}

	const metricTypes = this.getNodeParameter('metricTypes', itemIndex, []) as string[];
	if (!Array.isArray(metricTypes) || metricTypes.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one Metric Type is required', {
			itemIndex,
		});
	}
	for (const metricType of metricTypes) {
		if (typeof metricType !== 'string' || !METRIC_TYPE_VALUES.includes(metricType)) {
			throw new NodeOperationError(
				this.getNode(),
				`Metric Types contains an unsupported value: ${String(metricType)}`,
				{ itemIndex },
			);
		}
	}

	const qs: IDataObject = {
		pin_ids: pinIds,
		start_date: startDate,
		end_date: endDate,
		app_types: appTypes,
		metric_types: metricTypes.join(','),
	};

	const adAccountId = (this.getNodeParameter('adAccountId', itemIndex, '') as string).trim();
	if (adAccountId !== '') {
		if (!/^\d+$/.test(adAccountId) || adAccountId.length > 18) {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must contain only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		qs.ad_account_id = adAccountId;
	}

	return {
		method: 'GET',
		url: '/pins/analytics',
		qs,
		arrayFormat: 'repeat',
	};
}
