import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// username pattern from OpenAPI: (?!^\d+$)^.+$ — cannot be all-digits
const USERNAME_ALL_DIGITS = /^\d+$/;

export async function followUserRequest(
	this: IExecuteFunctions,
	itemIndex: number,
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

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {};
	if (additionalFields.auto_follow === true) {
		body.auto_follow = true;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `/user_account/following/${encodeURIComponent(username)}`,
		body,
	};

	return requestOptions;
}
