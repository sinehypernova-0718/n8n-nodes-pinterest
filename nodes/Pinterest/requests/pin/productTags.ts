import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const MAX_PRODUCT_TAGS = 24;

function readHeroPinId(
	value: unknown,
	action: string,
	itemIndex: number,
	self: IExecuteFunctions,
): string {
	if (value === undefined || value === null) {
		throw new NodeOperationError(self.getNode(), `Hero Pin ID is required to ${action}`, {
			itemIndex,
		});
	}
	if (typeof value !== 'string') {
		throw new NodeOperationError(self.getNode(), 'Hero Pin ID must be a string', { itemIndex });
	}
	const heroPinId = value.trim();
	if (heroPinId === '') {
		throw new NodeOperationError(self.getNode(), `Hero Pin ID is required to ${action}`, {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(heroPinId)) {
		throw new NodeOperationError(self.getNode(), 'Hero Pin ID must contain only digits', {
			itemIndex,
		});
	}
	return heroPinId;
}

function readProductPinIds(
	value: unknown,
	action: string,
	itemIndex: number,
	self: IExecuteFunctions,
): string[] {
	if (value === undefined || value === null || typeof value !== 'string') {
		throw new NodeOperationError(self.getNode(), 'Product Pin IDs must be a string', { itemIndex });
	}

	const trimmed = value.trim();
	if (trimmed === '') {
		throw new NodeOperationError(self.getNode(), `Product Pin IDs are required to ${action}`, {
			itemIndex,
		});
	}

	const productPinIds = trimmed.split(',').map((pinId) => pinId.trim());

	if (productPinIds.some((pinId) => pinId === '')) {
		throw new NodeOperationError(self.getNode(), 'Product Pin IDs must not contain empty values', {
			itemIndex,
		});
	}

	if (productPinIds.length > MAX_PRODUCT_TAGS) {
		throw new NodeOperationError(
			self.getNode(),
			`Product Pin IDs must contain between 1 and ${MAX_PRODUCT_TAGS} values`,
			{ itemIndex },
		);
	}

	for (const pinId of productPinIds) {
		if (!/^\d+$/.test(pinId)) {
			throw new NodeOperationError(
				self.getNode(),
				'Each Product Pin ID must contain only digits',
				{ itemIndex },
			);
		}
	}

	const seen = new Set<string>();
	const duplicates = new Set<string>();
	for (const pinId of productPinIds) {
		if (seen.has(pinId)) {
			duplicates.add(pinId);
		}
		seen.add(pinId);
	}

	if (duplicates.size > 0) {
		throw new NodeOperationError(
			self.getNode(),
			`Product Pin IDs must not contain duplicates: ${[...duplicates].join(', ')}`,
			{ itemIndex },
		);
	}

	return productPinIds;
}

function buildProductTagsBody(productPinIds: string[]): IDataObject {
	return {
		product_tags: productPinIds.map((pinId) => ({ pin_id: pinId })),
	};
}

export async function addProductTagsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const heroPinId = readHeroPinId(
		this.getNodeParameter('heroPinId', itemIndex, '') as unknown,
		'add product tags to a Pin',
		itemIndex,
		this,
	);
	const productPinIds = readProductPinIds(
		this.getNodeParameter('productPinIds', itemIndex, '') as unknown,
		'add product tags to a Pin',
		itemIndex,
		this,
	);

	return {
		method: 'POST',
		url: `/pins/${heroPinId}/product_tags`,
		body: buildProductTagsBody(productPinIds),
	};
}

export async function listProductTagsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const heroPinId = readHeroPinId(
		this.getNodeParameter('heroPinId', itemIndex, '') as unknown,
		'list product tags for a Pin',
		itemIndex,
		this,
	);

	return {
		method: 'GET',
		url: `/pins/${heroPinId}/product_tags`,
	};
}

export async function removeProductTagsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const heroPinId = readHeroPinId(
		this.getNodeParameter('heroPinId', itemIndex, '') as unknown,
		'remove product tags from a Pin',
		itemIndex,
		this,
	);
	const productPinIds = readProductPinIds(
		this.getNodeParameter('productPinIds', itemIndex, '') as unknown,
		'remove product tags from a Pin',
		itemIndex,
		this,
	);

	return {
		method: 'POST',
		url: `/pins/${heroPinId}/product_tags/bulk-delete`,
		body: buildProductTagsBody(productPinIds),
	};
}

/**
 * The bulk-delete endpoint returns HTTP 204 with no body. n8n's request helper
 * returns Axios response data unchanged, which is an empty string for an empty
 * 204 response. Normalize only that empty shape (and its nullish variants) to
 * an empty object so the node keeps its existing output convention. Any other
 * response body is passed through if it is an object and surfaced as an error
 * otherwise instead of being silently discarded.
 */
export function normalizeProductTagRemovalResponse(
	value: unknown,
	node: INode,
	itemIndex: number,
): IDataObject {
	if (value === undefined || value === null || value === '') {
		return {};
	}
	if (typeof value === 'object' && !Array.isArray(value)) {
		return value as IDataObject;
	}
	throw new NodeOperationError(
		node,
		'Pinterest returned an unexpected response body when removing product tags',
		{ itemIndex },
	);
}
