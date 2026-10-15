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
import { createPinRequest } from './requests/pin/create';
import { getPinRequest } from './requests/pin/get';

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
							default:
								throw new NodeOperationError(
									this.getNode(),
									`The Pin operation "${operation}" is not implemented yet`,
									{ itemIndex: i },
								);
						}
						break;
					case 'board':
						throw new NodeOperationError(
							this.getNode(),
							`The Board operation "${operation}" is not implemented yet`,
							{ itemIndex: i },
						);
					default:
						throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
							itemIndex: i,
						});
				}

				const options: IHttpRequestOptions = {
					baseURL: PINTEREST_API_BASE_URL,
					json: true,
					...requestOptions,
				};

				let responseData;
				try {
					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialsType,
						options,
					);
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray((responseData ?? {}) as IDataObject),
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
