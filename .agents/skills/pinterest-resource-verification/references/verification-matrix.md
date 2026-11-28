# Verification Matrix

The expanded audit surface. Use it as a worksheet: one row per operation, one pass per
group.

## Per-operation worksheet

Copy this table and fill it for each operation under audit. Leave a cell `UNVERIFIED`
rather than guessing.

| Cell                    | Source used | Value observed | Contract says | Match? |
| ----------------------- | ----------- | -------------- | ------------- | ------ |
| HTTP method             |             |                |               |        |
| Path                    |             |                |               |        |
| Path params             |             |                |               |        |
| Query params            |             |                |               |        |
| Required headers        |             |                |               |        |
| Body fields             |             |                |               |        |
| Required vs optional    |             |                |               |        |
| Enums / accepted values |             |                |               |        |
| Types                   |             |                |               |        |
| Defaults                |             |                |               |        |
| Constraints             |             |                |               |        |
| Response envelope       |             |                |               |        |
| Success status          |             |                |               |        |
| Documented errors       |             |                |               |        |
| Auth / scope            |             |                |               |        |
| Pagination              |             |                |               |        |
| Sync vs async           |             |                |               |        |
| Beta / deprecation      |             |                |               |        |
| Side effects            |             |                |               |        |

## Twelve-layer trace

For every operation, walk the whole chain. At each layer: what to inspect, and the
signal of an inconsistency.

| #   | Layer                          | Inspect                                                                                       | Inconsistency signal                                                                                  |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Resource/operation definitions | `resource` options in `Pinterest.node.ts`; `operation` options in `<Resource>Descriptions.ts` | operation listed without a dispatch case; label not title-cased/singular; `noDataExpression` missing  |
| 2   | Editor descriptions            | field objects in `<Resource>Descriptions.ts`                                                  | field shown but never sent; sent but never shown; missing `displayOptions.show.resource`/`.operation` |
| 3   | Display conditions             | `displayOptions.show`, `returnAll: [false]`                                                   | field visible for the wrong operation; `limit` visible while `returnAll` is true                      |
| 4   | Input validation               | `require`-style checks in builders                                                            | required id enforced only by the API; empty string sent; wrong regex/range                            |
| 5   | Request builders               | `requests/<resource>/<operation>.ts`                                                          | wrong method/path; `baseURL` set; wrong `arrayFormat`; missing `qs` guard                             |
| 6   | Exports/registration           | `<resource>/index.ts`, `requests/index.ts`                                                    | builder exported but not dispatched, or vice versa                                                    |
| 7   | Execution dispatch             | nested switches in `execute()`                                                                | wrong builder mapped; `default:` returns instead of throwing                                          |
| 8   | Transport/auth                 | options merge; credential                                                                     | call bypassing `httpRequestWithAuthentication`; builder overrides `baseURL`; token logged             |
| 9   | Response handling              | `responseData` chain, normalizers, `returnJsonArray`                                          | raw array mishandled; `undefined` body; normalizer applied to wrong operation                         |
| 10  | Errors/pagination              | `mapPinterestApiError`, `collect*Pages`                                                       | transport code in `httpCode`; unpaginated endpoint given `returnAll`; unbounded/duplicated loop       |
| 11  | Docs                           | `README.md`, `CHANGELOG.md`, `.serena/memories`                                               | counts/labels/behaviour disagree                                                                      |
| 12  | Tests/CI                       | CI workflow; absence of tests                                                                 | claiming coverage that does not exist; gate not run                                                   |

## Contract group

- [ ] Method matches the official contract.
- [ ] Path matches, including version prefix and trailing segments.
- [ ] The builder uses a relative `url`; the node supplies the base URL.
- [ ] Path parameters are validated or encoded.
- [ ] Query keys use the API's exact names and casing.
- [ ] Query values use the documented types and encodings.
- [ ] Body keys use the API's exact names and casing.
- [ ] Required fields are always sent; optional fields are conditional.
- [ ] Enums contain exactly the documented values.
- [ ] Defaults match the API, not just the editor.
- [ ] Constraints (length, range, regex, date format, base64) are enforced locally or
      deliberately left to the API.
- [ ] Response envelope is understood (`{ items, bookmark }`, object, or raw array).
- [ ] Success and error status codes are understood.
- [ ] Auth/scope requirements are understood.

## UI ↔ request consistency

- [ ] Every editor field is read by the builder.
- [ ] Every value the builder sends has a corresponding editor field for that operation.
- [ ] `displayOptions.show` names both `resource` and `operation` on every field.
- [ ] `required: true` is present exactly where required.
- [ ] `returnAll`/`limit` exist only on bookmarked endpoints.
- [ ] `limit` is hidden when `returnAll` is true.
- [ ] Optional fields live in `additionalFields`; required identifiers are top-level.
- [ ] Field labels and descriptions are accurate and user-facing.

## Types and style

- [ ] `pnpm run build` is clean under `strict`, `noUnusedLocals`,
      `noImplicitReturns`, `noImplicitAny`.
- [ ] `import type` is used for type-only imports.
- [ ] No `any` leaks; `unknown` is narrowed before use.
- [ ] Named exports only; no wildcard re-exports.
- [ ] Prettier is clean for touched files (scope the check).

## Request shaping

- [ ] Builders are pure: no I/O, no credentials, no logging, no `baseURL`.
- [ ] `url` starts with `/`.
- [ ] Optional text is omitted when empty.
- [ ] Optional arrays are omitted when empty.
- [ ] Booleans are sent only when meaningful.
- [ ] No invented defaults fill required fields.
- [ ] Repeated query keys use `arrayFormat: 'repeat'`.
- [ ] `qs` is attached only when non-empty.

## Pagination

- [ ] The endpoint actually uses `{ items, bookmark }` before a helper is used.
- [ ] The helper seeds `seenBookmarks`.
- [ ] The loop stops on absent, empty, or repeated bookmark.
- [ ] `returnAll` collects everything.
- [ ] `limit` stops/slices exactly.
- [ ] Board helpers' “collect all” behaviour matches the description (no UI limit).
- [ ] Raw-array endpoints are handled inline.
- [ ] No per-endpoint loop was added to a builder.
- [ ] Page size is within the API's allowed range.

## Errors and robustness

- [ ] Every authenticated `catch` routes through `mapPinterestApiError`.
- [ ] `NodeApiError` and `NodeOperationError` are preserved, not reclassified.
- [ ] Transport codes are moved to `context.network.code`, not left in `httpCode`.
- [ ] `continueOnFail()` emits `{ error }` and continues.
- [ ] Non-JSON/unexpected bodies are handled.
- [ ] 204/empty-body handling exists only where documented.
- [ ] Media polling terminates on success, failure and timeout.
- [ ] Error messages never expose tokens or signed upload parameters.

## n8n compatibility

- [ ] `version: 1` is intact; no accidental version bump.
- [ ] `usableAsTool: true` is intact.
- [ ] Resource and operation selectors keep `noDataExpression: true`.
- [ ] Output items preserve `{ itemData: { item: i } }`.
- [ ] `continueOnFail()` semantics are unchanged.
- [ ] No parameter rename/removal without a migration note.

## Docs

- [ ] README feature list includes the resource/operation.
- [ ] README operation tables match the code.
- [ ] CHANGELOG records the change.
- [ ] `.serena/memories` descriptions do not contradict the code.
- [ ] Beta/closed-beta restrictions are documented.

## Security

- [ ] The bearer token is never read, logged, echoed or committed.
- [ ] No secret-looking literal is assigned.
- [ ] The external upload URL is validated and domain-restricted.
- [ ] Redirects are disabled for the storage upload.
- [ ] The upload body is size-capped and timeout-bounded.
- [ ] Error output does not include request configuration.

## Recording results

- A checked-and-correct item is **VERIFIED** with the source.
- A checked-and-wrong item is a **confirmed defect** with expected vs observed.
- A suspicious-but-unproven item is a **potential defect**.
- A source conflict is **UNRESOLVED** with both sides.
- An unchecked item is **UNVERIFIED** / **not run**, with the reason.

## Related references

- Baseline: [`codebase-baseline.md`](codebase-baseline.md)
- Evidence labels and report template: [`evidence-and-reporting.md`](evidence-and-reporting.md)
- Defect classes: [`defect-patterns.md`](defect-patterns.md)
