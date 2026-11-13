import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// username pattern from OpenAPI: (?!^\d+$)^.+$ — cannot be all-digits
const USERNAME_ALL_DIGITS = /^\d+$/;

export async function listFollowingInterestsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const username = (this.getNodeParameter('username', itemIndex, '') as string).trim();
	if (!username) {
		throw new NodeOperationError(this.getNode(), 'Username is required', { itemIndex });
	}
	if (USERNAME_ALL_DIGITS.test(username)) {
		throw new NodeOperationError(
			this.getNode(),
			'Username must not be all digits — provide a valid Pinterest username',
			{ itemIndex },
		);
	}

	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;

	const qs: IDataObject = {};

	if (returnAll) {
		qs.page_size = 250;
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 25) as number;
		if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
			throw new NodeOperationError(
				this.getNode(),
				'Limit must be an integer between 1 and 250',
				{ itemIndex },
			);
		}
		qs.page_size = limit;
	}

	if (typeof bookmark === 'string' && bookmark.trim() !== '') {
		qs.bookmark = bookmark.trim();
	}

	return {
		method: 'GET',
		url: `/users/${encodeURIComponent(username)}/interests/follow`,
		qs,
	};
}
