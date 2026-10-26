/**
 * Pinterest returns an S3 upload URL when a media upload is registered. Only
 * Pinterest's media bucket is accepted so a malformed or compromised response
 * cannot redirect the upload to an arbitrary host (including internal or cloud
 * metadata addresses).
 *
 * The bucket name is fixed while the documented S3 endpoint variants are
 * allowed, including regional and dual-stack forms.
 */
const PINTEREST_MEDIA_UPLOAD_HOST_PATTERNS = [
	/^pinterest-media-upload\.s3-accelerate\.amazonaws\.com$/,
	/^pinterest-media-upload\.s3-accelerate\.dualstack\.amazonaws\.com$/,
	/^pinterest-media-upload\.s3\.amazonaws\.com$/,
	/^pinterest-media-upload\.s3\.dualstack\.[a-z0-9-]+\.amazonaws\.com$/,
	/^pinterest-media-upload\.s3[.-][a-z0-9-]+\.amazonaws\.com$/,
];

export interface ValidatedUploadUrl {
	url: string;
	hostname: string;
}

function tryParseUrl(value: string): URL | undefined {
	try {
		return new URL(value);
	} catch {
		return undefined;
	}
}

/**
 * Validates a Pinterest media upload URL before it is used with the
 * unauthenticated HTTP helper.
 */
export function validatePinterestUploadUrl(value: unknown): ValidatedUploadUrl {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error('Pinterest did not return a media upload URL');
	}

	const url = tryParseUrl(value.trim());
	if (url === undefined) {
		throw new Error('Pinterest returned an invalid media upload URL');
	}

	if (url.protocol !== 'https:') {
		throw new Error('Pinterest returned a media upload URL that does not use HTTPS');
	}
	if (url.username !== '' || url.password !== '') {
		throw new Error('Pinterest returned a media upload URL with embedded credentials');
	}
	if (url.port !== '' && url.port !== '443') {
		throw new Error('Pinterest returned a media upload URL with an unsupported port');
	}
	if (url.hash !== '') {
		throw new Error('Pinterest returned a media upload URL with a fragment');
	}

	const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
	if (!PINTEREST_MEDIA_UPLOAD_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
		throw new Error('Pinterest returned a media upload URL on an unsupported host');
	}

	return {
		url: url.toString(),
		hostname,
	};
}
