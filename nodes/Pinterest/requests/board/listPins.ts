import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

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

export async function listBoardPinsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const rawBoardId = this.getNodeParameter('boardId', itemIndex, '');
	if (typeof rawBoardId !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Board ID must be a string', { itemIndex });
	}
	const boardId = rawBoardId.trim();
	if (!boardId) {
		throw new NodeOperationError(this.getNode(), 'Board ID is required to list board Pins', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(boardId)) {
		throw new NodeOperationError(this.getNode(), 'Board ID must contain only digits', {
			itemIndex,
		});
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {};

	const pageSize = additionalFields.page_size;
	if (pageSize !== undefined && pageSize !== '') {
		if (
			typeof pageSize !== 'number' ||
			!Number.isInteger(pageSize) ||
			pageSize < 1 ||
			pageSize > 250
		) {
			throw new NodeOperationError(
				this.getNode(),
				'Page Size must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = pageSize;
	}

	const creativeTypes = additionalFields.creative_types;
	if (creativeTypes !== undefined && creativeTypes !== '') {
		if (!Array.isArray(creativeTypes)) {
			throw new NodeOperationError(
				this.getNode(),
				'Creative Types must be an array of creative type values',
				{ itemIndex },
			);
		}
		if (creativeTypes.length > 0) {
			for (const value of creativeTypes) {
				if (typeof value !== 'string' || !CREATIVE_TYPE_VALUES.includes(value)) {
					throw new NodeOperationError(
						this.getNode(),
						`Creative Types contains an unsupported value: ${String(value)}`,
						{ itemIndex },
					);
				}
			}
			qs.creative_types = creativeTypes;
		}
	}

	const pinMetrics = additionalFields.pin_metrics;
	if (pinMetrics !== undefined) {
		if (typeof pinMetrics !== 'boolean') {
			throw new NodeOperationError(this.getNode(), 'Pin Metrics must be a boolean', {
				itemIndex,
			});
		}
		qs.pin_metrics = pinMetrics;
	}

	const adAccountId = additionalFields.ad_account_id;
	if (adAccountId !== undefined && adAccountId !== '') {
		if (typeof adAccountId !== 'string') {
			throw new NodeOperationError(
				this.getNode(),
				'Ad Account ID must be a string containing only digits and be at most 18 characters',
				{ itemIndex },
			);
		}
		const trimmedAdAccountId = adAccountId.trim();
		if (trimmedAdAccountId !== '') {
			if (!/^\d+$/.test(trimmedAdAccountId) || trimmedAdAccountId.length > 18) {
				throw new NodeOperationError(
					this.getNode(),
					'Ad Account ID must contain only digits and be at most 18 characters',
					{ itemIndex },
				);
			}
			qs.ad_account_id = trimmedAdAccountId;
		}
	}

	const pageBookmark = bookmark ?? additionalFields.bookmark;
	if (pageBookmark !== undefined && pageBookmark !== '') {
		if (typeof pageBookmark !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Bookmark must be a string', { itemIndex });
		}
		qs.bookmark = pageBookmark;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: `/boards/${boardId}/pins`,
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	if (Array.isArray(qs.creative_types)) {
		requestOptions.arrayFormat = 'repeat';
	}

	return requestOptions;
}
