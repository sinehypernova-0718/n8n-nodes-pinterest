import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const PIN_FILTER_VALUES = ['exclude_native', 'exclude_repins', 'has_been_promoted'];

const PIN_TYPE_VALUES = ['PRIVATE'];

const CREATIVE_TYPE_VALUES = [
	'REGULAR',
	'VIDEO',
	'SHOPPING',
	'CAROUSEL',
	'MAX_VIDEO',
	'SHOP_THE_PIN',
	'COLLECTION',
	'IDEA',
	'SHOWCASE',
	'QUIZ',
	'COLLAGE',
	'MAX_WIDTH_REGULAR_COLLECTION',
	'MAX_WIDTH_VIDEO_COLLECTION',
	'APP',
];

export async function listPinsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {};

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

	const pinFilter = additionalFields.pin_filter;
	if (pinFilter !== undefined && pinFilter !== '') {
		if (typeof pinFilter !== 'string' || !PIN_FILTER_VALUES.includes(pinFilter)) {
			throw new NodeOperationError(
				this.getNode(),
				`Pin Filter must be one of: ${PIN_FILTER_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.pin_filter = pinFilter;
	}

	if (additionalFields.pin_metrics === true) {
		qs.pin_metrics = true;
	}

	if (additionalFields.include_protected_pins === true) {
		qs.include_protected_pins = true;
	}

	const pinType = additionalFields.pin_type;
	if (pinType !== undefined && pinType !== '') {
		if (typeof pinType !== 'string' || !PIN_TYPE_VALUES.includes(pinType)) {
			throw new NodeOperationError(
				this.getNode(),
				`Pin Type must be one of: ${PIN_TYPE_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.pin_type = pinType;
	}

	const creativeTypes = additionalFields.creative_types;
	if (Array.isArray(creativeTypes) && creativeTypes.length > 0) {
		for (const value of creativeTypes) {
			if (typeof value !== 'string' || !CREATIVE_TYPE_VALUES.includes(value)) {
				throw new NodeOperationError(
					this.getNode(),
					`Creative Types contains an unsupported value: ${String(value)}`,
					{ itemIndex },
				);
			}
		}
		qs.creative_types = creativeTypes.join(',');
	}

	const adAccountId = additionalFields.ad_account_id;
	if (typeof adAccountId === 'string' && adAccountId.trim() !== '') {
		const trimmedAdAccountId = adAccountId.trim();
		if (!/^\d+$/.test(trimmedAdAccountId) || trimmedAdAccountId.length > 18) {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must contain only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		qs.ad_account_id = trimmedAdAccountId;
	}

	const domain = additionalFields.domain;
	if (typeof domain === 'string' && domain.trim() !== '') {
		qs.domain = domain.trim();
	}

	const domains = additionalFields.domains;
	if (typeof domains === 'string' && domains.trim() !== '') {
		const domainList = domains.split(',').map((entry) => entry.trim());
		if (domainList.some((entry) => entry === '') || domainList.length > 100) {
			throw new NodeOperationError(
				this.getNode(),
				'Domains must contain between 1 and 100 non-empty comma-separated values',
				{ itemIndex },
			);
		}
		qs.domains = domainList.join(',');
	}

	if (additionalFields.include_product_tag_obj === true) {
		qs.include_product_tag_obj = true;
	}

	const pageBookmark = bookmark ?? additionalFields.bookmark;
	if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
		qs.bookmark = pageBookmark.trim();
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: '/pins',
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return requestOptions;
}
