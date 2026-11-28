# Request Builder Reference

Contract and patterns for `nodes/Pinterest/requests/<resource>/<operation>.ts`.

## Contract

```ts
import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function <verb><Resource>Request(
	this: IExecuteFunctions,
	itemIndex: number,
	// bookmark?: string,   // paginated builders only
): Promise<IHttpRequestOptions> {
	// read → validate → shape → return
}
```

Rules:

1. **Pure shaping.** No HTTP calls, no credential access, no logging, no `baseURL`, no
   `json: true`. The node injects those.
2. **Relative URL.** `url` starts with `/` and is relative to
   `https://api.pinterest.com/v5`.
3. **Local validation.** Throw before the request when the API would reject it anyway:

   ```ts
   throw new NodeOperationError(this.getNode(), 'Board ID is required to get a board', {
   	itemIndex,
   });
   ```

   Messages are sentence-cased and name the field. Always pass `{ itemIndex }`.

4. **Omit empties.** Skip optional values that are `undefined` or `''`; skip arrays when
   empty; skip `qs` when it has no keys. Pinterest often treats a present key as an
   instruction, so `''` is not “unset”.
5. **Named exports only.** One builder per file unless the operations are tightly
   related (`pin/productTags.ts` exports three builders plus a normalizer).

## Return object

```ts
interface IHttpRequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | ...;
  url: string;
  qs?: IDataObject;
  body?: IDataObject;
  arrayFormat?: 'repeat';
  // Do not add baseURL / json / headers here for standard builders.
}
```

- `method` is an uppercase HTTP verb.
- `qs` is the query string. Use the API's snake_case names (`page_size`,
  `ad_account_id`, `pin_filter`).
- `body` is the JSON body. Use the API's field names.
- `arrayFormat: 'repeat'` is required when a query value is an array that must be sent
  as `?key=a&key=b`. Existing example: `listPinsRequest` sets it when
  `creative_types` is an array.

## Parameter access

```ts
const id = (this.getNodeParameter('boardId', itemIndex, '') as string).trim();
const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
const pageSize = additionalFields.page_size;
```

- Top-level required fields are read by their node name.
- Optional fields live inside `additionalFields` and keep their API snake_case names.
- Numbers and booleans are read with safe defaults; validate the runtime type before
  using them.
- A paginated builder accepts `bookmark?: string` and prefers it over the user-entered
  `additionalFields.bookmark`:

  ```ts
  const pageBookmark = bookmark ?? additionalFields.bookmark;
  if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
  	qs.bookmark = pageBookmark.trim();
  }
  ```

## Validation patterns

| Kind          | Pattern                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Required text | Trim, test `!value`, throw `'<Field> is required to <action>'`.             |
| Numeric id    | `/^\d+$/`; some ids also cap length (ad account id ≤ 18).                   |
| Enum          | `const VALUES = [...] as const`; test `VALUES.includes(value)`.             |
| Integer range | `Number.isInteger(value) && value >= min && value <= max`.                  |
| Date          | `/^\d{4}-\d{2}-\d{2}$/` then `Date.parse`; reject invalid and out-of-range. |
| Base64        | Check non-empty; do not decode unless the API contract requires it.         |
| Comma list    | Split, trim, reject empty entries and enforce the count cap.                |
| Boolean       | `typeof value === 'boolean'` where the API distinguishes absent from false. |
| Array enum    | Iterate and reject the first unsupported value, naming it.                  |

## Omission rules

Send a field only when the user set it:

- Text → non-empty after trim.
- Number → a finite number (and within range).
- Boolean → only when the API needs an explicit value; do not send `false` just because
  it is the editor default when the API's default is also false.
- Array → non-empty; enumerate valid values.
- Object → at least one meaningful key.
- `qs` → only attach when `Object.keys(qs).length > 0`.
- `body` → required fields always; optional fields conditionally.

Never send an empty string, an empty array, or a fabricated default to “fill” a required
field. If a required value is missing, fail locally.

## Path construction and encoding

- Numeric ids are trimmed, validated, then interpolated:
  ``url: `/boards/${boardId}/pins` ``.
- User-supplied names use `encodeURIComponent`:
  ``url: `/user_account/following/${encodeURIComponent(username)}` `` and
  ``url: `/users/${encodeURIComponent(username)}/interests/follow` ``.
- Never interpolate an unvalidated string into a path. If a value can contain `/`,
  `?`, `#`, or spaces, encode it.

## Worked examples

### Create with optional fields (`board/create.ts`)

```ts
const name = (this.getNodeParameter('name', itemIndex, '') as string).trim();
if (!name) {
	throw new NodeOperationError(this.getNode(), 'Name is required to create a board', {
		itemIndex,
	});
}

const body: IDataObject = { name, privacy, is_ads_only: isAdsOnly };
const description = additionalFields.description;
if (description !== undefined && description !== '') {
	body.description = description;
}

const requestOptions: IHttpRequestOptions = { method: 'POST', url: '/boards', body };
```

### List with limit and bookmark (`pin/list.ts`)

```ts
const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
if (returnAll) {
	qs.page_size = 250;
} else {
	const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
	if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
		throw new NodeOperationError(this.getNode(), 'Limit must be an integer between 1 and 250', {
			itemIndex,
		});
	}
	qs.page_size = limit;
}
```

### Simple GET (`userAccount/get.ts`)

```ts
return { method: 'GET', url: '/user_account' };
```

## Media upload chain (the exception)

`requests/media/upload.ts` is not a pure builder. It orchestrates the three-step video
upload and returns `IDataObject`, so `execute()` assigns it to `responseData`.

```text
1. POST /media                         (register)  → { media_id, upload_url, upload_parameters }
2. POST <upload_url>                   (storage)   → 2xx confirmation
3. GET  /media/{media_id}              (status)    → { status: pending|succeeded|failed, ... }
   poll until succeeded / failed / timeout
```

Security and robustness rules:

- `validatePinterestUploadUrl` must parse and allow only the expected host; reject
  non-HTTPS or unexpected schemes.
- The storage request sets `disableFollowRedirect: true` and an explicit
  `allowedDomains`.
- The timeout scales with file size, clamped between `UPLOAD_TIMEOUT_MIN_MS` and
  `UPLOAD_TIMEOUT_MAX_MS`.
- The file is capped at `MAX_VIDEO_UPLOAD_BYTES` (512 MB).
- Error messages may include a sanitized HTTP status or transport code, never the signed
  form parameters or the raw request configuration.
- `waitForProcessing` polls with `sleepWithAbort` and the execution cancel signal; on
  timeout it tells the user to check the status later with `media:get`.

## Related references

- Description fields that feed these parameters: [`descriptions.md`](descriptions.md)
- Pagination and error handling: [`pagination-and-errors.md`](pagination-and-errors.md)
- Endpoints: [`api-contract.md`](api-contract.md)
