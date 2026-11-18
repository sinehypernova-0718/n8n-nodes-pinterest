# Conventions

## Adding or changing an operation (4 touch points)
1. `descriptions/<Resource>Descriptions.ts` — append `INodeProperties` gated by `displayOptions.show.resource: ['<resource>']`. Operation options use `{ name, value, description, action }` with `noDataExpression: true` on the `operation` field.
2. `requests/<resource>/<operation>.ts` — export `async function <verb><Resource>Request(this: IExecuteFunctions, itemIndex: number): Promise<IHttpRequestOptions>`.
3. Export from `requests/<resource>/index.ts` and from `requests/index.ts`; the node imports only the barrel.
4. Add `case '<operation>'` to that resource's branch in `execute()`, plus a pagination branch if the endpoint returns `{ items, bookmark }`.

## Request builders
- Pure shaping: validate and return `method`/`url`/`qs`/`body`; no I/O, no `baseURL`.
- Local validation failures throw `new NodeOperationError(this.getNode(), '<Sentence-cased message>', { itemIndex })`.
- Optional inputs are omitted when `undefined` or `''` — never send empty strings or zero-value placeholders.
- Parameter naming is mixed deliberately: camelCase for node-side ids (`boardId`, `sectionId`), snake_case for Pinterest fields (`ad_account_id`, `page_size`, `is_ads_only`). Convert at the HTTP boundary; never rename the node params to match the API.

## Style
- File naming: camelCase modules; PascalCase for `*.node.ts`, `*.credentials.ts`, `*Descriptions.ts`; one operation per file under `requests/`.
- Tabs, single quotes, trailing commas, 100 columns — Prettier owns this, so `lint:fix` is safe.
- `import type { ... }` for type-only imports (lint-enforced).
- Comments/JSDoc only where behavior is non-obvious (see `errors/pinterestApiError.ts`); no restating the code.
- Unknown operation/resource falls to a `default:` that throws `NodeOperationError` ("... is not implemented yet" / "Unsupported resource: X").

## Gotchas
- A builder that returns `undefined` while `responseData` is unset is a runtime error — every dispatched operation must resolve one response.
- Transport codes (ECONNREFUSED, ETIMEDOUT, ...) must never reach `httpCode`; the mapper relocates them to `context.network.code`.
- Never add a per-endpoint pagination loop; extend the shared `collect*Pages` pattern in the node file.
- Multi-resource refactors: renaming a `*Request` function requires updating the barrel, the node's `execute` dispatch, and any referencing tests (none exist).