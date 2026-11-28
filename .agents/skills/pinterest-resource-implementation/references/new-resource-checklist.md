# New Resource Checklist

Use this when adding a whole resource, not just one operation. Copy it into the task
notes and tick every line. A resource is only “done” when all four touch points agree
and the gates pass.

## Phase 0 — Research

- [ ] Fetch the Pinterest API v5 reference for every intended endpoint; record the date.
- [ ] For each operation capture: method, path, path/query/body params, required flags,
      enums, defaults, constraints, response envelope, status codes, OAuth scope.
- [ ] Decide which operations are list endpoints and whether they return
      `{ items, bookmark }` or a raw array.
- [ ] Decide which operations are destructive and word the labels accordingly.
- [ ] Note beta/closed-beta or sandbox restrictions.

## Phase 1 — Request builders

Create `nodes/Pinterest/requests/<resource>/`:

- [ ] One `<operation>.ts` per operation, exporting
      `<verb><Resource>Request(this: IExecuteFunctions, itemIndex: number)`.
- [ ] Paginated builders add `bookmark?: string` as the third parameter.
- [ ] Each builder reads required fields, validates them, reads `additionalFields`,
      omits empty optionals, and returns `{ method, url, qs?, body? }`.
- [ ] `url` is relative and starts with `/`; no `baseURL`, no `json`.
- [ ] Numeric ids are validated; user-supplied names are `encodeURIComponent`-encoded.
- [ ] Arrays use `arrayFormat: 'repeat'` where the API expects repeated keys.
- [ ] Local validation throws `NodeOperationError(node, '<Sentence-cased>', { itemIndex })`.
- [ ] Special flows (upload, poll, normalize) are separated from pure builders.
- [ ] `index.ts` re-exports every public function.

## Phase 2 — Exports

- [ ] Add the resource block to `nodes/Pinterest/requests/index.ts`.
- [ ] Import the builders in `Pinterest.node.ts` from `./requests`.
- [ ] Confirm no deep imports remain.

## Phase 3 — Descriptions

Create `nodes/Pinterest/descriptions/<Resource>Descriptions.ts`:

- [ ] `export const <resource>Fields: INodeProperties[]`.
- [ ] Operation selector with `noDataExpression: true` and `displayOptions.show.resource`.
- [ ] One operation option per implemented operation: `{ name, value, description, action }`.
- [ ] One field block per parameter, each gated by `resource` + `operation`.
- [ ] Required identifiers are top-level with `required: true`.
- [ ] Optional fields live in `additionalFields` (`type: 'collection'`, `default: {}`).
- [ ] `returnAll`/`limit` only on bookmarked endpoints; `limit` hidden when
      `returnAll` is true.
- [ ] Section banners before each operation block.
- [ ] Export from `descriptions/index.ts`.
- [ ] Spread `...<resource>Fields` into `description.properties`.

## Phase 4 — Node registration and dispatch

In `nodes/Pinterest/Pinterest.node.ts`:

- [ ] Add `{ name: '<Label>', value: '<resource>' }` to the `resource` options.
- [ ] Add `case '<resource>':` with a nested `switch (operation)`.
- [ ] Add one `case` per operation, calling the right builder.
- [ ] Add the `default:` that throws “The <Resource> operation … is not implemented yet”.
- [ ] Confirm `requestOptions` vs `responseData` is correct for each builder.
- [ ] Add the resource to the final `default:` message coverage (`Unsupported resource`).

## Phase 5 — Pagination

For each bookmarked list operation:

- [ ] Add a `collect<Thing>Pages` helper in `Pinterest.node.ts` using the shared shape.
- [ ] Seed `seenBookmarks`; stop on absent/empty/repeated bookmark.
- [ ] Honour `limit` or intentionally collect all (and omit the UI limit).
- [ ] Re-invoke the builder with the new bookmark.
- [ ] Add the `else if (resource === '<resource>' && operation === '<operation>')` branch
      in the `responseData` chain.
- [ ] Verify the response envelope actually contains `items` and `bookmark`.

For raw-array endpoints:

- [ ] Handle inline in `execute()`; do not force a helper.

## Phase 6 — Errors and special handling

- [ ] Every authenticated `catch` routes through `mapPinterestApiError`.
- [ ] `continueOnFail()` works for the new operations.
- [ ] 204/empty-body endpoints map to `{}` only where documented.
- [ ] Response normalizers are applied to the right operations.
- [ ] No token, signed upload parameter or raw request config is logged or surfaced.

## Phase 7 — Documentation

- [ ] Add the resource to the README feature list and operation tables.
- [ ] Add the operations to the CHANGELOG under the unreleased section.
- [ ] If behavior changes for an existing parameter, add a migration note.
- [ ] Update `.serena/memories/core.md` / `conventions.md` if the architecture changed.

## Phase 8 — Gates

Run from the repo root:

```powershell
pnpm run lint
pnpm run build
```

- [ ] Lint is clean.
- [ ] Build succeeds and regenerates `dist/`.
- [ ] `dist/nodes/Pinterest/Pinterest.node.js` exists.
- [ ] `dist/credentials/PinterestOAuth2Api.credentials.js` exists.
- [ ] Optional: `pnpm exec prettier --check` on touched files.
- [ ] Do not claim tests passed; there is no test suite.

## Final consistency check

```text
operation option value  ==  execute() case label  ==  exported builder name
```

Walk each list once. Drift between them is the most common defect in this repo.

## Copy-paste skeleton

```ts
// requests/<resource>/create.ts
import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function createThingRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const name = (this.getNodeParameter('name', itemIndex, '') as string).trim();
	if (!name) {
		throw new NodeOperationError(this.getNode(), 'Name is required to create a thing', {
			itemIndex,
		});
	}

	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const body: IDataObject = { name };
	const description = additionalFields.description;
	if (description !== undefined && description !== '') {
		body.description = description;
	}

	return { method: 'POST', url: '/things', body };
}
```

```ts
// descriptions/ThingDescriptions.ts
import type { INodeProperties } from 'n8n-workflow';

export const thingFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['thing'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a thing', action: 'Create a thing' },
		],
		default: 'create',
	},
	// ----------------------------------
	//           thing:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['thing'], operation: ['create'] } },
		description: 'Name of the thing',
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the thing',
			},
		],
	},
];
```
