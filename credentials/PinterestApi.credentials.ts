import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PinterestApi implements ICredentialType {
	name = 'pinterestApi';

	displayName = 'Pinterest API';

	icon: Icon = { light: 'file:../nodes/Pinterest/pinterest.svg', dark: 'file:../nodes/Pinterest/pinterest.dark.svg' };

	documentationUrl =
		'https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/#use-a-token';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.pinterest.com/v5',
			url: '/user_account',
			method: 'GET',
		},
	};
}
