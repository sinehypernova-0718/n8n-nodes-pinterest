import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// TopPinsSortBy — required, 5 values
const SORT_BY_VALUES = ['ENGAGEMENT', 'SAVE', 'IMPRESSION', 'OUTBOUND_CLICK', 'PIN_CLICK'] as const;
const FROM_CLAIMED_CONTENT_VALUES = ['OTHER', 'CLAIMED', 'BOTH'] as const;
const PIN_FORMAT_VALUES = [
	'ALL',
	'ORGANIC_IMAGE',
	'ORGANIC_PRODUCT',
	'ORGANIC_VIDEO',
	'ADS_STANDARD',
	'ADS_PRODUCT',
	'ADS_VIDEO',
	'ADS_IDEA',
] as const;
const APP_TYPES_VALUES = ['ALL', 'MOBILE', 'TABLET', 'WEB'] as const;
const CONTENT_TYPE_VALUES = ['ALL', 'PAID', 'ORGANIC'] as const;
const SOURCE_VALUES = ['ALL', 'YOUR_PINS', 'OTHER_PINS'] as const;
// QuerymetrictypesItems
const METRIC_TYPES_VALUES = [
	'ENGAGEMENT',
	'ENGAGEMENT_RATE',
	'IMPRESSION',
	'OUTBOUND_CLICK',
	'OUTBOUND_CLICK_RATE',
	'PIN_CLICK',
	'PIN_CLICK_RATE',
	'SAVE',
	'SAVE_RATE',
] as const;

function parseAndValidateDate(
	value: string,
	fieldName: string,
	itemIndex: number,
	self: IExecuteFunctions,
): number {
	if (!DATE_PATTERN.test(value)) {
		throw new NodeOperationError(self.getNode(), `${fieldName} must be in YYYY-MM-DD format`, {
			itemIndex,
		});
	}
	const ts = Date.parse(`${value}T00:00:00.000Z`);
	if (Number.isNaN(ts)) {
		throw new NodeOperationError(self.getNode(), `${fieldName} is not a valid calendar date`, {
			itemIndex,
		});
	}
	const normalized = new Date(ts).toISOString().slice(0, 10);
	if (normalized !== value) {
		throw new NodeOperationError(self.getNode(), `${fieldName} is not a valid calendar date`, {
			itemIndex,
		});
	}
	return ts;
}

export async function getTopPinsAnalyticsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const startDateRaw = (this.getNodeParameter('startDate', itemIndex, '') as string).trim();
	if (!startDateRaw) {
		throw new NodeOperationError(this.getNode(), 'Start Date is required', { itemIndex });
	}
	const startTs = parseAndValidateDate(startDateRaw, 'Start Date', itemIndex, this);

	const endDateRaw = (this.getNodeParameter('endDate', itemIndex, '') as string).trim();
	if (!endDateRaw) {
		throw new NodeOperationError(this.getNode(), 'End Date is required', { itemIndex });
	}
	const endTs = parseAndValidateDate(endDateRaw, 'End Date', itemIndex, this);

	if (endTs < startTs) {
		throw new NodeOperationError(this.getNode(), 'End Date must be on or after Start Date', {
			itemIndex,
		});
	}

	const todayStart = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
	if (startTs < todayStart - 90 * DAY_IN_MS) {
		throw new NodeOperationError(
			this.getNode(),
			'Start Date cannot be more than 90 days before today',
			{ itemIndex },
		);
	}

	// sort_by is required for this endpoint
	const sortBy = (this.getNodeParameter('sortBy', itemIndex, '') as string).trim();
	if (!sortBy) {
		throw new NodeOperationError(this.getNode(), 'Sort By is required', { itemIndex });
	}
	if (!(SORT_BY_VALUES as readonly string[]).includes(sortBy)) {
		throw new NodeOperationError(
			this.getNode(),
			`Sort By must be one of: ${SORT_BY_VALUES.join(', ')}`,
			{ itemIndex },
		);
	}

	const qs: IDataObject = {
		start_date: startDateRaw,
		end_date: endDateRaw,
		sort_by: sortBy,
	};

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const fromClaimedContent = additionalFields.from_claimed_content;
	if (typeof fromClaimedContent === 'string' && fromClaimedContent !== '') {
		if (!(FROM_CLAIMED_CONTENT_VALUES as readonly string[]).includes(fromClaimedContent)) {
			throw new NodeOperationError(
				this.getNode(),
				`From Claimed Content must be one of: ${FROM_CLAIMED_CONTENT_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.from_claimed_content = fromClaimedContent;
	}

	const pinFormat = additionalFields.pin_format;
	if (typeof pinFormat === 'string' && pinFormat !== '') {
		if (!(PIN_FORMAT_VALUES as readonly string[]).includes(pinFormat)) {
			throw new NodeOperationError(
				this.getNode(),
				`Pin Format must be one of: ${PIN_FORMAT_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.pin_format = pinFormat;
	}

	const appTypes = additionalFields.app_types;
	if (typeof appTypes === 'string' && appTypes !== '') {
		if (!(APP_TYPES_VALUES as readonly string[]).includes(appTypes)) {
			throw new NodeOperationError(
				this.getNode(),
				`App Types must be one of: ${APP_TYPES_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.app_types = appTypes;
	}

	const contentType = additionalFields.content_type;
	if (typeof contentType === 'string' && contentType !== '') {
		if (!(CONTENT_TYPE_VALUES as readonly string[]).includes(contentType)) {
			throw new NodeOperationError(
				this.getNode(),
				`Content Type must be one of: ${CONTENT_TYPE_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.content_type = contentType;
	}

	const source = additionalFields.source;
	if (typeof source === 'string' && source !== '') {
		if (!(SOURCE_VALUES as readonly string[]).includes(source)) {
			throw new NodeOperationError(
				this.getNode(),
				`Source must be one of: ${SOURCE_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.source = source;
	}

	const metricTypes = additionalFields.metric_types;
	if (Array.isArray(metricTypes) && metricTypes.length > 0) {
		for (const m of metricTypes) {
			if (typeof m !== 'string' || !(METRIC_TYPES_VALUES as readonly string[]).includes(m)) {
				throw new NodeOperationError(
					this.getNode(),
					`Metric Types contains an unsupported value: ${String(m)}`,
					{ itemIndex },
				);
			}
		}
		qs.metric_types = (metricTypes as string[]).join(',');
	}

	const numOfPins = additionalFields.num_of_pins;
	if (numOfPins !== undefined && numOfPins !== '') {
		if (
			typeof numOfPins !== 'number' ||
			!Number.isInteger(numOfPins) ||
			numOfPins < 1 ||
			numOfPins > 50
		) {
			throw new NodeOperationError(
				this.getNode(),
				'Number of Pins must be an integer between 1 and 50',
				{ itemIndex },
			);
		}
		qs.num_of_pins = numOfPins;
	}

	// created_in_last_n_days: boolean checkbox in UI → sends value 30 when true
	if (additionalFields.created_in_last_n_days === true) {
		qs.created_in_last_n_days = 30;
	}

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
		qs.ad_account_id = trimmed;
	}

	return {
		method: 'GET',
		url: '/user_account/analytics/top_pins',
		qs,
	};
}
