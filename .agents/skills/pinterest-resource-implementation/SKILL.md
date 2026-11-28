---
name: pinterest-resource-implementation
description: "Add or extend a Pinterest API v5 resource or operation in the n8n-nodes-pinterest community node. Use this skill whenever the user asks to implement a Pinterest operation, wire a request builder, add or change editor descriptions, add bookmark pagination, refactor a resource (board, pin, media, userAccount, entityHistory), or turn Pinterest API docs into n8n parameters — even if they only paste an endpoint or say 'add support for X'. It covers the four touch points, builder and description contracts, pagination, error mapping, connector-assisted API research, and the lint/build gates."
---

# Pinterest Resource Implementation

Implementation playbook for `@sinehypernova-0718/n8n-nodes-pinterest`. Read this when
you are writing code, not when you are auditing it — the audit counterpart is the
`pinterest-resource-verification` skill.

The repository is small on purpose: one node (`Pinterest`), one OAuth2 credential
(`pinterestOAuth2Api`), five resources, and one file per operation. Most changes are
mechanical **if** you respect the four touch points and the builder/description
contracts below. Most regressions come from changing one touch point and forgetting
another.

## Ground rules

- Read the working tree before writing. The real patterns live in
  `nodes/Pinterest/Pinterest.node.ts`, `nodes/Pinterest/descriptions/` and
  `nodes/Pinterest/requests/`. Do not infer them from this skill alone.
- Cite exact paths and symbols when you explain a change. If something is not in the
  tree, say so instead of inventing a path.
- The working tree wins over `.serena/memories/*`. Memories are useful orientation and
  may lag; when they disagree with the code, follow the code and mention the drift.
- Never invent an endpoint, query key, body field, enum value, default, status code or
  scope. Verify it against the Pinterest API v5 documentation or the upstream OpenAPI
  spec (see “Connector-assisted research”).
- Keep the existing style: tabs, single quotes, trailing commas, 100 columns, named
  exports, `import type` for types. Prettier owns formatting; `pnpm run lint:fix` is
  safe.

## The four touch points

Every new operation must land in all four places. A new **resource** additionally needs
the resource selector entry and the `execute()` branch.

| #   | File                                                                                    | What changes                                                                                                               |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | `nodes/Pinterest/descriptions/<Resource>Descriptions.ts`                                | Operation option + one `INodeProperties` block per parameter, gated by `displayOptions.show`.                              |
| 2   | `nodes/Pinterest/requests/<resource>/<operation>.ts`                                    | Export `async function <verb><Resource>Request(this: IExecuteFunctions, itemIndex: number): Promise<IHttpRequestOptions>`. |
| 3   | `nodes/Pinterest/requests/<resource>/index.ts` then `nodes/Pinterest/requests/index.ts` | Re-export the builder; the node imports only the top-level barrel.                                                         |
| 4   | `nodes/Pinterest/Pinterest.node.ts`                                                     | Add the import and a `case '<operation>':` to that resource's switch branch.                                               |

If the endpoint is paginated, add a fifth touch point: a `collect*Pages` helper and a
branch in the post-dispatch `responseData` chain (see “Pagination”).

## Execution pipeline

```text
n8n editor
  │  resource + operation selectors render fields through displayOptions.show
  ▼
descriptions/<Resource>Descriptions.ts
  │  INodeProperties[] exported as <resource>Fields
  ▼
Pinterest.node.ts → execute()
  │  1. getNodeParameter('resource' | 'operation')
  │  2. nested switch → the operation builder
  │  3. builder returns IHttpRequestOptions (or IDataObject for media upload)
  ▼
requests/<resource>/<operation>.ts
  │  reads parameters, validates locally, returns { method, url, qs?, body? }
  │  url is RELATIVE to the API base; never set baseURL here
  ▼
execute() injects { baseURL: PINTEREST_API_BASE_URL, json: true, ...requestOptions }
  ▼
this.helpers.httpRequestWithAuthentication('pinterestOAuth2Api', options)
  │  OAuth2 token is applied by the credential, never by the builder
  ▼
catch → mapPinterestApiError(error, { itemIndex })
  ▼
pagination helper (bookmarked endpoints) OR direct response
  ▼
special normalizers (media/get, pin/removeProductTags, userAccount/unverifyWebsite)
  ▼
constructExecutionMetaData(returnJsonArray(response ?? {}), { itemData: { item: i } })
```

Key invariants:

- Builders are pure shaping. No I/O, no credentials, no `baseURL`, no logging.
- The node injects `baseURL` and `json: true`. A builder that sets either would
  silently override the transport contract; do not do it.
- The single error boundary is `mapPinterestApiError`. Every `catch` around an
  authenticated request routes through it.
- One input item produces exactly one output item (or one `{ error }` item when
  `continueOnFail()` is on).

## Phase 0 — Research the contract

Before writing code, pin the contract. Use the connectors that are actually mounted in
the session; discover them rather than assuming.

- **Pinterest API v5 docs / OpenAPI** — primary. Record the method, path, path/query/
  body parameters, required flags, enums, defaults, constraints, response envelope and
  status codes. Note the date you checked, because Pinterest changes endpoints.
- **Exa** — `tools.exa.web_search_exa` / `web_fetch_exa` for endpoint discovery and
  “what changed” questions.
- **Firecrawl** — scrape the official `developers.pinterest.com` reference pages when
  you need structured page content.
- **context7** — n8n-specific API questions about `n8n-workflow`, `IExecuteFunctions`,
  `INodeProperties`, `resourceLocator`, or `httpRequestWithAuthentication`.
- **GitHub** — this repo's issues/PRs/history, plus comparable n8n community nodes for
  editor conventions. Use the GitHub server, not raw `gh` calls.
- **gitmcp** — public-repo documentation when a dependency or example lives on GitHub.
- **Serena** — symbol-level navigation in this repo: `get_symbols_overview`,
  `find_symbol`, `find_referencing_symbols`, `search_for_pattern`.
- **fff / `rg` / `fd`** — fast local search for builders, exports and description
  fields.

If a connector namespace is absent (`search({ namespace: "serena" })` returns nothing),
fall back to native reads and `rg`/`fd`; do not pretend the tool ran.

Minimum facts to capture per operation:

| Cell             | Question                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| Method + path    | Exact HTTP verb and path relative to `https://api.pinterest.com/v5`.          |
| Path params      | Which values are interpolated, and are they numeric ids or URL-encoded names? |
| Query params     | Snake_case API names, types, ranges, defaults, array format.                  |
| Body             | Required vs optional fields, nested objects, enums, length limits.            |
| Auth             | OAuth2 scope/ability required by the endpoint.                                |
| Response         | Envelope (`{ items, bookmark }` vs raw object vs raw array) and status codes. |
| Pagination       | Bookmark-based, offset-based, or unpaginated.                                 |
| Side effects     | Does a repeat call create duplicate state?                                    |
| Beta/deprecation | Closed beta, sandbox restrictions, planned removal.                           |

## Phase 1 — Write the request builder

Location: `nodes/Pinterest/requests/<resource>/<operation>.ts`.

```ts
import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const ALLOWED_VALUES = ['A', 'B'] as const;

export async function createThingRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const id = (this.getNodeParameter('thingId', itemIndex, '') as string).trim();
	if (!id) {
		throw new NodeOperationError(this.getNode(), 'Thing ID is required to create a thing', {
			itemIndex,
		});
	}
	if (!/^\d+$/.test(id)) {
		throw new NodeOperationError(this.getNode(), 'Thing ID must contain only digits', {
			itemIndex,
		});
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const qs: IDataObject = {};
	const body: IDataObject = { name: 'required value' };

	const mode = additionalFields.mode;
	if (mode !== undefined && mode !== '') {
		if (typeof mode !== 'string' || !ALLOWED_VALUES.includes(mode)) {
			throw new NodeOperationError(
				this.getNode(),
				`Mode must be one of: ${ALLOWED_VALUES.join(', ')}`,
				{ itemIndex },
			);
		}
		qs.mode = mode;
	}

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `/things/${id}`,
		body,
	};
	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}
	return requestOptions;
}
```

Builder rules:

- Signature: `(this: IExecuteFunctions, itemIndex: number)`; a paginated builder adds
  `bookmark?: string`.
- Return `{ method, url, qs?, body?, arrayFormat? }`. `url` starts with `/` and is
  relative to the base URL.
- Read parameters with `this.getNodeParameter(name, itemIndex, default)`. Read
  `additionalFields` once as `IDataObject`.
- Validate locally when the API would reject the call anyway. Throw
  `new NodeOperationError(this.getNode(), '<Sentence-cased message>', { itemIndex })`.
- Omit optional values when they are `undefined` or `''`; omit arrays when empty. Never
  send empty strings or zero-value placeholders — Pinterest treats many optional fields
  as “present” when the key exists.
- Add `qs` only when it has keys. Use `arrayFormat: 'repeat'` for repeated query keys.
- Encode path segments that are user-supplied names with `encodeURIComponent`; numeric
  ids are trimmed and validated instead.
- Convert node parameter names to API field names at this boundary. The repo mixes
  camelCase node ids (`boardId`, `sectionId`) with snake_case API fields
  (`ad_account_id`, `page_size`); preserve that convention rather than renaming either
  side.

## Phase 2 — Export the builder

1. Add the named export to `nodes/Pinterest/requests/<resource>/index.ts`.
2. Add or extend the matching export block in `nodes/Pinterest/requests/index.ts`.
3. Import it in `Pinterest.node.ts` from `./requests` (never from the deep module).

A builder that is not exported from both barrels cannot be dispatched. A builder that
is exported but has no `case` is dead code. Keep the three lists in sync:

```text
description operation option value
  == registry/barrel export name
  == execute() case label
```

## Phase 3 — Add the editor description

Location: `nodes/Pinterest/descriptions/<Resource>Descriptions.ts`.

```ts
export const thingFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['thing'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a thing',
				action: 'Create a thing',
			},
		],
		default: 'create',
	},

	// ----------------------------------
	//           thing:create
	// ----------------------------------
	{
		displayName: 'Thing ID',
		name: 'thingId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['thing'], operation: ['create'] } },
		description: 'Numeric ID of the thing',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['thing'], operation: ['create'] } },
		options: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{ name: 'A', value: 'A' },
					{ name: 'B', value: 'B' },
				],
				default: 'A',
				description: 'Mode to apply',
			},
		],
	},
];
```

Description rules:

- `displayOptions.show` on **every** field must name both `resource` and `operation`.
  The operation selector itself names only `resource`.
- Operation options use `{ name, value, description, action }`; `noDataExpression: true`
  on the selector; one sensible `default`.
- Use `type: 'collection'` named `additionalFields` for optional parameters. This is the
  repo's grouping mechanism — there is no v1/v2 optional-field split here.
- Required identifiers are top-level fields with `required: true`; optional filters live
  inside the collection.
- Use snake_case `name` values for API fields inside `additionalFields`; camelCase for
  node-side identifiers where the existing resource already does so.
- Use `typeOptions: { minValue, maxValue }` on numbers and `type: 'multiOptions'` for
  repeated enums.
- Add the `// ----------------------------------` / `// <resource>:<operation>` banner
  before each operation block; it keeps the large files readable.
- Register the array in `descriptions/index.ts` and spread it into `properties` in
  `Pinterest.node.ts`.

New resource checklist:

- Add `{ name: '<Label>', value: '<resource>' }` to the `resource` options.
- Create `descriptions/<Resource>Descriptions.ts` exporting `<resource>Fields`.
- Export it from `descriptions/index.ts`.
- Spread `...<resource>Fields` into `description.properties`.
- Add the resource branch to `execute()` with its own nested operation switch.
- Add a `default:` that throws
  `NodeOperationError(node, 'The <Resource> operation "<op>" is not implemented yet', { itemIndex })`.

## Phase 4 — Wire the dispatch case

In `Pinterest.node.ts`:

```ts
case 'create':
	requestOptions = await createThingRequest.call(this, i);
	break;
```

Rules:

- `requestOptions` is for `IHttpRequestOptions` builders.
- `responseData` is for builders that already produced a response (media upload).
- `default:` must throw `NodeOperationError` with `{ itemIndex }`; never return
  `undefined` silently.
- If the operation returns a raw array or needs normalization, add it to the
  post-dispatch chain rather than hiding that logic in the builder.

## Pagination

Bookmark pagination lives only in `collect*Pages` helpers inside `Pinterest.node.ts`.
Do not add a per-endpoint loop to a builder.

UI pattern (description):

```ts
{
	displayName: 'Return All',
	name: 'returnAll',
	type: 'boolean',
	default: false,
	displayOptions: { show: { resource: ['thing'], operation: ['list'] } },
	description: 'Whether to return all results or only up to a given limit',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	typeOptions: { minValue: 1, maxValue: 250 },
	default: 50,
	displayOptions: {
		show: { resource: ['thing'], operation: ['list'], returnAll: [false] },
	},
	description: 'Max number of results to return',
},
```

Builder pattern: accept `bookmark?: string`, read `returnAll`/`limit`, set
`page_size`, and reuse the caller's bookmark when present.

Helper pattern: loop, append `response.items`, stop when the bookmark is absent, empty
or repeated (`seenBookmarks`), re-invoke the builder with the new bookmark, and return
`returnAll ? collected : collected.slice(0, limit)`.

Then add an `else if (resource === '<resource>' && operation === '<operation>')` branch
in the `responseData` chain in `execute()`.

Endpoint nuance: not every list endpoint honours a page limit. `userAccount/listLinkedBusinesses`
returns a raw array and is handled inline; it must not be forced through the
`{ items, bookmark }` helper. Check the response envelope before reusing a helper.

## Error handling

- Route every `catch` around an authenticated request through
  `mapPinterestApiError(error, { itemIndex })`.
- Let `NodeApiError` and `NodeOperationError` pass through; do not reclassify a local
  validation error as an API error.
- Preserve `continueOnFail()`: emit `{ error: (error as Error).message }` and continue.
- `mapPinterestApiError` relocates transport codes (`ECONNREFUSED`, `ETIMEDOUT`, …)
  from `httpCode` to `context.network.code`. Do not add a second transport slot.
- Treat a `204`/empty body as a success only where the endpoint documents it
  (`userAccount/unverifyWebsite` is the existing example).

## Special execution shapes

| Shape                 | Example                              | Rule                                                                                                            |
| --------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Standard request      | Most builders                        | Return `IHttpRequestOptions`; execute sends it.                                                                 |
| Orchestrated response | `media/upload`                       | The builder performs the 3-step media flow and returns `IDataObject`; set `responseData`, not `requestOptions`. |
| Raw-array response    | `userAccount/listLinkedBusinesses`   | Handle inline in `execute()`; do not wrap in a pagination helper.                                               |
| Response normalizer   | `media/get`, `pin/removeProductTags` | Normalize after the request, before output.                                                                     |
| Empty-body success    | `userAccount/unverifyWebsite`        | Coalesce `undefined` to `{}`.                                                                                   |

The media upload flow is the most security-sensitive code in the repo: validate the
returned upload URL, pin the allowed domain, disable redirects, cap the size and
timeout, and never echo signed upload parameters in an error.

## Verification gates

Run these from the repo root, in order:

```powershell
pnpm run lint
pnpm run build
```

Then confirm the published surface still resolves:

- `dist/nodes/Pinterest/Pinterest.node.js`
- `dist/credentials/PinterestOAuth2Api.credentials.js`

Optional formatting gate for touched files:

```powershell
pnpm exec prettier --check nodes/Pinterest/...
```

There is no test suite and no `test` script. CI runs `pnpm install --frozen-lockfile`,
`pnpm run lint` and `pnpm run build` only. Never claim “tests pass”.

## Common traps

- **Forgot the barrel.** The node imports from `./requests`; a deep import type-checks
  but breaks the established surface.
- **Forgot the dispatch case.** The editor shows the operation, but execution falls to
  `default:` and throws “not implemented yet”.
- **`baseURL` in a builder.** It overrides the injected base URL because of spread
  order. Builders must stay relative.
- **Sending empty strings.** Optional text fields should be omitted, not sent as `''`.
- **Wrong array encoding.** Repeated query keys need `arrayFormat: 'repeat'`.
- **Numeric id vs encoded name.** Validate numeric ids; `encodeURIComponent` usernames.
- **Pagination drift.** Reuse the `collect*Pages` shape; do not clone a subtly different
  loop, and do not add `returnAll` to an endpoint that returns a plain object/array.
- **Description drift.** A field shown but never read, or read but never shown, is a
  defect even if the code compiles.
- **CI-only proof.** `lint` + `build` prove types and style, not API correctness.

## Connector-assisted research

Use one server for the job and add a second only when it adds information.

| Need                                     | Preferred connector          | Fallback                               |
| ---------------------------------------- | ---------------------------- | -------------------------------------- |
| Pinterest endpoint contract              | Exa / Firecrawl / `webfetch` | Official docs page via `webfetch`      |
| n8n API/types                            | context7                     | Read `node_modules/n8n-workflow` types |
| Repo symbols and references              | Serena                       | `rg` / `fd` / direct reads             |
| Hosted repo state (issues, PRs, history) | GitHub MCP                   | shell `git`                            |
| Public-repo docs                         | gitmcp                       | Exa / `webfetch`                       |
| Local content search                     | fff                          | `rg`                                   |

Discover namespaces per session:

```js
search({ namespace: 'serena' });
search({ namespace: 'github' });
search({ namespace: 'exa' });
```

If a namespace is empty, use the native fallback and say which path you used. Never
report a connector call you did not make.

## Reference files

Read only what the task needs.

| File                                                                           | Read it for                                                                      |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [`references/architecture.md`](references/architecture.md)                     | Directory tree, layer map, exact symbols, operation inventory.                   |
| [`references/execution-pipeline.md`](references/execution-pipeline.md)         | `execute()` walkthrough, dispatch, special cases, output shape.                  |
| [`references/request-builders.md`](references/request-builders.md)             | Builder templates, validation, omission, array/path/encoding rules, media chain. |
| [`references/descriptions.md`](references/descriptions.md)                     | `INodeProperties` patterns, operation selector, collections, pagination fields.  |
| [`references/pagination-and-errors.md`](references/pagination-and-errors.md)   | Bookmark loops, helper inventory, error mapping, 204 handling.                   |
| [`references/api-contract.md`](references/api-contract.md)                     | Endpoint table for all five resources, auth/scopes, response envelopes.          |
| [`references/new-resource-checklist.md`](references/new-resource-checklist.md) | Copy-paste checklist for a brand-new resource.                                   |

## Definition of done

- The operation appears in the editor with correct `displayOptions`.
- The builder is exported from both barrels and dispatched by a `case`.
- The builder validates required inputs and omits empty optional values.
- Pagination exists only if the endpoint is bookmark-paginated, and reuses the shared
  helper shape.
- Errors route through `mapPinterestApiError`; `continueOnFail()` works.
- `pnpm run lint` and `pnpm run build` pass; `dist/` contains the node and credential.
- README/CHANGELOG are updated when the public operation surface changed.
