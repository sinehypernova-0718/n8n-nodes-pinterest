import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { boardFields } from './descriptions/BoardDescriptions';
import { pinFields } from './descriptions/PinDescriptions';
import { deleteBoardRequest } from './requests/board/delete';
import { getBoardRequest } from './requests/board/get';
import { listBoardsRequest } from './requests/board/list';
import { listBoardPinsRequest } from './requests/board/listPins';
import { updateBoardRequest } from './requests/board/update';
import { createPinRequest } from './requests/pin/create';
import { deletePinRequest } from './requests/pin/delete';
import { getPinRequest } from './requests/pin/get';
import { getMultiplePinsRequest } from './requests/pin/getMultiple';
import { listPinsRequest } from './requests/pin/list';
import { updatePinRequest } from './requests/pin/update';

const PINTEREST_API_BASE_URL = 'https://api.pinterest.com/v5';

function resolveCredentialsType(authentication: string): string | null {
	if (authentication === 'accessToken') {
		return 'pinterestApi';
	}
	if (authentication === 'oAuth2') {
		return 'pinterestOAuth2Api';
	}
	return null;
}

async function collectPinListPages(
	this: IExecuteFunctions,
	credentialsType: string,
	firstPageRequest: IHttpRequestOptions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const limit = returnAll
		? Number.POSITIVE_INFINITY
		: (this.getNodeParameter('limit', itemIndex, 50) as number);

	const collected: IDataObject[] = [];
	const seenBookmarks = new Set<string>();
	let requestOptions: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		json: true,
		...firstPageRequest,
	};

	const initialBookmark = firstPageRequest.qs?.bookmark;
	if (typeof initialBookmark === 'string' && initialBookmark !== '') {
		seenBookmarks.add(initialBookmark);
	}

	while (true) {
		let response: IDataObject;
		try {
			response = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialsType,
				requestOptions,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}

		if (Array.isArray(response?.items)) {
			collected.push(...(response.items as IDataObject[]));
		}

		if (collected.length >= limit) {
			break;
		}

		const nextBookmark = response?.bookmark;
		if (
			typeof nextBookmark !== 'string' ||
			nextBookmark === '' ||
			seenBookmarks.has(nextBookmark)
		) {
			break;
		}
		seenBookmarks.add(nextBookmark);

		const nextPageRequest = await listPinsRequest.call(this, itemIndex, nextBookmark);
		requestOptions = {
			baseURL: PINTEREST_API_BASE_URL,
			json: true,
			...nextPageRequest,
		};
	}

	return returnAll ? collected : collected.slice(0, limit);
}

async function collectBoardListPages(
	this: IExecuteFunctions,
	credentialsType: string,
	firstPageRequest: IHttpRequestOptions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const collected: IDataObject[] = [];
	const seenBookmarks = new Set<string>();
	let requestOptions: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		json: true,
		...firstPageRequest,
	};

	const initialBookmark = firstPageRequest.qs?.bookmark;
	if (typeof initialBookmark === 'string' && initialBookmark !== '') {
		seenBookmarks.add(initialBookmark);
	}

	while (true) {
		let response: IDataObject;
		try {
			response = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialsType,
				requestOptions,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}

		if (Array.isArray(response?.items)) {
			collected.push(...(response.items as IDataObject[]));
		}

		const nextBookmark = response?.bookmark;
		if (
			typeof nextBookmark !== 'string' ||
			nextBookmark === '' ||
			seenBookmarks.has(nextBookmark)
		) {
			break;
		}
		seenBookmarks.add(nextBookmark);

		const nextPageRequest = await listBoardsRequest.call(this, itemIndex, nextBookmark);
		requestOptions = {
			baseURL: PINTEREST_API_BASE_URL,
			json: true,
			...nextPageRequest,
		};
	}

	return collected;
}

async function collectBoardPinsListPages(
	this: IExecuteFunctions,
	credentialsType: string,
	firstPageRequest: IHttpRequestOptions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const collected: IDataObject[] = [];
	const seenBookmarks = new Set<string>();
	let requestOptions: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		json: true,
		...firstPageRequest,
	};

	const initialBookmark = firstPageRequest.qs?.bookmark;
	if (typeof initialBookmark === 'string' && initialBookmark !== '') {
		seenBookmarks.add(initialBookmark);
	}

	while (true) {
		let response: IDataObject;
		try {
			response = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialsType,
				requestOptions,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}

		if (Array.isArray(response?.items)) {
			collected.push(...(response.items as IDataObject[]));
		}

		const nextBookmark = response?.bookmark;
		if (
			typeof nextBookmark !== 'string' ||
			nextBookmark === '' ||
			seenBookmarks.has(nextBookmark)
		) {
			break;
		}
		seenBookmarks.add(nextBookmark);

		const nextPageRequest = await listBoardPinsRequest.call(this, itemIndex, nextBookmark);
		requestOptions = {
			baseURL: PINTEREST_API_BASE_URL,
			json: true,
			...nextPageRequest,
		};
	}

	return collected;
}

export class Pinterest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pinterest',
		name: 'pinterest',
		icon: { light: 'file:pinterest.svg', dark: 'file:pinterest.dark.svg' },
		group: ['transform'],
		version: 1,
		description:
			'Pinterest integration for n8n. Automate Pins, Boards, and Pinterest API workflows with a community-built node.',
		subtitle: '',
		defaults: {
			name: 'Pinterest',
		},
		credentials: [
			{
				name: 'pinterestApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'pinterestOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,

		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Pin',
						value: 'pin',
					},
					{
						name: 'Board',
						value: 'board',
					},
				],
				default: 'pin',
			},
			...pinFields,
			...boardFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const authentication = this.getNodeParameter('authentication', i) as string;

				const credentialsType = resolveCredentialsType(authentication);
				if (credentialsType === null) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported authentication method: ${authentication}`,
						{ itemIndex: i },
					);
				}

				let requestOptions: IHttpRequestOptions;
				switch (resource) {
					case 'pin':
						switch (operation) {
							case 'create':
								requestOptions = await createPinRequest.call(this, i);
								break;
							case 'get':
								requestOptions = await getPinRequest.call(this, i);
								break;
							case 'list':
								requestOptions = await listPinsRequest.call(this, i);
								break;
							case 'getMultiple':
								requestOptions = await getMultiplePinsRequest.call(this, i);
								break;
							case 'update':
								requestOptions = await updatePinRequest.call(this, i);
								break;
							case 'delete':
								requestOptions = await deletePinRequest.call(this, i);
								break;
							default:
								throw new NodeOperationError(
									this.getNode(),
									`The Pin operation "${operation}" is not implemented yet`,
									{ itemIndex: i },
								);
						}
						break;
					case 'board':
						switch (operation) {
							case 'get':
								requestOptions = await getBoardRequest.call(this, i);
								break;
							case 'list':
								requestOptions = await listBoardsRequest.call(this, i);
								break;
							case 'listPins':
								requestOptions = await listBoardPinsRequest.call(this, i);
								break;
							case 'delete':
								requestOptions = await deleteBoardRequest.call(this, i);
								break;
							case 'update':
								requestOptions = await updateBoardRequest.call(this, i);
								break;
							default:
								throw new NodeOperationError(
									this.getNode(),
									`The Board operation "${operation}" is not implemented yet`,
									{ itemIndex: i },
								);
						}
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
							itemIndex: i,
						});
				}

				let responseData: IDataObject | IDataObject[];
				if (resource === 'pin' && operation === 'list') {
					responseData = await collectPinListPages.call(this, credentialsType, requestOptions, i);
				} else if (resource === 'board' && operation === 'list') {
					responseData = await collectBoardListPages.call(this, credentialsType, requestOptions, i);
				} else if (resource === 'board' && operation === 'listPins') {
					responseData = await collectBoardPinsListPages.call(
						this,
						credentialsType,
						requestOptions,
						i,
					);
				} else {
					const options: IHttpRequestOptions = {
						baseURL: PINTEREST_API_BASE_URL,
						json: true,
						...requestOptions,
					};

					try {
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialsType,
							options,
						);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData ?? {}),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				if (error instanceof NodeApiError) {
					// Already wrapped at the HTTP boundary; rethrow it as-is to preserve API details.
					// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
