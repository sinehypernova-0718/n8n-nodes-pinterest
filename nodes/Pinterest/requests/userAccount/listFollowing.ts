import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const FEED_TYPE_VALUES = ['ALL', 'RANKED', 'CREATOR_ONLY', 'RANKED_CREATOR_ONLY'] as const;

export async function listFollowingRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;

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

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

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

	if (additionalFields.explicit_following === true) {
		qs.explicit_following = true;
	}

	const feedType = additionalFields.feed_type;
	if (typeof feedType === 'string' && feedType !== '') {
		if (!(FEED_TYPE_VALUES as readonly string[]).includes(feedType)) {
			throw new NodeOperationError(
				this.getNode(),
				`Feed Type must be one of: ${FEED_TYPE_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.feed_type = feedType;
	}

	if (typeof bookmark === 'string' && bookmark.trim() !== '') {
		qs.bookmark = bookmark.trim();
	}

	return {
		method: 'GET',
		url: '/user_account/following',
		qs,
	};
}
