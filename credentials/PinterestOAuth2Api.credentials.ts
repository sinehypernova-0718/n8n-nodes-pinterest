import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PinterestOAuth2Api implements ICredentialType {
	name = 'pinterestOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Pinterest OAuth2 API';

	icon: Icon = { light: 'file:../nodes/Pinterest/pinterest.svg', dark: 'file:../nodes/Pinterest/pinterest.dark.svg' };

	documentationUrl = 'https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://www.pinterest.com/oauth/',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.pinterest.com/v5/oauth/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'user_accounts:read,boards:read,boards:write,pins:read,pins:write',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://api.pinterest.com/v5',
			url: '/user_account',
		},
	};
}
