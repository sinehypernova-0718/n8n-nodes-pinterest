import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

function readNumericId(
	value: unknown,
	label: string,
	itemIndex: number,
	self: IExecuteFunctions,
): string | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	if (typeof value !== 'string') {
		throw new NodeOperationError(self.getNode(), `${label} must be a string`, { itemIndex });
	}
	const trimmed = value.trim();
	if (trimmed === '') {
		return undefined;
	}
	if (!/^\d+$/.test(trimmed)) {
		throw new NodeOperationError(self.getNode(), `${label} must contain only digits`, {
			itemIndex,
		});
	}
	return trimmed;
}

export async function savePinRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const pinIdValue = this.getNodeParameter('pinId', itemIndex, '') as unknown;
	if (typeof pinIdValue !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Pin ID must be a string', { itemIndex });
	}
	const pinId = pinIdValue.trim();
	if (!pinId) {
		throw new NodeOperationError(this.getNode(), 'Pin ID is required to save a Pin', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(pinId)) {
		throw new NodeOperationError(this.getNode(), 'Pin ID must contain only digits', { itemIndex });
	}

	const boardId = readNumericId(
		this.getNodeParameter('boardId', itemIndex, ''),
		'Board ID',
		itemIndex,
		this,
	);
	const boardSectionId = readNumericId(
		this.getNodeParameter('boardSectionId', itemIndex, ''),
		'Board Section ID',
		itemIndex,
		this,
	);

	if (boardId === undefined && boardSectionId === undefined) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one of Board ID or Board Section ID is required to save a Pin',
			{ itemIndex },
		);
	}

	const body: IDataObject = {};
	if (boardId !== undefined) {
		body.board_id = boardId;
	}
	if (boardSectionId !== undefined) {
		body.board_section_id = boardSectionId;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `/pins/${pinId}/save`,
		body,
	};

	const adAccountIdValue = this.getNodeParameter('adAccountId', itemIndex, '') as unknown;
	if (adAccountIdValue !== undefined && adAccountIdValue !== null) {
		if (typeof adAccountIdValue !== 'string') {
			throw new NodeOperationError(this.getNode(), 'Ad Account ID must be a string', { itemIndex });
		}
		const adAccountId = adAccountIdValue.trim();
		if (adAccountId !== '') {
			if (!/^\d+$/.test(adAccountId) || adAccountId.length > 18) {
				throw new NodeOperationError(
					this.getNode(),
					'Ad Account ID must contain only digits and be at most 18 characters',
					{ itemIndex },
				);
			}
			requestOptions.qs = { ad_account_id: adAccountId };
		}
	}

	return requestOptions;
}
