# Defect Patterns and Regression Risks

Each pattern is a **general rule** followed by a **verified instance** from this repo
(where one exists) and an **audit rule**. Treat the instance as evidence of the shape,
not as the only possible occurrence.

## D1 — Description / dispatch / export drift

**General.** The operation option, the `execute()` case and the barrel export are three
separate lists. They must agree exactly.

**Verified instance.** The working tree is consistent at the time of writing: five
resources, 40 operations, matching descriptions, switches and barrels. `pin/productTags.ts`
exports three builders plus a normalizer, so the barrel is longer than a naive
one-line-per-operation count.

**Audit rule.** Reconcile three counts per resource. A `case` without an export fails at
build/type-check time; an option without a `case` reaches `default:` and throws “not
implemented yet” at runtime; an export without a `case` is dead code.

## D2 — Duplicated pagination helpers drift

**General.** Copy-pasted pagination loops diverge. One helper honours `limit`, another
does not; one checks `response.items`, another assumes `response.data`.

**Verified instance.** Twelve `collect*Pages` helpers in `Pinterest.node.ts` share the
same shape. The four board helpers collect every page and do not read `returnAll`/
`limit`; the board descriptions expose no such fields, so the behaviour is internally
consistent. The other helpers honour `returnAll`/`limit`.

**Audit rule.** For each helper, compare (a) the response envelope it reads, (b) whether
it reads `returnAll`/`limit`, (c) the description fields, (d) the builder's `page_size`
handling. Any mismatch is at least a potential defect.

## D3 — Raw-array response forced through an envelope helper

**General.** A list helper that reads `response.items` silently yields nothing when the
endpoint returns a bare array.

**Verified instance.** `userAccount:listLinkedBusinesses` returns a raw array
(`GET /user_account/businesses`) and is handled inline in `execute()` with a comment
saying so. It is not routed through a `collect*Pages` helper.

**Audit rule.** Confirm the envelope of every list endpoint against the docs. If the
response is a bare array, handle it inline and do not add `returnAll`/`limit`.

## D4 — Orchestrated builder vs standard builder

**General.** One operation may perform several HTTP calls and return a response object
instead of `IHttpRequestOptions`. Treating it like the others breaks dispatch.

**Verified instance.** `media:upload` calls `uploadMediaVideo`, which performs
`POST /media` (register), `POST <upload_url>` (storage), and `GET /media/{media_id}`
(status) and returns `IDataObject`. `execute()` assigns its result to `responseData`,
not `requestOptions`.

**Audit rule.** Trace each HTTP call separately. The storage call is intentionally
unauthenticated (`helpers.httpRequest`, not the OAuth helper) and must validate the URL,
restrict the domain, disable redirects, and cap size/timeout.

## D5 — Mixed identifier naming

**General.** The repo mixes camelCase node ids (`boardId`, `sectionId`) with snake_case
API fields (`board_id`, `ad_account_id`, `is_ads_only`). A description/builder mismatch
means the builder reads a value the user never set.

**Verified instance.** `board/get.ts` reads `boardId`; `pin/create.ts` reads `board_id`
and writes it into the body. Both are correct for their resource, but the names differ.

**Audit rule.** Compare the `name` in the description with the exact string passed to
`getNodeParameter` in the builder. Do not “normalize” a name in an audit; a rename is a
breaking change for saved workflows.

## D6 — Empty-body success generalized too far

**General.** A `204`/empty body is a success only where the endpoint documents it.
Mapping `undefined` to `{}` everywhere hides real failures.

**Verified instance.** `userAccount:unverifyWebsite` may return no body; `execute()`
coalesces `undefined` to `{}` for that operation only.

**Audit rule.** Verify that the 204 handling is scoped to the documented operation and
that the output is not silently empty for endpoints that should return data.

## D7 — Multi-export module misses a dispatch case

**General.** A module with several builders is easy to half-wire.

**Verified instance.** `pin/productTags.ts` exports `addProductTagsRequest`,
`listProductTagsRequest`, `removeProductTagsRequest` and
`normalizeProductTagRemovalResponse`. Each operation has its own `case` and its own
description block.

**Audit rule.** For every multi-export module, confirm each builder has a case, an
operation option, and the right normalizer (if any).

## D8 — “Lint/build green ⇒ done”

**General.** CI proves types and style, not the API contract.

**Verified instance.** `package.json` has no `test` script; `.github/workflows/ci.yml`
runs install → lint → build only.

**Audit rule.** Never report “tests pass”. Report lint/build output, and state that the
contract was checked by reading code vs docs, not by an automated test.

## D9 — Closed beta / sandbox restrictions

**General.** A documented endpoint may be unavailable without account approval or in the
API Sandbox.

**Verified instance.** `EntityHistoryDescriptions.ts` says the operation is closed beta,
requires app approval from Pinterest, and is not available in the API Sandbox.

**Audit rule.** Record environment restrictions as an accepted limitation or a docs
finding; do not call the implementation wrong because the sandbox rejects it.

## D10 — `baseURL`/`json` override in a builder

**General.** `execute()` spreads the builder last:
`{ baseURL, json: true, ...requestOptions }`. A builder that sets `baseURL` or `json`
silently overrides the transport contract.

**Verified instance.** Standard builders return only `method`, `url`, `qs`, `body`,
`arrayFormat`. The media orchestration function sets its own options because it bypasses
the standard path.

**Audit rule.** Grep all builders for `baseURL` and `json`. Any occurrence in a standard
builder is a confirmed defect or a documented exception.

## D11 — Unvalidated / unencoded path ids

**General.** A path segment must be either a validated numeric id or
`encodeURIComponent`-encoded. Raw interpolation of arbitrary text allows path traversal
or malformed URLs.

**Verified instance.** `board/get.ts` validates `/^\d+$/` before interpolating
`boardId`. `userAccount/followUser.ts` and `listFollowingInterests.ts` use
`encodeURIComponent(username)`.

**Audit rule.** For every builder, classify each interpolated value: numeric (validated)
or name (encoded). Flag anything else.

## D12 — OAuth scope breadth vs least privilege

**General.** A broad hidden scope list grants more than an operation needs and is hard
for users to reason about.

**Verified instance.** The credential hides the scope
`ads:read,user_accounts:read,user_accounts:write,boards:read,boards:write,pins:read,pins:write`.

**Audit rule.** Compare the scopes an operation needs with the granted set. Flag a
missing scope as a blocker; flag unnecessary breadth as low/info unless it violates a
documented policy.

## D13 — Boolean absence vs `false`

**General.** Some APIs distinguish “field absent” from “field set to false”. Sending
`false` because it is the editor default can change behaviour.

**Verified instance.** `createBoardRequest` explicitly sends `is_ads_only: false`
because the create contract expects a value. `listPinsRequest` sends `pin_metrics` only
when it is `true`.

**Audit rule.** For each boolean, check the API default and whether the field is
required. Do not assume “send when true” or “send always” without the contract.

## D14 — Response normalizer assumptions

**General.** A normalizer that blindly indexes a response hides a malformed payload and
may emit `undefined` fields.

**Verified instance.** `media/normalize.ts` exports `normalizeMediaUpload` and
`normalizeMediaUploadList`; `pin/productTags.ts` exports
`normalizeProductTagRemovalResponse`. Both are applied only to their operations.

**Audit rule.** Read the normalizer: does it validate the shape and throw a
`NodeOperationError` on an unexpected payload, or does it silently coerce? Is it applied
to the right operation only?

## D15 — Parameter name collisions across operations

**General.** Reusing `name`, `privacy`, `description` across operations is fine only if
`displayOptions.show.operation` scopes each field.

**Verified instance.** `board` reuses `name` and `boardId` across create/update/get/
delete, each gated by its operation list.

**Audit rule.** Confirm every reused field is gated to the operations that read it, and
that no two fields with the same name are visible simultaneously with different
semantics.

## D16 — Documentation/memory drift

**General.** README, CHANGELOG and Serena memories can describe a resource or operation
that the code does not have, or omit one it does.

**Verified instance.** `.serena/memories/core.md` says “41 operation modules”; the
working tree exposes 40 operations (the difference is a helper module or a counting
convention). Treat the code as authoritative and note the discrepancy as low/info.

**Audit rule.** Reconcile README tables and memory claims against the code; report drift
as a docs finding, not as an API defect.

## Using these patterns

- Start from the general rule, then look for the repo instance.
- Do not report a pattern as a defect without the expected contract and the observed
  code.
- When a pattern is intentional and documented, classify it as an **accepted
  limitation**.
- When the source is missing, classify as **UNVERIFIED**, not as a defect.

## Related references

- Layers and checklist: [`verification-matrix.md`](verification-matrix.md)
- Reporting template: [`evidence-and-reporting.md`](evidence-and-reporting.md)
- Baseline: [`codebase-baseline.md`](codebase-baseline.md)
