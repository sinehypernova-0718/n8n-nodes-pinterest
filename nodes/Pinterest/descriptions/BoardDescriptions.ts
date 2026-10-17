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
		description:
			'Name of the board. Pinterest sets this to "Ad-only Pins" when Is Ads Only is enabled.',
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
		description:
			'Privacy setting of the board. Pinterest sets this to Protected when Is Ads Only is enabled.',
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
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Protected', value: 'PROTECTED' },
					{ name: 'Public', value: 'PUBLIC' },
					{ name: 'Public and Secret', value: 'PUBLIC_AND_SECRET' },
					{ name: 'Secret', value: 'SECRET' },
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
					{ name: 'App', value: 'APP' },
					{ name: 'Carousel', value: 'CAROUSEL' },
					{ name: 'Collage', value: 'COLLAGE' },
					{ name: 'Collection', value: 'COLLECTION' },
					{ name: 'Idea Pin', value: 'IDEA' },
					{ name: 'Max Video', value: 'MAX_VIDEO' },
					{ name: 'Max Width Regular Collection', value: 'MAX_WIDTH_REGULAR_COLLECTION' },
					{ name: 'Max Width Video Collection', value: 'MAX_WIDTH_VIDEO_COLLECTION' },
					{ name: 'Quiz', value: 'QUIZ' },
					{ name: 'Regular', value: 'REGULAR' },
					{ name: 'Shop the Pin', value: 'SHOP_THE_PIN' },
					{ name: 'Shopping', value: 'SHOPPING' },
					{ name: 'Showcase', value: 'SHOWCASE' },
					{ name: 'Video', value: 'VIDEO' },
				],
				default: [],
				description: 'Filter the Pins by creative type',
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
				displayName: 'Pin Metrics',
				name: 'pin_metrics',
				type: 'boolean',
				default: false,
				description: 'Whether to include 90-day and lifetime Pin metrics',
			},
		],
	},
];
