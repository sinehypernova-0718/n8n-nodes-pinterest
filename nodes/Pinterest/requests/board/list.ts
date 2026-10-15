import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const PRIVACY_FILTER_VALUES = [
  'ALL',
  'PUBLIC',
  'PROTECTED',
  'SECRET',
  'PUBLIC_AND_SECRET'
];

export async function listBoardsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
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

	const privacy = additionalFields.privacy;
	if (privacy !== undefined && privacy !== '') {
		if (typeof privacy !== 'string' || !PRIVACY_FILTER_VALUES.includes(privacy)) {
			throw new NodeOperationError(
				this.getNode(),
				`Privacy must be one of: ${PRIVACY_FILTER_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.privacy = privacy;
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
	if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
		qs.bookmark = pageBookmark.trim();
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: '/boards',
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return requestOptions;
}
