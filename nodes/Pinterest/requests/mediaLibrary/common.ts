import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function getBusinessId(this: IExecuteFunctions, itemIndex: number): string {
	const rawBusinessId = this.getNodeParameter('businessId', itemIndex, '');
	if (typeof rawBusinessId !== 'string' || !/^\d{1,20}$/.test(rawBusinessId.trim())) {
		throw new NodeOperationError(
			this.getNode(),
			'Business ID must contain only digits and be at most 20 characters',
			{ itemIndex },
		);
	}
	return rawBusinessId.trim();
}

export function getAssetIds(
	value: unknown,
	itemIndex: number,
	node: ReturnType<IExecuteFunctions['getNode']>,
): string[] {
	if (typeof value !== 'string') {
		throw new NodeOperationError(node, 'Asset IDs must be a comma-separated list of numeric IDs', {
			itemIndex,
		});
	}
	const ids = value
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
	if (ids.length < 1 || ids.length > 100 || ids.some((id) => !/^\d{1,20}$/.test(id))) {
		throw new NodeOperationError(node, 'Provide between 1 and 100 numeric asset IDs', {
			itemIndex,
		});
	}
	return ids;
}

export function parseAssetsJson(
	value: unknown,
	itemIndex: number,
	node: ReturnType<IExecuteFunctions['getNode']>,
): IDataObject[] {
	let parsed: unknown = value;
	if (typeof value === 'string') {
		try {
			parsed = JSON.parse(value);
		} catch {
			throw new NodeOperationError(node, 'Assets must be valid JSON', { itemIndex });
		}
	}
	if (
		!Array.isArray(parsed) ||
		parsed.length < 1 ||
		parsed.length > 100 ||
		parsed.some((entry) => entry === null || typeof entry !== 'object' || Array.isArray(entry))
	) {
		throw new NodeOperationError(node, 'Assets must be a JSON array containing 1 to 100 objects', {
			itemIndex,
		});
	}
	return parsed as IDataObject[];
}

export function splitCsv(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((entry): entry is string => typeof entry === 'string')
			.map((entry) => entry.trim())
			.filter(Boolean);
	}
	if (typeof value !== 'string' || value.trim() === '') return [];
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}
