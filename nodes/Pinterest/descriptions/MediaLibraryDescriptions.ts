import type { INodeProperties } from 'n8n-workflow';

const show = (operation: string) => ({ resource: ['mediaLibrary'], operation: [operation] });

export const mediaLibraryFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['mediaLibrary'] } },
		options: [
			{
				name: 'Create Asset(s)',
				value: 'create',
				description: 'Create media library assets from uploaded media',
				action: 'Create assets',
			},
			{
				name: 'Edit Asset(s)',
				value: 'update',
				description: 'Rename or retag media library assets',
				action: 'Edit assets',
			},
			{
				name: 'Get All Assets',
				value: 'list',
				description: 'List business media library assets',
				action: 'Get all assets',
			},
			{
				name: 'Get an Asset',
				value: 'get',
				description: 'Get a media library asset',
				action: 'Get an asset',
			},
			{
				name: 'Remove Asset(s)',
				value: 'delete',
				description: 'Remove media library assets',
				action: 'Remove assets',
			},
		],
		default: 'list',
	},
	// ----------------------------------
	//      mediaLibrary:shared
	// ----------------------------------
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['mediaLibrary'],
				operation: ['list', 'create', 'update', 'delete', 'get'],
			},
		},
		description: 'Numeric ID (up to 20 digits) of the business that owns the media library assets',
	},
	// ----------------------------------
	//      mediaLibrary:list
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: show('list') },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 250 },
		default: 50,
		displayOptions: {
			show: { resource: ['mediaLibrary'], operation: ['list'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: show('list') },
		options: [
			{
				displayName: 'Asset IDs',
				name: 'asset_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated asset IDs to filter by',
			},
			{
				displayName: 'Asset Types',
				name: 'asset_types',
				type: 'string',
				default: '',
				description: 'Comma-separated IMAGE and/or VIDEO asset types',
			},
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Creation date lower bound (YYYY-MM-DD)',
			},
			{
				displayName: 'Has Been Promoted',
				name: 'has_been_promoted',
				type: 'boolean',
				default: false,
				description: 'Whether the asset has been used in a Pin promotion',
			},
			{
				displayName: 'Names',
				name: 'names',
				type: 'string',
				default: '',
				description: 'Comma-separated asset names to filter by',
			},
			{
				displayName: 'Sort Order',
				name: 'sort_order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ASC' },
					{ name: 'Descending', value: 'DESC' },
				],
				default: 'DESC',
				description: 'Sort by creation date',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated tags to filter by',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'Creation date upper bound (YYYY-MM-DD)',
			},
		],
	},
	// ----------------------------------
	//     mediaLibrary:create
	// ----------------------------------
	{
		displayName: 'Assets (JSON)',
		name: 'assets',
		type: 'json',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		displayOptions: { show: show('create') },
		description:
			'JSON array or expression returning 1 to 100 objects. Each requires string media_id and name; tags and ad_account_id are optional.',
	},
	// ----------------------------------
	//     mediaLibrary:update
	// ----------------------------------
	{
		displayName: 'Assets (JSON)',
		name: 'assets',
		type: 'json',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		displayOptions: { show: show('update') },
		description:
			'JSON array or expression returning 1 to 100 objects. Each requires asset_id and name or tags. Set either field to null to leave it unchanged; send tags: [] to clear tags.',
	},
	// ----------------------------------
	//     mediaLibrary:delete
	// ----------------------------------
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: show('delete') },
		description: 'Comma-separated numeric IDs of 1 to 100 assets to remove',
	},
	// ----------------------------------
	//      mediaLibrary:get
	// ----------------------------------
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: show('get') },
		description: 'Numeric ID of the media library asset',
	},
];
