import type { INodeProperties } from 'n8n-workflow';

export const mediaFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['media'],
			},
		},
		options: [
			{
				name: 'Get Upload',
				value: 'get',
				description: 'Get the status of a media upload',
				action: 'Get a media upload',
			},
			{
				name: 'List Uploads',
				value: 'list',
				description: 'List media uploads',
				action: 'List media uploads',
			},
			{
				name: 'Upload Video',
				value: 'upload',
				description: 'Register, upload, and check processing of a video for a Pin',
				action: 'Upload a video',
			},
		],
		default: 'upload',
	},

	// ----------------------------------
	//         media:upload
	// ----------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
		description: 'Name of the binary property that contains the video file to upload',
	},
	{
		displayName: 'Wait for Processing',
		name: 'waitForProcessing',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
		description: 'Whether to wait until Pinterest finishes processing the uploaded video',
	},
	{
		displayName: 'Poll Interval (Ms)',
		name: 'pollIntervalMs',
		type: 'number',
		typeOptions: {
			minValue: 500,
			maxValue: 30000,
		},
		default: 2000,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
				waitForProcessing: [true],
			},
		},
		description: 'Time to wait between processing status checks, in milliseconds',
	},
	{
		displayName: 'Poll Timeout (Ms)',
		name: 'pollTimeoutMs',
		type: 'number',
		typeOptions: {
			minValue: 1000,
			maxValue: 600000,
		},
		default: 60000,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
				waitForProcessing: [true],
			},
		},
		description: 'Maximum time to wait for processing, in milliseconds',
	},

	// ----------------------------------
	//          media:get
	// ----------------------------------
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['get'],
			},
		},
		description: 'Numeric ID of the media upload',
	},

	// ----------------------------------
	//          media:list
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['media'],
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
				resource: ['media'],
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
				resource: ['media'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Bookmark',
				name: 'bookmark',
				type: 'string',
				default: '',
				description: 'Pagination cursor for fetching the next page',
			},
		],
	},
];
