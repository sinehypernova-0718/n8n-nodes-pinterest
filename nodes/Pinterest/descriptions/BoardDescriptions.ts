import type { INodeProperties } from 'n8n-workflow';

export const boardFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['board'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new board',
				action: 'Create a board',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a single board',
				action: 'Delete a board',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single board',
				action: 'Get a board',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List boards',
				action: 'List boards',
			},
			{
				name: 'List Pins',
				value: 'listPins',
				description: 'List Pins on a board',
				action: 'List pins on a board',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a single board',
				action: 'Update a board',
			},
		],
		default: 'create',
	},

	// ----------------------------------
	//          board:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		description: 'Name of the board. Pinterest sets this to "Ad-only Pins" when Is Ads Only is enabled.',
	},
	{
		displayName: 'Privacy',
		name: 'privacy',
		type: 'options',
		options: [
			{ name: 'Public', value: 'PUBLIC' },
			{ name: 'Protected', value: 'PROTECTED' },
			{ name: 'Secret', value: 'SECRET' },
		],
		default: 'PUBLIC',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		description: 'Privacy setting of the board. Pinterest sets this to Protected when Is Ads Only is enabled.',
	},
	{
		displayName: 'Is Ads Only',
		name: 'is_ads_only',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		description:
			'Whether the board is ad-only and can store ad-only Pins. When enabled, Pinterest automatically sets the privacy to Protected and the name to "Ad-only Pins".',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Description of the board',
			},
		],
	},

	// ----------------------------------
	//           board:list
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
			{
				displayName: 'Bookmark',
				name: 'bookmark',
				type: 'string',
				default: '',
				description: 'Pagination cursor for fetching the next page',
			},
			{
				displayName: 'Page Size',
				name: 'page_size',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 250,
				},
				default: 25,
				description: 'Number of boards to return per page, from 1 to 250',
			},
			{
				displayName: 'Privacy',
				name: 'privacy',
				type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Public', value: 'PUBLIC' },
					{ name: 'Protected', value: 'PROTECTED' },
					{ name: 'Secret', value: 'SECRET' },
					{ name: 'Public and Secret', value: 'PUBLIC_AND_SECRET' },
				],
				default: 'PUBLIC',
				description: 'Filter the boards by privacy setting',
			},
		],
	},

	// ----------------------------------
	//            board:get
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['get'],
			},
		},
		description: 'Numeric ID of the board to retrieve',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
		],
	},

	// ----------------------------------
	//          board:update
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['update'],
			},
		},
		description: 'Numeric ID of the board to update',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'New description of the board. Only sent when set.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name of the board. Only sent when set.',
			},
			{
				displayName: 'Privacy',
				name: 'privacy',
				type: 'options',
				options: [
					{ name: 'Public', value: 'PUBLIC' },
					{ name: 'Secret', value: 'SECRET' },
				],
				default: 'PUBLIC',
				description: 'New privacy setting of the board. Only sent when set.',
			},
		],
	},

	// ----------------------------------
	//          board:delete
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['delete'],
			},
		},
		description: 'Numeric ID of the board to delete',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['delete'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
		],
	},

	// ----------------------------------
	//        board:listPins
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['listPins'],
			},
		},
		description: 'Numeric ID of the board whose Pins you want to retrieve',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['listPins'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Advertising account identifier. Numeric only, up to 18 characters.',
			},
			{
				displayName: 'Bookmark',
				name: 'bookmark',
				type: 'string',
				default: '',
				description: 'Pagination cursor for fetching the next page',
			},
			{
				displayName: 'Creative Types',
				name: 'creative_types',
				type: 'multiOptions',
				options: [
					{ name: 'Collection', value: 'COLLECTION' },
					{ name: 'Idea Pin', value: 'IDEA' },
					{ name: 'Image', value: 'IMAGE' },
					{ name: 'Video', value: 'VIDEO' },
				],
				default: [],
				description: 'Filter the Pins by creative type',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description: "Only return Pins linked to this exact domain; omit 'www.'",
			},
			{
				displayName: 'Domains',
				name: 'domains',
				type: 'string',
				default: '',
				description: 'Comma-separated list of 1 to 100 domains to match',
			},
			{
				displayName: 'Include Product Tag Objects',
				name: 'include_product_tag_obj',
				type: 'boolean',
				default: false,
				description: 'Whether to include product tag objects and their associated links',
			},
			{
				displayName: 'Include Protected Pins',
				name: 'include_protected_pins',
				type: 'boolean',
				default: false,
				description: 'Whether to include protected Pins',
			},
			{
				displayName: 'Page Size',
				name: 'page_size',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 250,
				},
				default: 25,
				description: 'Number of Pins to return per page, from 1 to 250',
			},
			{
				displayName: 'Pin Filter',
				name: 'pin_filter',
				type: 'options',
				options: [
					{ name: 'Exclude Native', value: 'exclude_native' },
					{ name: 'Exclude Repins', value: 'exclude_repins' },
					{ name: 'Has Been Promoted', value: 'has_been_promoted' },
				],
				default: 'exclude_native',
				description: 'Filter the Pins returned',
			},
			{
				displayName: 'Pin Metrics',
				name: 'pin_metrics',
				type: 'boolean',
				default: false,
				description: 'Whether to include 90-day and lifetime Pin metrics',
			},
		],
	},
];
