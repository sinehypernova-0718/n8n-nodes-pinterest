import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

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
// QuerymetrictypesItems — different from pin analytics metric types
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
// split_field for user account analytics — 5 values, different from pin analytics
const SPLIT_FIELD_VALUES = ['NO_SPLIT', 'APP_TYPE', 'OWNED_CONTENT', 'SOURCE', 'PIN_FORMAT'] as const;

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

function validateAdAccountId(value: unknown, itemIndex: number, self: IExecuteFunctions): string {
	if (typeof value !== 'string') {
		throw new NodeOperationError(self.getNode(), 'Ad Account ID must be a string', { itemIndex });
	}
	const trimmed = value.trim();
	if (trimmed === '') return '';
	if (!/^\d+$/.test(trimmed) || trimmed.length > 18) {
		throw new NodeOperationError(
			self.getNode(),
			'Ad Account ID must contain only digits and be at most 18 characters',
			{ itemIndex },
		);
	}
	return trimmed;
}

export async function getAnalyticsRequest(
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

	const qs: IDataObject = {
		start_date: startDateRaw,
		end_date: endDateRaw,
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

	const splitField = additionalFields.split_field;
	if (typeof splitField === 'string' && splitField !== '') {
		if (!(SPLIT_FIELD_VALUES as readonly string[]).includes(splitField)) {
			throw new NodeOperationError(
				this.getNode(),
				`Split Field must be one of: ${SPLIT_FIELD_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.split_field = splitField;
	}

	const adAccountId = validateAdAccountId(
		additionalFields.ad_account_id ?? '',
		itemIndex,
		this,
	);
	if (adAccountId !== '') {
		qs.ad_account_id = adAccountId;
	}

	return {
		method: 'GET',
		url: '/user_account/analytics',
		qs,
	};
}
