# Codebase Baseline

Facts to establish before auditing. Treat every line as **VERIFIED against the working
tree** at the time this reference was written; re-check paths and counts after any
change.

## Package identity

- Name: `@sinehypernova-0718/n8n-nodes-pinterest`
- Version: `0.2.0`
- Package manager: `pnpm@12.4.2`
- Node API version: `1` (`n8n.n8nNodesApiVersion`)
- Strict mode: `n8n.strict: true`
- Published files: `dist` only
- Peer dependency: `n8n-workflow`
- Dev tooling: `@n8n/node-cli`, ESLint 9, Prettier 3.8.3, release-it 20.2.0,
  TypeScript 5.9.3
- Scripts: `build`, `build:watch`, `dev`, `lint`, `lint:fix`, `release`,
  `release:local`, `prepublishOnly`
- **No `test` script. No test framework. No `engines` field.**

## Node and credential

| Item               | Value                                           |
| ------------------ | ----------------------------------------------- |
| Node class         | `Pinterest implements INodeType`                |
| Node name          | `pinterest`                                     |
| Display name       | `Pinterest`                                     |
| Node version       | `1`                                             |
| Group              | `['transform']`                                 |
| Credential         | `pinterestOAuth2Api` (required)                 |
| `usableAsTool`     | `true`                                          |
| Inputs/outputs     | `NodeConnectionTypes.Main`                      |
| Base URL           | `https://api.pinterest.com/v5`                  |
| Credential class   | `PinterestOAuth2Api implements ICredentialType` |
| Credential extends | `oAuth2Api`                                     |
| Credential test    | `GET https://api.pinterest.com/v5/user_account` |

Credential hidden defaults:

- Authorization URL: `https://www.pinterest.com/oauth/`
- Access token URL: `https://api.pinterest.com/v5/oauth/token`
- Scope:
  `ads:read,user_accounts:read,user_accounts:write,boards:read,boards:write,pins:read,pins:write`
- Authentication: `header`

## Resource counts

| Resource        | Description file                            | Builder barrel                    | Operations |
| --------------- | ------------------------------------------- | --------------------------------- | ---------: |
| `board`         | `descriptions/BoardDescriptions.ts`         | `requests/board/index.ts`         |         11 |
| `entityHistory` | `descriptions/EntityHistoryDescriptions.ts` | `requests/entityHistory/index.ts` |          1 |
| `media`         | `descriptions/MediaDescriptions.ts`         | `requests/media/index.ts`         |          3 |
| `pin`           | `descriptions/PinDescriptions.ts`           | `requests/pin/index.ts`           |         11 |
| `userAccount`   | `descriptions/UserAccountDescriptions.ts`   | `requests/userAccount/index.ts`   |         14 |
| **Total**       |                                             |                                   |     **40** |

Reconcile on every audit:

```text
count(operation options in <Resource>Descriptions.ts)
  == count(case labels in the resource switch in Pinterest.node.ts)
  == count(public operation builders exported by the resource barrel)
```

No test enforces this. A single drift is a finding.

## Exact operation sets

- `pin`: `addProductTags`, `create`, `get`, `list`, `listProductTags`, `getMultiple`,
  `getAnalytics`, `update`, `delete`, `removeProductTags`, `save`
- `board`: `create`, `createSection`, `get`, `list`, `listPins`, `listSections`,
  `listSectionPins`, `delete`, `deleteSection`, `update`, `updateSection`
- `media`: `upload`, `get`, `list`
- `userAccount`: `get`, `getAnalytics`, `getTopPinsAnalytics`,
  `getTopVideoPinsAnalytics`, `listLinkedBusinesses`, `listFollowers`, `listFollowing`,
  `listFollowingBoards`, `followUser`, `getWebsites`, `verifyWebsite`,
  `unverifyWebsite`, `getWebsiteVerificationCode`, `listFollowingInterests`
- `entityHistory`: `get`

## Pagination helpers

All live in `Pinterest.node.ts`:

| Helper                             | Operation                            | Honours `limit` |
| ---------------------------------- | ------------------------------------ | --------------- |
| `collectPinListPages`              | `pin:list`                           | yes             |
| `collectBoardListPages`            | `board:list`                         | no              |
| `collectBoardPinsListPages`        | `board:listPins`                     | no              |
| `collectBoardSectionsListPages`    | `board:listSections`                 | no              |
| `collectBoardSectionPinsListPages` | `board:listSectionPins`              | no              |
| `collectMediaListPages`            | `media:list`                         | yes             |
| `collectFollowersPages`            | `userAccount:listFollowers`          | yes             |
| `collectFollowingPages`            | `userAccount:listFollowing`          | yes             |
| `collectFollowingBoardsPages`      | `userAccount:listFollowingBoards`    | yes             |
| `collectWebsitesPages`             | `userAccount:getWebsites`            | yes             |
| `collectFollowingInterestsPages`   | `userAccount:listFollowingInterests` | yes             |
| `collectEntityHistoryPages`        | `entityHistory:get`                  | yes             |

## Special execution cases

| Case                               | Where                                           | Behaviour                                                            |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `media:upload`                     | `requests/media/upload.ts` → `uploadMediaVideo` | Three HTTP calls; returns `IDataObject`; assigned to `responseData`. |
| `userAccount:listLinkedBusinesses` | inline in `execute()`                           | Raw array response; not a `{ items, bookmark }` envelope.            |
| `media:get`                        | after request in `execute()`                    | `normalizeMediaUpload(...)`.                                         |
| `pin:removeProductTags`            | after request in `execute()`                    | `normalizeProductTagRemovalResponse(...)`.                           |
| `userAccount:unverifyWebsite`      | after request in `execute()`                    | `responseData ?? {}` for 204/empty body.                             |
| Unknown operation                  | resource switch `default:`                      | `NodeOperationError` “not implemented yet”.                          |
| Unknown resource                   | outer `default:`                                | `NodeOperationError` “Unsupported resource”.                         |

## Transport and errors

- `execute()` merges `{ baseURL: PINTEREST_API_BASE_URL, json: true, ...requestOptions }`.
- Authenticated requests use
  `this.helpers.httpRequestWithAuthentication.call(this, 'pinterestOAuth2Api', options)`.
- Media storage upload uses `this.helpers.httpRequest` with `returnFullResponse: true`,
  `disableFollowRedirect: true`, `allowedDomains`, explicit `timeout` and
  `abortSignal`.
- Every request `catch` routes through `mapPinterestApiError(error, { itemIndex })`.
- `mapPinterestApiError` preserves `NodeApiError`, preserves `NodeOperationError`,
  rethrows anything else, and moves transport codes from `httpCode` to
  `context.network.code`.
- `execute()` honours `continueOnFail()` with `{ error: message }`.

## Output

```ts
const executionData = this.helpers.constructExecutionMetaData(
	this.helpers.returnJsonArray(responseData ?? {}),
	{ itemData: { item: i } },
);
returnData.push(...executionData);
```

## Config and CI

- `tsconfig.json`: `target/lib es2019` (+ `es2022.error`), `module commonjs`,
  `strict`, `noImplicitAny`, `noUnusedLocals`, `noImplicitReturns`,
  `useUnknownInCatchVariables: false`, declarations + sourcemaps, `outDir: dist/`,
  `incremental`.
- `.prettierrc.js`: tabs (tabWidth 2), single quotes, semicolons, trailing commas,
  `printWidth: 100`, `endOfLine: 'lf'`, `arrowParens: 'always'`.
- `.github/workflows/ci.yml`: PRs + pushes to `master`; `pnpm install
--frozen-lockfile` → `pnpm run lint` → `pnpm run build`.
- `dist/` is gitignored.

## What this baseline does not prove

- That Pinterest accepts any endpoint or field. Only the official contract proves that.
- That the descriptions match the builders. You must trace both.
- That the pagination helper is correct for the endpoint's envelope.
- That the operation is usable with the granted OAuth scopes.
- That README/CHANGELOG counts match the code.

## Related references

- Endpoint map: `../../pinterest-resource-implementation/references/api-contract.md`
- Verification layers: [`verification-matrix.md`](verification-matrix.md)
- Defect patterns: [`defect-patterns.md`](defect-patterns.md)
