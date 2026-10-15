import type { INodeProperties } from 'n8n-workflow';

export const pinFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pin'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new pin',
				action: 'Create a pin',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List pins',
				action: 'List pins',
			},
			{
				name: 'Get Multiple Pin Analytics',
				value: 'getMultiple',
				description: 'Get analytics for multiple pins',
				action: 'Get multiple pin analytics',
			},
			{
				name: 'Get Pin',
				value: 'get',
				description: 'Get a single pin',
				action: 'Get a pin',
			},
			{
				name: 'Update Pin',
				value: 'update',
				description: 'Update a single pin',
				action: 'Update a pin',
			},
			{
				name: 'Delete Pin',
				value: 'delete',
				description: 'Delete a single pin',
				action: 'Delete a pin',
			},
			{
				name: 'Get Pin Analytics',
				value: 'getAnalytics',
				description: 'Get analytics for a single pin',
				action: 'Get pin analytics',
			},
			{
				name: 'Save Pin',
				value: 'save',
				description: 'Save a pin',
				action: 'Save a pin',
			},
		],
		default: 'create',
	},

	// ----------------------------------
	//         pin:create
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'board_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
			},
		},
		description: 'ID of the board where the Pin will be created',
	},
	{
		displayName: 'Media Source Type',
		name: 'source_type',
		type: 'options',
		options: [
			{
				name: 'Image URL',
				value: 'image_url',
			},
			{
				name: 'Image Base64',
				value: 'image_base64',
			},
			{
				name: 'Video ID',
				value: 'video_id',
			},
		],
		default: 'image_url',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
			},
		},
		description: 'How the Pin media is provided',
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
				source_type: ['image_url'],
			},
		},
	},
	{
		displayName: 'Content Type',
		name: 'content_type',
		type: 'options',
		options: [
			{ name: 'PNG', value: 'image/png' },
			{ name: 'JPEG', value: 'image/jpeg' },
		],
		default: 'image/png',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
				source_type: ['image_base64'],
			},
		},
	},
	{
		displayName: 'Image Data (Base64)',
		name: 'data',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
				source_type: ['image_base64'],
			},
		},
		description: 'Base64-encoded image data',
	},
	{
		displayName: 'Media ID',
		name: 'media_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
				source_type: ['video_id'],
			},
		},
	},
	{
		displayName: 'Cover Image URL',
		name: 'cover_image_url',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
				source_type: ['video_id'],
			},
		},
		description: 'Optional cover image URL for the video Pin',
	},
	{
		displayName: 'Is Standard',
		name: 'is_standard',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
			},
		},
		description: 'Whether the Pin uses the standard format, where supported',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['create'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
			},
			{
				displayName: 'Alt Text',
				name: 'alt_text',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Board Section ID',
				name: 'board_section_id',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Dominant Color',
				name: 'dominant_color',
				type: 'color',
				default: '',
			},
			{
				displayName: 'Parent Pin ID',
				name: 'parent_pin_id',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sponsor ID',
				name: 'sponsor_id',
				type: 'string',
				default: '',
			},
			{
				displayName: 'AI Disclosure Values',
				name: 'ai_disclosures',
				type: 'multiOptions',
				options: [
					{
						name: 'AI Modified',
						value: 'AI_MODIFIED',
					},
					{
						name: 'Synthetic Performer',
						value: 'SYNTHETIC_PERFORMER',
					},
				],
				default: [],
			},
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Numeric ad account ID (up to 18 digits)',
			},
		],
	},

	// ----------------------------------
	//           pin:list
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['list'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 250,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['list'],
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
				resource: ['pin'],
				operation: ['list'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
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
			{
				displayName: 'Include Protected Pins',
				name: 'include_protected_pins',
				type: 'boolean',
				default: false,
				description: 'Whether to include protected Pins',
			},
			{
				displayName: 'Pin Type',
				name: 'pin_type',
				type: 'options',
				options: [
					{ name: 'Private', value: 'PRIVATE' },
				],
				default: 'PRIVATE',
				description: 'Filter by Pin type; currently supports private Pins',
			},
			{
				displayName: 'Creative Types',
				name: 'creative_types',
				type: 'multiOptions',
				options: [
					{ name: 'Idea Pin', value: 'IDEA' },
					{ name: 'Image (Regular)', value: 'REGULAR' },
					{ name: 'Video', value: 'VIDEO' },
					{ name: 'Collection', value: 'COLLECTION' },
				],
				default: [],
				description: 'Filter by Pin creative types',
			},
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Numeric ad account ID (up to 18 digits)',
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
				description: 'Comma-separated list of 1–100 domains to match',
			},
			{
				displayName: 'Include Product Tag Objects',
				name: 'include_product_tag_obj',
				type: 'boolean',
				default: false,
				description: 'Whether to include product tag objects and their associated links',
			},
			{
				displayName: 'Bookmark',
				name: 'bookmark',
				type: 'string',
				default: '',
				description: 'Pagination cursor for fetching the next page',
			},
		],
	},
	// ----------------------------------
	//      pin:getMultiple
	// ----------------------------------
	{
		displayName: 'Pin IDs',
		name: 'pinIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of 1–100 Pin IDs',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		description: 'Metric report start date (UTC). Must be within the last 90 days.',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		description: 'Metric report end date (UTC). Must be no more than 90 days after the start date.',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},
	{
		displayName: 'App Types',
		name: 'appTypes',
		type: 'options',
		options: [
			{ name: 'All', value: 'ALL' },
			{ name: 'Mobile', value: 'MOBILE' },
			{ name: 'Tablet', value: 'TABLET' },
			{ name: 'Web', value: 'WEB' },
		],
		default: 'ALL',
		description: 'Apps or devices to retrieve analytics for',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},
	{
		displayName: 'Metric Types',
		name: 'metricTypes',
		type: 'multiOptions',
		options: [
			{ name: 'Impressions', value: 'IMPRESSION' },
			{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
			{ name: 'Pin Clicks', value: 'PIN_CLICK' },
			{ name: 'Profile Visits', value: 'PROFILE_VISIT' },
			{ name: 'Save Rate', value: 'SAVE_RATE' },
			{ name: 'Saves', value: 'SAVE' },
			{ name: 'Total Comments', value: 'TOTAL_COMMENTS' },
			{ name: 'Total Reactions', value: 'TOTAL_REACTIONS' },
			{ name: 'User Follows', value: 'USER_FOLLOW' },
			{ name: 'Video 10s Views', value: 'VIDEO_10S_VIEW' },
			{ name: 'Video 95% Quartile Views', value: 'QUARTILE_95_PERCENT_VIEW' },
			{ name: 'Video Average Watch Time', value: 'VIDEO_AVG_WATCH_TIME' },
			{ name: 'Video Starts', value: 'VIDEO_START' },
			{ name: 'Video Views (MRC)', value: 'VIDEO_MRC_VIEW' },
			{ name: 'Video Watch Time (50%)', value: 'VIDEO_V50_WATCH_TIME' },
		],
		default: [],
		required: true,
		description: 'Pin metrics to include in the report',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},
	{
		displayName: 'Ad Account ID',
		name: 'adAccountId',
		type: 'string',
		default: '',
		description: 'Optional numeric ad account ID',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getMultiple'],
			},
		},
	},

	// ----------------------------------
	//           pin:get
	// ----------------------------------
	{
		displayName: 'Pin ID',
		name: 'pinId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['get'],
			},
		},
		description: 'Numeric ID of the Pin to retrieve',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Ad Account ID',
				name: 'ad_account_id',
				type: 'string',
				default: '',
				description: 'Numeric ad account ID (up to 18 digits)',
			},
			{
				displayName: 'Pin Metrics',
				name: 'pin_metrics',
				type: 'boolean',
				default: false,
				description:
					'Whether to include 90-day and lifetime Pin metrics. Lifetime metrics availability depends on the Pin format and creation date.',
			},
		],
	},
	
	// ----------------------------------
	//          pin:update
	// ----------------------------------
	{
		displayName: 'Pin ID',
		name: 'pinId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['update'],
			},
		},
		description: 'Numeric ID of the Pin to update',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['update'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Pin title (maximum 100 characters)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Pin description (maximum 800 characters)',
			},
			{
				displayName: 'Alt Text',
				name: 'alt_text',
				type: 'string',
				default: '',
				description: 'Alternative text for the Pin (maximum 500 characters)',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				default: '',
				description: 'Destination URL (maximum 2048 characters)',
			},
			{
				displayName: 'Board ID',
				name: 'board_id',
				type: 'string',
				default: '',
				description: 'Numeric ID of the board to which this Pin belongs',
			},
			{
				displayName: 'Board Section ID',
				name: 'board_section_id',
				type: 'string',
				default: '',
				description: 'Numeric ID of the board section; nullable in the API',
			},
			{
				displayName: 'AI Disclosure Values',
				name: 'ai_disclosures',
				type: 'multiOptions',
				options: [
					{
						name: 'AI Modified',
						value: 'AI_MODIFIED',
					},
					{
						name: 'Synthetic Performer',
						value: 'SYNTHETIC_PERFORMER',
					},
				],
				default: [],
				description: 'AI disclosure declarations for the Pin',
			},
			{
				displayName: 'Carousel Slots (JSON)',
				name: 'carousel_slots',
				type: 'json',
				default: '[]',
				description: 'Carousel Pin slots data as a JSON array of objects',
			},
		],
	},
	{
		displayName: 'Ad Account ID',
		name: 'adAccountId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['update'],
			},
		},
		description: 'Optional numeric ad account ID (maximum 18 digits)',
	},
	
	// ----------------------------------
	//          pin:delete
	// ----------------------------------
	{
		displayName: 'Pin ID',
		name: 'pinId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['delete'],
			},
		},
		description: 'Numeric ID of the Pin to delete',
	},
	{
		displayName: 'Ad Account ID',
		name: 'adAccountId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['delete'],
			},
		},
		description: 'Optional numeric ad account ID (maximum 18 digits)',
	},
	
	// ----------------------------------
	//       pin:getAnalytics
	// ----------------------------------
	{
		displayName: 'Pin ID',
		name: 'pinId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Unique identifier of the Pin',
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Metric report start date in UTC (YYYY-MM-DD), within the last 90 days',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Metric report end date in UTC (YYYY-MM-DD), at most 90 days after the start date',
	},
	{
		displayName: 'App Types',
		name: 'appTypes',
		type: 'options',
		options: [
			{ name: 'All', value: 'ALL' },
			{ name: 'Mobile', value: 'MOBILE' },
			{ name: 'Tablet', value: 'TABLET' },
			{ name: 'Web', value: 'WEB' },
		],
		default: 'ALL',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Apps or devices to include in the analytics report',
	},
	{
		displayName: 'Metric Types',
		name: 'metricTypes',
		type: 'multiOptions',
		options: [
			{ name: 'Impressions', value: 'IMPRESSION' },
			{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
			{ name: 'Pin Clicks', value: 'PIN_CLICK' },
			{ name: 'Profile Visits', value: 'PROFILE_VISIT' },
			{ name: 'Save Rate', value: 'SAVE_RATE' },
			{ name: 'Saves', value: 'SAVE' },
			{ name: 'Total Comments', value: 'TOTAL_COMMENTS' },
			{ name: 'Total Reactions', value: 'TOTAL_REACTIONS' },
			{ name: 'User Follows', value: 'USER_FOLLOW' },
			{ name: 'Video 10s Views', value: 'VIDEO_10S_VIEW' },
			{ name: 'Video 95% Quartile Views', value: 'QUARTILE_95_PERCENT_VIEW' },
			{ name: 'Video Average Watch Time', value: 'VIDEO_AVG_WATCH_TIME' },
			{ name: 'Video Starts', value: 'VIDEO_START' },
			{ name: 'Video Views (MRC)', value: 'VIDEO_MRC_VIEW' },
			{ name: 'Video Watch Time (50%)', value: 'VIDEO_V50_WATCH_TIME' },
		],
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Metrics to retrieve for this Pin',
	},
	{
		displayName: 'Split Field',
		name: 'splitField',
		type: 'options',
		options: [
			{ name: 'No Split', value: 'NO_SPLIT' },
			{ name: 'App Type', value: 'APP_TYPE' },
		],
		default: 'NO_SPLIT',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Optional dimension for grouping analytics results',
	},
	{
		displayName: 'Ad Account ID',
		name: 'adAccountId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Optional numeric ad account ID (maximum 18 digits)',
	},
	
	// ----------------------------------
	//          pin:save
	// ----------------------------------
	{
		displayName: 'Pin ID',
		name: 'pinId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['save'],
			},
		},
		description: 'Unique identifier of the Pin to save',
	},
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['save'],
			},
		},
		description: 'Numeric ID of the board to save the Pin to. Leave empty if not specified.',
	},
	{
		displayName: 'Board Section ID',
		name: 'boardSectionId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['save'],
			},
		},
		description: 'Numeric ID of the board section to save the Pin to',
	},
	{
		displayName: 'Ad Account ID',
		name: 'adAccountId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['save'],
			},
		},
		description: 'Optional numeric ad account ID (maximum 18 digits)',
	},
];
