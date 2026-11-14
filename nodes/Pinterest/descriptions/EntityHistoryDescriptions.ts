import type { INodeProperties } from 'n8n-workflow';

export const entityHistoryFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['entityHistory'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description:
					'Get ad entities change history (closed beta — requires app approval from Pinterest, not available in the API Sandbox)',
				action: 'Get ad entities change history',
			},
		],
		default: 'get',
	},

	// ----------------------------------
	//        entityHistory:get
	// ----------------------------------
	{
		displayName: 'Ad Account ID',
		name: 'ad_account_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description: 'Unique identifier of an ad account. Numeric only, up to 18 characters.',
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description: 'ID of the entity for which change history will be fetched',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'string',
		default: '',
		required: true,
		placeholder: '1622848072',
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description:
			'A Unix timestamp in seconds representing the start of the inclusive range over which change history is fetched',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'string',
		default: '',
		required: true,
		placeholder: '1622934472',
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description:
			'A Unix timestamp in seconds representing the end of the inclusive range over which change history is fetched',
	},
	{
		displayName: 'Order',
		name: 'order',
		type: 'options',
		options: [
			{ name: 'Ascending', value: 'ASCENDING' },
			{ name: 'Descending', value: 'DESCENDING' },
		],
		default: 'ASCENDING',
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description:
			'Sorts change history results in ascending or descending order. Defaults to ascending (oldest-first).',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entityHistory'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Advertiser ID',
				name: 'advertiser_id',
				type: 'string',
				default: '',
				description:
					'Optional Advertiser ID. When provided, returns history for all entities belonging to this advertiser.',
			},
			{
				displayName: 'Bookmark',
				name: 'bookmark',
				type: 'string',
				default: '',
				description: 'Cursor used to fetch a specific page of items',
			},
			{
				displayName: 'Entity IDs',
				name: 'entity_ids',
				type: 'string',
				default: '',
				description:
					'Comma-separated list of IDs of the entities (with multiple entity types allowed) for which change history will be fetched',
			},
			{
				displayName: 'Field Filters',
				name: 'field_filters',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to filter on',
			},
			{
				displayName: 'User ID Filter',
				name: 'user_id_filter',
				type: 'string',
				default: '',
				description:
					'Optional ID ensuring only data changes initiated by this specified user will be returned',
			},
		],
	},
];
