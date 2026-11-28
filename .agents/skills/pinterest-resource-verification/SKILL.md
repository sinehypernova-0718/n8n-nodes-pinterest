---
name: pinterest-resource-verification
description: "Audit a Pinterest API v5 resource or operation in the n8n-nodes-pinterest community node against the working tree and the authoritative Pinterest contract. Use this skill whenever the user asks to verify, review, audit, QA, or sanity-check a Pinterest operation, compare the node to Pinterest docs or the OpenAPI spec, find bugs before a release, or confirm that descriptions, builders, exports, dispatch, pagination and error handling agree — even if they only say 'is this right?' or paste an endpoint. Produces an evidence-labelled defect report and never edits code."
---

# Pinterest Resource Verification

Audit playbook for `@sinehypernova-0718/n8n-nodes-pinterest`. This is the read-only
counterpart of the `pinterest-resource-implementation` skill: that skill tells you how
to build a resource; this one tells you how to prove whether an existing one is correct
and how to report what you found.

A verification task is **read-only**. Do not edit code, docs, memories or configuration.
Do not commit, push, publish or release without explicit authorization. If a fix is
obvious, describe it under “Correction” in the report; do not apply it.

## Evidence labels

Use exactly one label on every claim:

- **VERIFIED** — read directly in the working tree (path + symbol) or in the fetched
  authoritative upstream source/spec. State which.
- **INFERRED** — deduced from VERIFIED facts. State the deduction.
- **UNRESOLVED** — sources conflict, or a claim could not be confirmed. Report both
  sides; never pick silently.
- **UNVERIFIED** — assumed or not checked. Say so.

A memory is never evidence on its own. It may orient you, but the code and the official
Pinterest contract win; a disagreement between them is itself a finding.

## Verification standards (binding)

1. A green `pnpm run lint` / `pnpm run build` proves types and style, **never** API
   correctness.
2. Following an existing convention proves consistency, **not** correctness. A
   wrong-but-consistent builder passes every convention check.
3. Check the official Pinterest contract independently of the code. Never derive an
   endpoint, field or default from the node's own builder.
4. Verify **every operation individually**. Two operations of the same resource rarely
   share a contract.
5. Never invent an endpoint, path/query/body parameter, header, accepted value, type,
   default, response shape, status code or OAuth scope.
6. Never claim a command or check ran unless it actually ran. Report the rest as
   **not run** with the reason.
7. Separate **confirmed defect**, **potential defect**, **unverified behaviour** and
   **accepted limitation**.
8. Prefer evidence: exact path, symbol, line, and the source that proves it.
9. State the Pinterest API version/date you checked against, and the repository state
   (`master` or branch, commit) you audited.
10. No test suite exists. “Add coverage” means: say the layer is absent, exercise the
    behaviour by reading type-checked code, and flag the gap. Never invent a framework.

## Repository baseline (working tree is the truth)

The node currently exposes **five resources** and **40 operations**:

| resource value  | label          | description file                            | builder barrel                    | operations |
| --------------- | -------------- | ------------------------------------------- | --------------------------------- | ---------: |
| `board`         | Board          | `descriptions/BoardDescriptions.ts`         | `requests/board/index.ts`         |         11 |
| `entityHistory` | Entity History | `descriptions/EntityHistoryDescriptions.ts` | `requests/entityHistory/index.ts` |          1 |
| `media`         | Media          | `descriptions/MediaDescriptions.ts`         | `requests/media/index.ts`         |          3 |
| `pin`           | Pin            | `descriptions/PinDescriptions.ts`           | `requests/pin/index.ts`           |         11 |
| `userAccount`   | User Account   | `descriptions/UserAccountDescriptions.ts`   | `requests/userAccount/index.ts`   |         14 |

Reconcile the counts by hand on every change: the number of operation options in a
description file must equal the number of dispatched `case` labels and the number of
exported builders. No test enforces this.

Layered map:

- `nodes/Pinterest/Pinterest.node.ts` — class `Pinterest implements INodeType`.
  - `description: INodeTypeDescription` with `version: 1`, `usableAsTool: true`,
    `group: ['transform']`, credential `pinterestOAuth2Api`.
  - `properties` = resource selector + `...pinFields`, `...boardFields`,
    `...mediaFields`, `...userAccountFields`, `...entityHistoryFields`.
  - `execute()` — per-item loop, nested `switch (resource) → switch (operation)`,
    transport call, pagination helpers, normalizers, output, error handling.
  - Twelve `collect*Pages` helpers: pin list, board list, board pins, board sections,
    board section pins, media list, followers, following, following boards, websites,
    following interests, entity history.
- `nodes/Pinterest/descriptions/` — one `<Resource>Descriptions.ts` per resource;
  `index.ts` re-exports the five field arrays.
- `nodes/Pinterest/requests/` — one module per operation; `<resource>/index.ts` barrels;
  top-level `index.ts` is the only surface the node imports.
- `nodes/Pinterest/requests/media/` — upload orchestration plus `multipart.ts`,
  `normalize.ts`, `validateUploadUrl.ts`.
- `nodes/Pinterest/errors/pinterestApiError.ts` — `mapPinterestApiError`, the single
  error boundary.
- `nodes/Pinterest/constants.ts` — `PINTEREST_API_BASE_URL = 'https://api.pinterest.com/v5'`.
- `credentials/PinterestOAuth2Api.credentials.ts` — OAuth2 credential extending
  `oAuth2Api`, hidden auth URLs/scope, test request `GET /user_account`.
- `package.json` — `n8n.n8nNodesApiVersion: 1`, `n8n.strict: true`, only `dist`
  published; scripts `build`, `build:watch`, `dev`, `lint`, `lint:fix`, `release`,
  `release:local`, `prepublishOnly`; **no `test` script**.
- `tsconfig.json` — `strict`, `noImplicitAny`, `noUnusedLocals`, `noImplicitReturns`,
  `useUnknownInCatchVariables: false`, `target/lib es2019`, `outDir: dist/`.
- `.github/workflows/ci.yml` — `pnpm install --frozen-lockfile` → `pnpm run lint` →
  `pnpm run build`.

Exact baseline details live in [`references/codebase-baseline.md`](references/codebase-baseline.md).

## Source-of-truth hierarchy

Highest first; a lower source never overrides a higher one.

1. **Pinterest API v5 official reference / OpenAPI spec** — pinned by date (and version
   if one is published). Machine-readable, but check it against live behaviour when
   the docs are ambiguous.
2. **Pinterest official guides, changelog and deprecation notes** — auth, scopes, rate
   limits, sandbox restrictions, beta features.
3. **The working tree** — descriptions, builders, barrels, dispatch, transport, errors.
4. **`.serena/memories/*`** — orientation only; may lag.
5. **Search snippets, third-party examples, AI output, assumptions** — never
   authoritative.

When the spec and observed behaviour disagree, record both and mark the cell
**UNRESOLVED**. When the docs are silent, read the endpoint's own documentation and the
builder; if still ambiguous, mark it **UNVERIFIED** rather than guessing.

Always pin the version: “checked against Pinterest API v5 docs on 2026-11-28” is a
verification fact; “the API says” is not.

## Per-operation verification matrix

For every operation, verify each cell against the hierarchy above.

- HTTP method and the exact path relative to `https://api.pinterest.com/v5`.
- Path parameters; query parameters; required headers; request body.
- Required vs optional fields; accepted values/enums; types; defaults; constraints
  (lengths, ranges, regex, base64, date format, numeric-id length).
- Response envelope and relevant status codes (success and documented errors).
- Auth requirements and OAuth scopes/abilities.
- Pagination, filtering, sorting; synchronous vs asynchronous execution.
- Version-specific behaviour, beta/closed-beta restrictions, deprecations.
- Side effects and repeat-call safety for mutations.

### Operation inventory (derived from the working tree)

| Resource      | Operation                    | Builder                             | Method + path                                             |
| ------------- | ---------------------------- | ----------------------------------- | --------------------------------------------------------- |
| pin           | `addProductTags`             | `addProductTagsRequest`             | POST `/pins/{heroPinId}/product_tags`                     |
| pin           | `create`                     | `createPinRequest`                  | POST `/pins`                                              |
| pin           | `get`                        | `getPinRequest`                     | GET `/pins/{pinId}`                                       |
| pin           | `list`                       | `listPinsRequest`                   | GET `/pins`                                               |
| pin           | `listProductTags`            | `listProductTagsRequest`            | GET `/pins/{heroPinId}/product_tags`                      |
| pin           | `getMultiple`                | `getMultiplePinsRequest`            | GET `/pins/analytics`                                     |
| pin           | `getAnalytics`               | `getPinAnalyticsRequest`            | GET `/pins/{pinId}/analytics`                             |
| pin           | `update`                     | `updatePinRequest`                  | PATCH `/pins/{pinId}`                                     |
| pin           | `delete`                     | `deletePinRequest`                  | DELETE `/pins/{pinId}`                                    |
| pin           | `removeProductTags`          | `removeProductTagsRequest`          | POST `/pins/{heroPinId}/product_tags/bulk-delete`         |
| pin           | `save`                       | `savePinRequest`                    | POST `/pins/{pinId}/save`                                 |
| board         | `create`                     | `createBoardRequest`                | POST `/boards`                                            |
| board         | `createSection`              | `createBoardSectionRequest`         | POST `/boards/{boardId}/sections`                         |
| board         | `get`                        | `getBoardRequest`                   | GET `/boards/{boardId}`                                   |
| board         | `list`                       | `listBoardsRequest`                 | GET `/boards`                                             |
| board         | `listPins`                   | `listBoardPinsRequest`              | GET `/boards/{boardId}/pins`                              |
| board         | `listSections`               | `listBoardSectionsRequest`          | GET `/boards/{boardId}/sections`                          |
| board         | `listSectionPins`            | `listBoardSectionPinsRequest`       | GET `/boards/{boardId}/sections/{sectionId}/pins`         |
| board         | `delete`                     | `deleteBoardRequest`                | DELETE `/boards/{boardId}`                                |
| board         | `deleteSection`              | `deleteBoardSectionRequest`         | DELETE `/boards/{boardId}/sections/{sectionId}`           |
| board         | `update`                     | `updateBoardRequest`                | PATCH `/boards/{boardId}`                                 |
| board         | `updateSection`              | `updateBoardSectionRequest`         | PATCH `/boards/{boardId}/sections/{sectionId}`            |
| media         | `upload`                     | `uploadMediaVideo`                  | POST `/media` → POST storage URL → GET `/media/{mediaId}` |
| media         | `get`                        | `getMediaRequest`                   | GET `/media/{mediaId}`                                    |
| media         | `list`                       | `listMediaRequest`                  | GET `/media`                                              |
| userAccount   | `get`                        | `getUserAccountRequest`             | GET `/user_account`                                       |
| userAccount   | `getAnalytics`               | `getAnalyticsRequest`               | GET `/user_account/analytics`                             |
| userAccount   | `getTopPinsAnalytics`        | `getTopPinsAnalyticsRequest`        | GET `/user_account/analytics/top_pins`                    |
| userAccount   | `getTopVideoPinsAnalytics`   | `getTopVideoPinsAnalyticsRequest`   | GET `/user_account/analytics/top_video_pins`              |
| userAccount   | `listLinkedBusinesses`       | `listLinkedBusinessesRequest`       | GET `/user_account/businesses`                            |
| userAccount   | `listFollowers`              | `listFollowersRequest`              | GET `/user_account/followers`                             |
| userAccount   | `listFollowing`              | `listFollowingRequest`              | GET `/user_account/following`                             |
| userAccount   | `listFollowingBoards`        | `listFollowingBoardsRequest`        | GET `/user_account/following/boards`                      |
| userAccount   | `followUser`                 | `followUserRequest`                 | POST `/user_account/following/{username}`                 |
| userAccount   | `getWebsites`                | `getWebsitesRequest`                | GET `/user_account/websites`                              |
| userAccount   | `verifyWebsite`              | `verifyWebsiteRequest`              | POST `/user_account/websites`                             |
| userAccount   | `unverifyWebsite`            | `unverifyWebsiteRequest`            | DELETE `/user_account/websites`                           |
| userAccount   | `getWebsiteVerificationCode` | `getWebsiteVerificationCodeRequest` | GET `/user_account/websites/verification`                 |
| userAccount   | `listFollowingInterests`     | `listFollowingInterestsRequest`     | GET `/users/{username}/interests/follow`                  |
| entityHistory | `get`                        | `getEntityHistoryRequest`           | GET `/ad_accounts/entity_history`                         |

This table is a **map of what the code claims**, not proof that Pinterest accepts it.
Every row must be checked against the official contract before it is called verified.

## Trace every operation through twelve layers

| #   | Layer                        | Inspect                                                                                       | Inconsistency signal                                                                                     |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Resource/operation selectors | `resource` options in `Pinterest.node.ts`; `operation` options in `<Resource>Descriptions.ts` | operation shown without a `case`; label not title-cased; `noDataExpression` missing                      |
| 2   | Editor fields                | field objects in `<Resource>Descriptions.ts`                                                  | field shown but never read, or read but never shown; missing `displayOptions.show.resource`/`.operation` |
| 3   | Display conditions           | `displayOptions.show`, `returnAll: [false]`                                                   | field visible for the wrong operation; `limit` visible while `returnAll` is true                         |
| 4   | Input validation             | builder `NodeOperationError` checks                                                           | required id only enforced by the API; empty string sent; wrong regex/range                               |
| 5   | Request builder              | `requests/<resource>/<operation>.ts`                                                          | wrong method/path; `baseURL` in builder; wrong `method` casing; missing `arrayFormat`                    |
| 6   | Exports/registration         | `<resource>/index.ts`, `requests/index.ts`                                                    | builder exported but not dispatched, or dispatched but not exported                                      |
| 7   | Execution dispatch           | `execute()` nested switches                                                                   | wrong builder mapped to an operation; `default:` returns instead of throwing                             |
| 8   | Transport/auth               | `execute()` options merge, credential                                                         | call bypassing `httpRequestWithAuthentication`; token read/logged; builder overrides `baseURL`           |
| 9   | Response handling            | `responseData` chain, normalizers, `returnJsonArray`                                          | raw array mishandled; `undefined` body; normalization applied to the wrong operation                     |
| 10  | Errors/pagination            | `mapPinterestApiError`, `collect*Pages`                                                       | transport code left in `httpCode`; unpaginated endpoint given `returnAll`; unbounded/duplicated loop     |
| 11  | Docs                         | `README.md`, `CHANGELOG.md`, `.serena/memories`                                               | counts/labels/behaviour disagree with code                                                               |
| 12  | Tests/CI                     | `.github/workflows/ci.yml`; absence of tests                                                  | claiming coverage that does not exist; CI gate not actually run                                          |

## Universal verification checklist

Run every group for every resource.

**Contract**

- [ ] Method + path of every operation match the pinned Pinterest contract.
- [ ] Path segments are encoded correctly (numeric ids validated; usernames `encodeURIComponent`).
- [ ] Query keys, body keys, required/optional status, enums, types, defaults and
      constraints match the contract.
- [ ] Spec-vs-observed differences are recorded, not silently resolved.

**UI ↔ request consistency**

- [ ] Every editor field maps to a body/query/path element the builder sends.
- [ ] Every sent element maps to a field the editor shows for that operation.
- [ ] Every field's `displayOptions.show` names both `resource` and `operation`.
- [ ] `required: true` is present exactly where the API requires the value.
- [ ] `returnAll`/`limit` exist only on bookmark-paginated endpoints, with `limit`
      hidden when `returnAll` is true.

**Types and style**

- [ ] `pnpm run build` is clean under `strict`, `noUnusedLocals`, `noImplicitReturns`,
      `noImplicitAny`.
- [ ] `import type` is used for type-only imports; no `any` leaks.
- [ ] Named exports only; no wildcard re-exports.

**Request shaping**

- [ ] Builders are pure: no I/O, no credentials, no `baseURL`, no logging.
- [ ] `url` is relative and starts with `/`.
- [ ] Optional values are omitted when `undefined`/`''`; empty arrays are omitted.
- [ ] Booleans are sent only when meaningful; no invented defaults.
- [ ] Repeated query keys use `arrayFormat: 'repeat'`.

**Pagination**

- [ ] Bookmark endpoints follow the `collect*Pages` shape.
- [ ] The loop terminates on absent/empty/repeated bookmarks.
- [ ] `returnAll` collects everything; `limit` slices exactly.
- [ ] Raw-array endpoints are not forced through the `{ items, bookmark }` helper.
- [ ] No per-endpoint loop was added to a builder.

**Errors and robustness**

- [ ] Every authenticated `catch` routes through `mapPinterestApiError`.
- [ ] Only `NodeApiError` / `NodeOperationError` (with `{ itemIndex }`) are surfaced.
- [ ] `continueOnFail()` emits `{ error }` and continues.
- [ ] Transport codes never remain in `httpCode`.
- [ ] `204`/empty-body handling exists only where the endpoint documents it.
- [ ] Non-JSON/unexpected bodies are handled, not assumed.

**Special flows**

- [ ] Media upload validates the URL, restricts the domain, disables redirects, caps
      size/timeout, and never leaks signed parameters.
- [ ] Media polling terminates on `succeeded`, `failed` and timeout.
- [ ] Normalizers (`media/get`, `pin/removeProductTags`) validate the actual shape.

**Security**

- [ ] The bearer token is never read, logged, echoed or committed.
- [ ] Error output never exposes the token or signed upload parameters.
- [ ] No secret-looking literal is assigned (lint `no-hardcoded-secrets`).

**Docs and compatibility**

- [ ] README/CHANGELOG counts, labels and behaviour match the code.
- [ ] No operation/parameter renamed or removed without a migration note.
- [ ] A changed default does not silently change an existing workflow's request.

## Connector-assisted methodology

Pick the one server that owns the task; add a second only when it adds information the
first cannot. Cross-check; never ask another agent “is it correct?” instead of reading
the code and the contract yourself.

- **Pinterest official docs / OpenAPI** — primary. Fetch the exact endpoint page.
- **Exa** (`tools.exa.web_search_exa`, `web_fetch_exa`) — independent research,
  endpoint discovery, changelog hunting.
- **Firecrawl** (`tools.firecrawl.firecrawl_scrape` / `_map` / `_crawl` / `_search`) —
  structured extraction of `developers.pinterest.com` pages.
- **GitHub** — this repo's issues/PRs/history and comparable n8n nodes. Use the GitHub
  server; fall back to shell `git` for local VCS.
- **gitmcp** — public-repo docs (`llms.txt`, README) for dependencies.
- **context7** — `n8n-workflow` API questions.
- **Serena** — `get_symbols_overview`, `find_symbol` (`include_body: false`, `depth: 0`),
  `find_referencing_symbols`, `get_diagnostics_for_file`, `search_for_pattern`, memories.
- **fff / `rg` / `fd`** — local content and file discovery.

Tool availability is session-dependent. Discover it:

```js
search({ namespace: 'serena' });
search({ namespace: 'github' });
search({ namespace: 'exa' });
search({ namespace: 'context7' });
```

An empty namespace in one session does not prove it is universally unavailable; use
the native fallback (`rg`, `fd`, `git`, direct reads) and record which path you used.

Order of authority for a claim: official Pinterest contract (pinned) → repo code →
memory → web snippet. A web snippet alone is never enough to call something verified.

## Audit procedure

1. **Identify** the resource and enumerate its intended operations from the selector,
   the barrel and the README.
2. **Inspect the working tree**: `git status`, `git diff`, recent `git log`, and whether
   the resource exists on `master` or only on a branch.
3. **Establish the baseline** from `references/codebase-baseline.md` and the actual code.
4. **Research every operation** against the pinned contract.
5. **Build a contract → code mapping**: one row per operation (method, path, qs, body,
   required, response) → builder file/symbol.
6. **Trace every operation** through the twelve layers.
7. **Compare** with an equivalent resource to separate a legitimate difference from a
   defect (for example, raw-array vs bookmarked responses).
8. **Audit UI behaviour** (show/hide, required, defaults).
9. **Inspect types, edge cases, errors, pagination and security**.
10. **Review tests/coverage**: record the absence of a suite; do not fabricate one.
11. **Run the gates**: `pnpm run lint`, `pnpm run build`. Optionally
    `pnpm exec prettier --check <touched files>`. Report real output.
12. **Review docs and the final diff** (`git status`, `git diff`).
13. **Produce the report** using the template below.

## Defect patterns to look for

These are investigation prompts, not conclusions. The full list with repo-specific
examples is in [`references/defect-patterns.md`](references/defect-patterns.md).

- **D1 — Description/dispatch/export drift.** An operation option without a `case`, a
  `case` without an export, or a field shown but never read.
- **D2 — Duplicated pagination helpers.** Twelve near-identical `collect*Pages`
  functions invite drift; some do not honour `limit`.
- **D3 — Raw-array special cases.** `listLinkedBusinesses` returns an array, not
  `{ items, bookmark }`; a generic helper would silently produce nothing.
- **D4 — Orchestrated builder vs standard builder.** `uploadMediaVideo` returns
  `IDataObject` and bypasses the requestOptions path; audits must trace its three HTTP
  calls separately.
- **D5 — Mixed identifier naming.** `boardId`/`sectionId` (camelCase) vs `board_id`/
  `ad_account_id` (snake_case). Renaming one side can break parameter lookup.
- **D6 — Empty-body success.** `unverifyWebsite` maps `undefined` to `{}`; other
  endpoints must not inherit that behaviour blindly.
- **D7 — Multi-export modules.** `productTags.ts` exports three builders plus a
  normalizer; a barrel/dispatch mismatch is easy.
- **D8 — No tests, lint+build only.** CI proves types and style, not the contract.
- **D9 — Closed beta / sandbox restrictions.** `entityHistory` is closed beta; do not
  assume it works in the sandbox.
- **D10 — `baseURL`/`json` injection.** `execute()` spreads the builder last, so a
  builder that sets `baseURL` overrides the transport silently.
- **D11 — Unencoded path ids.** Numeric ids are interpolated raw; only some are
  validated. Check every path builder.
- **D12 — OAuth scope breadth.** The credential hides a broad scope list; verify the
  endpoint actually needs it and that the docs still list it.

## Reporting format

One block per finding:

```text
Severity:      blocker | high | medium | low | info
Category:      confirmed defect | potential defect | unverified behaviour | accepted limitation
Resource/op:   <resource>:<operation>  (or "cross-cutting")
Location:      <exact path> — <symbol>  (line where useful)
Evidence:      <what you read/fetched; the source and its version/date>
Expected:      <the authoritative contract, with the source>
Observed:      <what the code does>
Impact:        <runtime effect on a workflow>
Correction:    <minimal recommended change>  (do NOT apply in a read-only audit)
Verification:  VERIFIED | INFERRED | UNRESOLVED | UNVERIFIED
```

Rules:

- Cite the file and symbol for every code claim and the source + date for every API
  claim.
- State explicitly what you did **not** verify.
- Distinguish a confirmed defect (a source proves the code wrong) from a potential
  defect (suspicious, unproven), unverified behaviour (not checked) and an accepted
  limitation (a deliberate, documented choice).
- Never assert “no issues” without naming what you inspected and what you ran.
- A check you did not run is reported as **not run** with the reason — never as passed.

## Reference files

| File                                                                           | Read it for                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| [`references/codebase-baseline.md`](references/codebase-baseline.md)           | Exact tree, counts, symbols, endpoint inventory, repo state. |
| [`references/verification-matrix.md`](references/verification-matrix.md)       | Expanded twelve-layer trace and full checklist.              |
| [`references/evidence-and-reporting.md`](references/evidence-and-reporting.md) | Labels, severity, report template, claim rules.              |
| [`references/defect-patterns.md`](references/defect-patterns.md)               | General defect classes with verified repo examples.          |
| [`references/mcp-methodology.md`](references/mcp-methodology.md)               | Connector-by-connector usage, discovery and fallbacks.       |
