import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const AI_DISCLOSURE_VALUES = ['AI_MODIFIED', 'SYNTHETIC_PERFORMER'];

const CAROUSEL_SLOT_FIELDS = ['description', 'link', 'title'] as const;

const STRING_FIELDS: Array<{ field: string; label: string; maxLength: number }> = [
	{ field: 'title', label: 'Title', maxLength: 100 },
	{ field: 'description', label: 'Description', maxLength: 800 },
	{ field: 'alt_text', label: 'Alt Text', maxLength: 500 },
	{ field: 'link', label: 'Link', maxLength: 2048 },
];

const NUMERIC_ID_FIELDS: Array<{ field: string; label: string }> = [
	{ field: 'board_id', label: 'Board ID' },
	{ field: 'board_section_id', label: 'Board Section ID' },
];

function parseCarouselSlots(
	value: unknown,
	itemIndex: number,
	self: IExecuteFunctions,
): IDataObject[] {
	let parsed: unknown = value;

	if (typeof parsed === 'string') {
		const trimmed = parsed.trim();
		if (trimmed === '') {
			return [];
		}
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			throw new NodeOperationError(
				self.getNode(),
				'Carousel Slots must be valid JSON',
				{ itemIndex },
			);
		}
	}

	if (!Array.isArray(parsed)) {
		throw new NodeOperationError(self.getNode(), 'Carousel Slots must be a JSON array', {
			itemIndex,
		});
	}

	for (const slot of parsed) {
		if (typeof slot !== 'object' || slot === null || Array.isArray(slot)) {
			throw new NodeOperationError(
				self.getNode(),
				'Each Carousel Slot must be a JSON object',
				{ itemIndex },
			);
		}
		for (const field of CAROUSEL_SLOT_FIELDS) {
			const fieldValue = (slot as IDataObject)[field];
			if (fieldValue !== undefined && typeof fieldValue !== 'string') {
				throw new NodeOperationError(
					self.getNode(),
					`Carousel Slot "${field}" must be a string`,
					{ itemIndex },
				);
			}
		}
	}

	return parsed as IDataObject[];
}

export async function updatePinRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const pinId = (this.getNodeParameter('pinId', itemIndex, '') as string).trim();
	if (!pinId) {
		throw new NodeOperationError(this.getNode(), 'Pin ID is required to update a Pin', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(pinId)) {
		throw new NodeOperationError(this.getNode(), 'Pin ID must contain only digits', { itemIndex });
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {};

	for (const { field, label, maxLength } of STRING_FIELDS) {
		const value = additionalFields[field];
		if (value === undefined || value === '') {
			continue;
		}
		if (typeof value !== 'string') {
			throw new NodeOperationError(this.getNode(), `${label} must be a string`, { itemIndex });
		}
		if (value.length > maxLength) {
			throw new NodeOperationError(
				this.getNode(),
				`${label} must be at most ${maxLength} characters`,
				{ itemIndex },
			);
		}
		body[field] = value;
	}

	for (const { field, label } of NUMERIC_ID_FIELDS) {
		const value = additionalFields[field];
		if (value === undefined || value === '') {
			continue;
		}
		if (typeof value !== 'string' || !/^\d+$/.test(value)) {
			throw new NodeOperationError(
				this.getNode(),
				`${label} must contain only digits`,
				{ itemIndex },
			);
		}
		body[field] = value;
	}

	const aiDisclosures = additionalFields.ai_disclosures;
	if (Array.isArray(aiDisclosures) && aiDisclosures.length > 0) {
		for (const value of aiDisclosures) {
			if (typeof value !== 'string' || !AI_DISCLOSURE_VALUES.includes(value)) {
				throw new NodeOperationError(
					this.getNode(),
					`AI Disclosure Values contains an unsupported value: ${String(value)}`,
					{ itemIndex },
				);
			}
		}
		body.ai_disclosures = { values: aiDisclosures };
	} else if (aiDisclosures !== undefined && !Array.isArray(aiDisclosures)) {
		throw new NodeOperationError(
			this.getNode(),
			'AI Disclosure Values must be a list of values',
			{ itemIndex },
		);
	}

	const carouselSlots = additionalFields.carousel_slots;
	if (carouselSlots !== undefined) {
		const parsedSlots = parseCarouselSlots(carouselSlots, itemIndex, this);
		if (parsedSlots.length > 0) {
			body.carousel_slots = parsedSlots;
		}
	}

	if (Object.keys(body).length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one field is required to update a Pin',
			{ itemIndex },
		);
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'PATCH',
		url: `/pins/${pinId}`,
		body,
	};

	const adAccountId = (this.getNodeParameter('adAccountId', itemIndex, '') as string).trim();
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

	return requestOptions;
}
