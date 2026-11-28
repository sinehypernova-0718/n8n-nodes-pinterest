# Descriptions Reference

Contract and patterns for `nodes/Pinterest/descriptions/<Resource>Descriptions.ts`.

## Contract

Each resource exports one `INodeProperties[]` array:

```ts
import type { INodeProperties } from 'n8n-workflow';

export const thingFields: INodeProperties[] = [
	// operation selector
	// one block per operation
];
```

Register it twice:

1. `nodes/Pinterest/descriptions/index.ts`:
   `export { thingFields } from './ThingDescriptions';`
2. `nodes/Pinterest/Pinterest.node.ts`:
   spread `...thingFields` into `description.properties`.

A missing barrel export or spread means the fields never render.

## Operation selector

```ts
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
}
```

Rules:

- `noDataExpression: true` on the selector.
- `displayOptions.show` names only `resource` here.
- Operation values are camelCase (`createSection`, `listSectionPins`, `getAnalytics`).
- `name` is the human label (“Create Board Section”, “Get Multiple Pin Analytics”);
  `value` is the stable machine key.
- `action` completes the sentence “When …”; keep it imperative and lowercase except for
  proper nouns.
- Destructive operations say so in `description` and `action` (“Delete a board”).

## Field blocks

Every non-selector field names **both** resource and operation:

```ts
{
  displayName: 'Board ID',
  name: 'boardId',
  type: 'string',
  default: '',
  required: true,
  displayOptions: {
    show: {
      resource: ['board'],
      operation: ['get'],
    },
  },
  description: 'Numeric ID of the board to retrieve',
}
```

Rules:

- `required: true` only when Pinterest rejects the request without it.
- `default` matches the API default when one exists; otherwise `''`, `false`, `0` or `{}`
  as appropriate for the type.
- `description` explains the value, its format and any range. It is user-facing.
- Use the section banner before each operation block:

  ```ts
  // ----------------------------------
  //          board:update
  // ----------------------------------
  ```

## Field types

| Type           | Use                      | Notes                                                                  |
| -------------- | ------------------------ | ---------------------------------------------------------------------- |
| `string`       | ids, names, urls, dates  | Add `placeholder` for formats such as Unix timestamps.                 |
| `number`       | page sizes, ranges       | Add `typeOptions: { minValue, maxValue }`.                             |
| `boolean`      | flags                    | `default: false` unless the API default is true.                       |
| `options`      | enums                    | `options: [{ name, value }]`; value matches the API enum exactly.      |
| `multiOptions` | repeated enums           | `default: []`; the builder validates each entry.                       |
| `collection`   | optional parameter group | `name: 'additionalFields'`, `placeholder: 'Add Field'`, `default: {}`. |
| `notice`       | warnings/beta notes      | Display-only; no value is read.                                        |

There is no `resourceLocator` usage in this repo yet. If one is added, pair it with a
search function and `loadOptionsDependsOn`; do not copy Coolify's locator conventions
blindly.

## The `additionalFields` collection

Optional parameters live inside a per-operation collection:

```ts
{
  displayName: 'Additional Fields',
  name: 'additionalFields',
  type: 'collection',
  placeholder: 'Add Field',
  default: {},
  displayOptions: { show: { resource: ['thing'], operation: ['create'] } },
  options: [
    {
      displayName: 'Ad Account ID',
      name: 'ad_account_id',
      type: 'string',
      default: '',
      description: 'Advertising account identifier. Numeric only, up to 18 characters.',
    },
  ],
}
```

Rules:

- One collection per operation; do not share a collection across operations with
  different semantics.
- Field `name` is the API snake_case key (`ad_account_id`, `page_size`, `pin_filter`,
  `is_ads_only`).
- The builder reads the whole collection as `IDataObject` once.
- The builder must still validate values; the editor is not a security boundary.

## Pagination fields

Add these only when the endpoint returns `{ items, bookmark }`:

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

The `returnAll: [false]` condition hides `Limit` when the user asks for everything.

Do **not** add `returnAll`/`limit` to:

- endpoints that return a plain object (`get`, `create`, `update`);
- endpoints that return a raw array without a bookmark (`listLinkedBusinesses`);
- board list endpoints whose helper intentionally collects everything.

## Naming and labels

- Resource label: singular, title-cased (“Board”, “Entity History”, “Media”, “Pin”,
  “User Account”).
- Operation label: title-cased verb phrase (“List Board Sections”, “Get Multiple Pin
  Analytics”).
- Parameter labels: title-cased (“Board ID”, “Page Size”, “Ad Account ID”).
- Node-side parameter names: camelCase for ids already used by a resource
  (`boardId`, `sectionId`, `board_id` is the exception in pin builders because the Pin
  API body uses `board_id`).
- API field names: snake_case inside `additionalFields` and request bodies.

Preserve the existing per-resource convention rather than “normalizing” names in a
drive-by change. A rename is a breaking change for saved workflows.

## Registration checklist

- [ ] New file exports `<resource>Fields`.
- [ ] `descriptions/index.ts` re-exports it.
- [ ] `Pinterest.node.ts` spreads it into `properties`.
- [ ] New resource: add `{ name, value }` to the `resource` options.
- [ ] New operation: add the operation option and one field block per parameter.
- [ ] Every field has `displayOptions.show` with `resource` and `operation`.
- [ ] Required fields are top-level; optional fields are inside `additionalFields`.
- [ ] Pagination fields exist only for bookmarked list endpoints.

## Related references

- Builder consumes these parameters: [`request-builders.md`](request-builders.md)
- Pagination behaviour: [`pagination-and-errors.md`](pagination-and-errors.md)
- Example files: `BoardDescriptions.ts`, `PinDescriptions.ts`,
  `EntityHistoryDescriptions.ts`
