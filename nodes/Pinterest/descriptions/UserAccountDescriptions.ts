import type { INodeProperties } from 'n8n-workflow';

export const userAccountFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
			},
		},
		options: [
			{
				name: 'Follow User',
				value: 'followUser',
				description:
					'Follow another user (beta — requires app approval from Pinterest)',
				action: 'Follow a user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get account information for the authenticated user',
				action: 'Get user account',
			},
			{
				name: 'Get Analytics',
				value: 'getAnalytics',
				description: 'Get analytics for the authenticated user account',
				action: 'Get user account analytics',
			},
			{
				name: 'Get Top Pins Analytics',
				value: 'getTopPinsAnalytics',
				description: "Get analytics for a user's top pins (up to 50)",
				action: 'Get top pins analytics',
			},
			{
				name: 'Get Top Video Pins Analytics',
				value: 'getTopVideoPinsAnalytics',
				description: "Get analytics for a user's top video pins (up to 50)",
				action: 'Get top video pins analytics',
			},
			{
				name: 'Get Website Verification Code',
				value: 'getWebsiteVerificationCode',
				description: 'Get a verification code to claim a website',
				action: 'Get website verification code',
			},
			{
				name: 'Get Websites',
				value: 'getWebsites',
				description: 'Get websites associated with the user (claimed or not)',
				action: 'Get user websites',
			},
			{
				name: 'List Followers',
				value: 'listFollowers',
				description: 'Get a list of users who follow the authenticated user',
				action: 'List followers',
			},
			{
				name: 'List Following',
				value: 'listFollowing',
				description: 'Get a list of users the authenticated user follows',
				action: 'List following',
			},
			{
				name: 'List Following Boards',
				value: 'listFollowingBoards',
				description: 'Get a list of boards the authenticated user follows',
				action: 'List following boards',
			},
			{
				name: 'List Following Interests',
				value: 'listFollowingInterests',
				description: "Get a list of a user's followed interests",
				action: 'List following interests',
			},
			{
				name: 'List Linked Businesses',
				value: 'listLinkedBusinesses',
				description: 'Get a list of linked business accounts',
				action: 'List linked businesses',
			},
			{
				name: 'Unverify Website',
				value: 'unverifyWebsite',
				description: 'Remove verification from a website',
				action: 'Unverify website',
			},
			{
				name: 'Verify Website',
				value: 'verifyWebsite',
				description: 'Verify a website as a signed-in user',
				action: 'Verify website',
			},
		],
		default: 'get',
	},

	// ----------------------------------
	//       userAccount:get
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
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
	//    userAccount:getAnalytics
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Metric report start date (UTC). Cannot be more than 90 days ago.',
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
				resource: ['userAccount'],
				operation: ['getAnalytics'],
			},
		},
		description: 'Metric report end date (UTC)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getAnalytics'],
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
				displayName: 'App Types',
				name: 'app_types',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Mobile', value: 'MOBILE' },
					{ name: 'Tablet', value: 'TABLET' },
					{ name: 'Web', value: 'WEB' },
				],
				default: 'ALL',
				description: 'Apps or devices to get data for',
			},
			{
				displayName: 'Content Type',
				name: 'content_type',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Paid', value: 'PAID' },
					{ name: 'Organic', value: 'ORGANIC' },
				],
				default: 'ALL',
				description: 'Filter to paid or organic data',
			},
			{
				displayName: 'From Claimed Content',
				name: 'from_claimed_content',
				type: 'options',
				options: [
					{ name: 'Both', value: 'BOTH' },
					{ name: 'Claimed', value: 'CLAIMED' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'BOTH',
				description: 'Filter on Pins that match your claimed domain',
			},
			{
				displayName: 'Metric Types',
				name: 'metric_types',
				type: 'multiOptions',
				options: [
					{ name: 'Engagement', value: 'ENGAGEMENT' },
					{ name: 'Engagement Rate', value: 'ENGAGEMENT_RATE' },
					{ name: 'Impressions', value: 'IMPRESSION' },
					{ name: 'Outbound Click Rate', value: 'OUTBOUND_CLICK_RATE' },
					{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
					{ name: 'Pin Click Rate', value: 'PIN_CLICK_RATE' },
					{ name: 'Pin Clicks', value: 'PIN_CLICK' },
					{ name: 'Save Rate', value: 'SAVE_RATE' },
					{ name: 'Saves', value: 'SAVE' },
				],
				default: [],
				description: 'Metric types to get data for. Leave empty to retrieve all.',
			},
			{
				displayName: 'Pin Format',
				name: 'pin_format',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Ads Idea', value: 'ADS_IDEA' },
					{ name: 'Ads Product', value: 'ADS_PRODUCT' },
					{ name: 'Ads Standard', value: 'ADS_STANDARD' },
					{ name: 'Ads Video', value: 'ADS_VIDEO' },
					{ name: 'Organic Image', value: 'ORGANIC_IMAGE' },
					{ name: 'Organic Product', value: 'ORGANIC_PRODUCT' },
					{ name: 'Organic Video', value: 'ORGANIC_VIDEO' },
				],
				default: 'ALL',
				description: 'Pin formats to get data for',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Other Pins', value: 'OTHER_PINS' },
					{ name: 'Your Pins', value: 'YOUR_PINS' },
				],
				default: 'ALL',
				description:
					'Filter to activity from your Pins or activity created by others from your claimed accounts',
			},
			{
				displayName: 'Split Field',
				name: 'split_field',
				type: 'options',
				options: [
					{ name: 'No Split', value: 'NO_SPLIT' },
					{ name: 'App Type', value: 'APP_TYPE' },
					{ name: 'Owned Content', value: 'OWNED_CONTENT' },
					{ name: 'Pin Format', value: 'PIN_FORMAT' },
					{ name: 'Source', value: 'SOURCE' },
				],
				default: 'NO_SPLIT',
				description: 'How to split the data into groups',
			},
		],
	},

	// ----------------------------------
	//  userAccount:getTopPinsAnalytics
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopPinsAnalytics'],
			},
		},
		description: 'Metric report start date (UTC). Cannot be more than 90 days ago.',
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
				resource: ['userAccount'],
				operation: ['getTopPinsAnalytics'],
			},
		},
		description: 'Metric report end date (UTC).',
	},
	{
		displayName: 'Sort By',
		name: 'sortBy',
		type: 'options',
		options: [
			{ name: 'Engagement', value: 'ENGAGEMENT' },
			{ name: 'Impressions', value: 'IMPRESSION' },
			{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
			{ name: 'Pin Clicks', value: 'PIN_CLICK' },
			{ name: 'Saves', value: 'SAVE' },
		],
		default: 'IMPRESSION',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopPinsAnalytics'],
			},
		},
		description: 'Metric to sort top pins by',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopPinsAnalytics'],
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
				displayName: 'App Types',
				name: 'app_types',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Mobile', value: 'MOBILE' },
					{ name: 'Tablet', value: 'TABLET' },
					{ name: 'Web', value: 'WEB' },
				],
				default: 'ALL',
				description: 'Apps or devices to get data for',
			},
			{
				displayName: 'Content Type',
				name: 'content_type',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Paid', value: 'PAID' },
					{ name: 'Organic', value: 'ORGANIC' },
				],
				default: 'ALL',
				description: 'Filter to paid or organic data',
			},
			{
				displayName: 'Created in Last 30 Days Only',
				name: 'created_in_last_n_days',
				type: 'boolean',
				default: false,
				description:
					'Whether to filter results to only pins created in the last 30 days',
			},
			{
				displayName: 'From Claimed Content',
				name: 'from_claimed_content',
				type: 'options',
				options: [
					{ name: 'Both', value: 'BOTH' },
					{ name: 'Claimed', value: 'CLAIMED' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'BOTH',
				description: 'Filter on Pins that match your claimed domain',
			},
			{
				displayName: 'Metric Types',
				name: 'metric_types',
				type: 'multiOptions',
				options: [
					{ name: 'Engagement', value: 'ENGAGEMENT' },
					{ name: 'Engagement Rate', value: 'ENGAGEMENT_RATE' },
					{ name: 'Impressions', value: 'IMPRESSION' },
					{ name: 'Outbound Click Rate', value: 'OUTBOUND_CLICK_RATE' },
					{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
					{ name: 'Pin Click Rate', value: 'PIN_CLICK_RATE' },
					{ name: 'Pin Clicks', value: 'PIN_CLICK' },
					{ name: 'Save Rate', value: 'SAVE_RATE' },
					{ name: 'Saves', value: 'SAVE' },
				],
				default: [],
				description: 'Metric types to get data for. Leave empty to retrieve all.',
			},
			{
				displayName: 'Number of Pins',
				name: 'num_of_pins',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				default: 10,
				description: 'Number of top pins to return (1–50)',
			},
			{
				displayName: 'Pin Format',
				name: 'pin_format',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Ads Idea', value: 'ADS_IDEA' },
					{ name: 'Ads Product', value: 'ADS_PRODUCT' },
					{ name: 'Ads Standard', value: 'ADS_STANDARD' },
					{ name: 'Ads Video', value: 'ADS_VIDEO' },
					{ name: 'Organic Image', value: 'ORGANIC_IMAGE' },
					{ name: 'Organic Product', value: 'ORGANIC_PRODUCT' },
					{ name: 'Organic Video', value: 'ORGANIC_VIDEO' },
				],
				default: 'ALL',
				description: 'Pin formats to get data for',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Other Pins', value: 'OTHER_PINS' },
					{ name: 'Your Pins', value: 'YOUR_PINS' },
				],
				default: 'ALL',
				description:
					'Filter to activity from your Pins or activity created by others from your claimed accounts',
			},
		],
	},

	// ----------------------------------
	// userAccount:getTopVideoPinsAnalytics
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopVideoPinsAnalytics'],
			},
		},
		description: 'Metric report start date (UTC). Cannot be more than 90 days ago.',
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
				resource: ['userAccount'],
				operation: ['getTopVideoPinsAnalytics'],
			},
		},
		description: 'Metric report end date (UTC).',
	},
	{
		displayName: 'Sort By',
		name: 'sortBy',
		type: 'options',
		options: [
			{ name: 'Impressions', value: 'IMPRESSION' },
			{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
			{ name: 'Saves', value: 'SAVE' },
			{ name: 'Video 10s Views', value: 'VIDEO_10S_VIEW' },
			{ name: 'Video Average Watch Time', value: 'VIDEO_AVG_WATCH_TIME' },
			{ name: 'Video MRC Views', value: 'VIDEO_MRC_VIEW' },
			{ name: 'Video Quartile 95% Views', value: 'QUARTILE_95_PERCENT_VIEW' },
			{ name: 'Video Starts', value: 'VIDEO_START' },
			{ name: 'Video Watch Time (50%)', value: 'VIDEO_V50_WATCH_TIME' },
		],
		default: 'IMPRESSION',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopVideoPinsAnalytics'],
			},
		},
		description: 'Video metric to sort top video pins by',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getTopVideoPinsAnalytics'],
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
				displayName: 'App Types',
				name: 'app_types',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Mobile', value: 'MOBILE' },
					{ name: 'Tablet', value: 'TABLET' },
					{ name: 'Web', value: 'WEB' },
				],
				default: 'ALL',
				description: 'Apps or devices to get data for',
			},
			{
				displayName: 'Content Type',
				name: 'content_type',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Paid', value: 'PAID' },
					{ name: 'Organic', value: 'ORGANIC' },
				],
				default: 'ALL',
				description: 'Filter to paid or organic data',
			},
			{
				displayName: 'Created in Last 30 Days Only',
				name: 'created_in_last_n_days',
				type: 'boolean',
				default: false,
				description:
					'Whether to filter results to only pins created in the last 30 days',
			},
			{
				displayName: 'From Claimed Content',
				name: 'from_claimed_content',
				type: 'options',
				options: [
					{ name: 'Both', value: 'BOTH' },
					{ name: 'Claimed', value: 'CLAIMED' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'BOTH',
				description: 'Filter on Pins that match your claimed domain',
			},
			{
				displayName: 'Metric Types',
				name: 'metric_types',
				type: 'multiOptions',
				options: [
					{ name: 'Impressions', value: 'IMPRESSION' },
					{ name: 'Outbound Clicks', value: 'OUTBOUND_CLICK' },
					{ name: 'Saves', value: 'SAVE' },
					{ name: 'Video 10s Views', value: 'VIDEO_10S_VIEW' },
					{ name: 'Video Average Watch Time', value: 'VIDEO_AVG_WATCH_TIME' },
					{ name: 'Video MRC Views', value: 'VIDEO_MRC_VIEW' },
					{ name: 'Video Quartile 95% Views', value: 'QUARTILE_95_PERCENT_VIEW' },
					{ name: 'Video Starts', value: 'VIDEO_START' },
					{ name: 'Video Watch Time (50%)', value: 'VIDEO_V50_WATCH_TIME' },
				],
				default: [],
				description: 'Metric types to get video data for. Leave empty to retrieve all.',
			},
			{
				displayName: 'Number of Pins',
				name: 'num_of_pins',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				default: 10,
				description: 'Number of top video pins to return (1–50)',
			},
			{
				displayName: 'Pin Format',
				name: 'pin_format',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Ads Idea', value: 'ADS_IDEA' },
					{ name: 'Ads Product', value: 'ADS_PRODUCT' },
					{ name: 'Ads Standard', value: 'ADS_STANDARD' },
					{ name: 'Ads Video', value: 'ADS_VIDEO' },
					{ name: 'Organic Image', value: 'ORGANIC_IMAGE' },
					{ name: 'Organic Product', value: 'ORGANIC_PRODUCT' },
					{ name: 'Organic Video', value: 'ORGANIC_VIDEO' },
				],
				default: 'ALL',
				description: 'Pin formats to get data for',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Other Pins', value: 'OTHER_PINS' },
					{ name: 'Your Pins', value: 'YOUR_PINS' },
				],
				default: 'ALL',
				description:
					'Filter to activity from your Pins or activity created by others from your claimed accounts',
			},
		],
	},

	// ----------------------------------
	//  userAccount:listLinkedBusinesses
	// ----------------------------------
	// No parameters needed for this operation.

	// ----------------------------------
	//    userAccount:listFollowers
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowers'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 25,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowers'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},

	// ----------------------------------
	//    userAccount:listFollowing
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowing'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 25,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowing'],
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
				resource: ['userAccount'],
				operation: ['listFollowing'],
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
				displayName: 'Explicit Following Only',
				name: 'explicit_following',
				type: 'boolean',
				default: false,
				description:
					'Whether to include only explicit user follows (true) or also implicit follows via board follows (false)',
			},
			{
				displayName: 'Feed Type',
				name: 'feed_type',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Creator Only', value: 'CREATOR_ONLY' },
					{ name: 'Ranked', value: 'RANKED' },
					{ name: 'Ranked Creator Only', value: 'RANKED_CREATOR_ONLY' },
				],
				default: 'ALL',
				description: 'Type of followees to include',
			},
		],
	},

	// ----------------------------------
	//  userAccount:listFollowingBoards
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowingBoards'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 25,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowingBoards'],
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
				resource: ['userAccount'],
				operation: ['listFollowingBoards'],
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
				displayName: 'Explicit Following Only',
				name: 'explicit_following',
				type: 'boolean',
				default: false,
				description:
					'Whether to include only explicit board follows (true) or also implicit follows (false)',
			},
		],
	},

	// ----------------------------------
	//      userAccount:followUser
	// ----------------------------------
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['followUser'],
			},
		},
		description:
			'Pinterest username of the user to follow. Note: This is a beta endpoint and requires app approval from Pinterest.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['followUser'],
			},
		},
		options: [
			{
				displayName: 'Auto Follow',
				name: 'auto_follow',
				type: 'boolean',
				default: false,
				description:
					'Whether this follow is the result of an auto-follow link click. Only selected partners can be followed this way.',
			},
		],
	},

	// ----------------------------------
	//     userAccount:getWebsites
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getWebsites'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 25,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getWebsites'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},

	// ----------------------------------
	//    userAccount:verifyWebsite
	// ----------------------------------
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['verifyWebsite'],
			},
		},
		description: 'Website to verify. Use a path or domain only (e.g. example.com).',
	},
	{
		displayName: 'Verification Method',
		name: 'verificationMethod',
		type: 'options',
		options: [
			{ name: 'DNS TXT Record', value: 'DNSTXT' },
			{ name: 'Filename', value: 'FILENAME' },
			{ name: 'Metatag', value: 'METATAG' },
		],
		default: 'METATAG',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['verifyWebsite'],
			},
		},
		description: 'Method used to verify website ownership',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['verifyWebsite'],
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
	//   userAccount:unverifyWebsite
	// ----------------------------------
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['unverifyWebsite'],
			},
		},
		description: 'Website to unverify. Use a path or domain only (e.g. example.com).',
	},

	// ----------------------------------
	// userAccount:getWebsiteVerificationCode
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['getWebsiteVerificationCode'],
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
	// userAccount:listFollowingInterests
	// ----------------------------------
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowingInterests'],
			},
		},
		description: "Pinterest username whose followed interests to retrieve",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowingInterests'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 25,
		displayOptions: {
			show: {
				resource: ['userAccount'],
				operation: ['listFollowingInterests'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
