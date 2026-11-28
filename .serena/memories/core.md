# n8n-nodes-pinterest

n8n community node package wrapping Pinterest API v5. One node (`Pinterest`), one OAuth2 credential (`pinterestOAuth2Api`). Package `@sinehypernova-0718/n8n-nodes-pinterest`; only `dist/` is published.

## Source map
- `nodes/Pinterest/Pinterest.node.ts` — `INodeTypeDescription` + `execute()`. Resource options: `board | entityHistory | media | mediaLibrary | pin | userAccount`. `execute` loops input items, dispatches via nested resource→operation `switch`, and resolves exactly one response per item.
- `nodes/Pinterest/descriptions/<Resource>Descriptions.ts` — `INodeProperties[]` per resource, every entry gated by `displayOptions.show.resource`; wired in only through `descriptions/index.ts`.
- `nodes/Pinterest/requests/<resource>/` — one module per operation returning `IHttpRequestOptions`; `requests/index.ts` is the sole surface the node imports. 45 operation modules.
- `nodes/Pinterest/requests/media/` — video and Media Library image/video upload chain `registerMediaUpload` → `uploadToMediaStorage` → `waitForMediaProcessing` (+ `validateUploadUrl`, `normalize.ts`).
- `nodes/Pinterest/errors/pinterestApiError.ts` — `mapPinterestApiError`, the single error boundary.
- `nodes/Pinterest/constants.ts` — `PINTEREST_API_BASE_URL`.
- `credentials/PinterestOAuth2Api.credentials.ts` — credential definition.

## Invariants
- HTTP only via `this.helpers.httpRequestWithAuthentication.call(this, 'pinterestOAuth2Api', options)` with `options = { baseURL: PINTEREST_API_BASE_URL, json: true, ...requestOptions }`. Builders emit relative `url` + `qs`/`body` and must never set `baseURL`.
- Every `catch` around a request routes through `mapPinterestApiError(error, { itemIndex })`: preserves upstream `NodeApiError`, never reclassifies `NodeOperationError`, rethrows anything else.
- Output: one item per input item via `constructExecutionMetaData(returnJsonArray(...), { itemData: { item: i } })`; `continueOnFail()` emits `{ error: message }` and continues.
- Pagination exists in the 13 `collect*Pages` helpers inside the node file. Existing resources use `bookmark`; `mediaLibrary:list` follows Pinterest `pagination_token` values, validates the `assets` response array, and stops on a repeated token. Inline exception: `userAccount/listLinkedBusinesses` returns a raw array.
- Post-processing normalizes `media/get`, `pin/removeProductTags`, and `mediaLibrary/delete` (empty 204 body to `{}`), plus `userAccount/unverifyWebsite` (empty body to `{}`).
- Analysis scope: `node_modules/`, `dist/`, `build/`, `.serena/` are ignored; no source lives there.

## Pointers
- Toolchain, version pins, formatting config: `mem:tech_stack`
- Install/build/lint/release commands and Windows shell form: `mem:suggested_commands`
- Adding an operation end-to-end, validation/naming rules, gotchas: `mem:conventions`
- Definition of done before handing work back: `mem:task_completion`
