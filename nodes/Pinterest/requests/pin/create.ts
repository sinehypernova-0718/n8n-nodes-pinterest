import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const STRING_FIELDS = [
	'title',
	'description',
	'alt_text',
	'link',
	'board_section_id',
	'dominant_color',
	'parent_pin_id',
	'sponsor_id',
] as const;

export async function createPinRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const boardId = (this.getNodeParameter('board_id', itemIndex, '') as string).trim();
	if (!boardId) {
		throw new NodeOperationError(this.getNode(), 'Board ID is required to create a Pin', {
			itemIndex,
		});
	}

	const sourceType = this.getNodeParameter('source_type', itemIndex) as string;
	const isStandard = this.getNodeParameter('is_standard', itemIndex, true) as boolean;

	const mediaSource: IDataObject = { source_type: sourceType };

	switch (sourceType) {
		case 'image_url': {
			const imageUrl = (this.getNodeParameter('imageUrl', itemIndex, '') as string).trim();
			if (!imageUrl) {
				throw new NodeOperationError(this.getNode(), 'Image URL is required', { itemIndex });
			}
			mediaSource.url = imageUrl;
			mediaSource.is_standard = isStandard;
			break;
		}
		case 'image_base64': {
			const contentType = this.getNodeParameter('content_type', itemIndex) as string;
			const data = (this.getNodeParameter('data', itemIndex, '') as string).trim();
			if (!contentType) {
				throw new NodeOperationError(this.getNode(), 'Content Type is required', { itemIndex });
			}
			if (!data) {
				throw new NodeOperationError(this.getNode(), 'Image Data (Base64) is required', {
					itemIndex,
				});
			}
			mediaSource.content_type = contentType;
			mediaSource.data = data;
			mediaSource.is_standard = isStandard;
			break;
		}
		case 'video_id': {
			const mediaId = (this.getNodeParameter('media_id', itemIndex, '') as string).trim();
			const coverImageUrl = (
				this.getNodeParameter('cover_image_url', itemIndex, '') as string
			).trim();
			if (!mediaId) {
				throw new NodeOperationError(this.getNode(), 'Media ID is required', { itemIndex });
			}
			mediaSource.media_id = mediaId;
			if (coverImageUrl) {
				mediaSource.cover_image_url = coverImageUrl;
			}
			mediaSource.is_standard = isStandard;
			break;
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported media source type: ${sourceType}`, {
				itemIndex,
			});
	}

	const body: IDataObject = {
		board_id: boardId,
		media_source: mediaSource,
	};

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	for (const field of STRING_FIELDS) {
		const value = additionalFields[field];
		if (value !== undefined && value !== '') {
			body[field] = value;
		}
	}

	const aiDisclosures = additionalFields.ai_disclosures;
	if (Array.isArray(aiDisclosures) && aiDisclosures.length > 0) {
		body.ai_disclosures = { values: aiDisclosures };
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: '/pins',
		body,
	};

	const adAccountId = additionalFields.ad_account_id;
	if (typeof adAccountId === 'string' && adAccountId.trim() !== '') {
		requestOptions.qs = { ad_account_id: adAccountId };
	}

	return requestOptions;
}
