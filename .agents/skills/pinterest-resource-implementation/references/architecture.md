# Architecture Reference

Directory layout, layer map and operation inventory for `n8n-nodes-pinterest`.

## Directory tree

```text
n8n-nodes-pinterest/
├── credentials/
│   └── PinterestOAuth2Api.credentials.ts
├── nodes/
│   └── Pinterest/
│       ├── constants.ts
│       ├── errors/
│       │   ├── index.ts
│       │   └── pinterestApiError.ts
│       ├── descriptions/
│       │   ├── BoardDescriptions.ts
│       │   ├── EntityHistoryDescriptions.ts
│       │   ├── MediaDescriptions.ts
│       │   ├── PinDescriptions.ts
│       │   ├── UserAccountDescriptions.ts
│       │   └── index.ts
│       ├── requests/
│       │   ├── board/
│       │   │   ├── create.ts
│       │   │   ├── createSection.ts
│       │   │   ├── delete.ts
│       │   │   ├── deleteSection.ts
│       │   │   ├── get.ts
│       │   │   ├── index.ts
│       │   │   ├── list.ts
│       │   │   ├── listPins.ts
│       │   │   ├── listSectionPins.ts
│       │   │   ├── listSections.ts
│       │   │   ├── update.ts
│       │   │   └── updateSection.ts
│       │   ├── entityHistory/
│       │   │   ├── get.ts
│       │   │   └── index.ts
│       │   ├── media/
│       │   │   ├── get.ts
│       │   │   ├── index.ts
│       │   │   ├── list.ts
│       │   │   ├── multipart.ts
│       │   │   ├── normalize.ts
│       │   │   ├── upload.ts
│       │   │   └── validateUploadUrl.ts
│       │   ├── pin/
│       │   │   ├── create.ts
│       │   │   ├── delete.ts
│       │   │   ├── get.ts
│       │   │   ├── getAnalytics.ts
│       │   │   ├── getMultiple.ts
│       │   │   ├── index.ts
│       │   │   ├── list.ts
│       │   │   ├── productTags.ts
│       │   │   ├── save.ts
│       │   │   └── update.ts
│       │   ├── userAccount/
│       │   │   ├── analytics.ts
│       │   │   ├── followUser.ts
│       │   │   ├── get.ts
│       │   │   ├── getWebsites.ts
│       │   │   ├── getWebsiteVerificationCode.ts
│       │   │   ├── index.ts
│       │   │   ├── listFollowers.ts
│       │   │   ├── listFollowing.ts
│       │   │   ├── listFollowingBoards.ts
│       │   │   ├── listFollowingInterests.ts
│       │   │   ├── listLinkedBusinesses.ts
│       │   │   ├── topPinsAnalytics.ts
│       │   │   ├── topVideoPinsAnalytics.ts
│       │   │   ├── unverifyWebsite.ts
│       │   │   └── verifyWebsite.ts
│       │   └── index.ts
│       ├── Pinterest.node.json
│       ├── Pinterest.node.ts
│       ├── pinterest.svg
│       └── pinterest.dark.svg
├── package.json
├── tsconfig.json
└── .github/workflows/ci.yml
```

`dist/`, `node_modules/`, `build/`, `out/`, `coverage/` and `.serena/` are generated or
tool-owned; never treat them as source.

## Layer map and exact symbols

| Layer              | Path                                            | Symbols                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential         | `credentials/PinterestOAuth2Api.credentials.ts` | `class PinterestOAuth2Api implements ICredentialType`, name `pinterestOAuth2Api`                                                                                                                                                                                                                                                                  |
| Base URL           | `nodes/Pinterest/constants.ts`                  | `PINTEREST_API_BASE_URL`                                                                                                                                                                                                                                                                                                                          |
| Main node          | `nodes/Pinterest/Pinterest.node.ts`             | `class Pinterest implements INodeType`, `description`, `execute()`                                                                                                                                                                                                                                                                                |
| Pagination         | `nodes/Pinterest/Pinterest.node.ts`             | `collectPinListPages`, `collectBoardListPages`, `collectBoardPinsListPages`, `collectBoardSectionsListPages`, `collectBoardSectionPinsListPages`, `collectMediaListPages`, `collectFollowersPages`, `collectFollowingPages`, `collectFollowingBoardsPages`, `collectWebsitesPages`, `collectFollowingInterestsPages`, `collectEntityHistoryPages` |
| Descriptions       | `nodes/Pinterest/descriptions/*Descriptions.ts` | `pinFields`, `boardFields`, `mediaFields`, `userAccountFields`, `entityHistoryFields`                                                                                                                                                                                                                                                             |
| Description barrel | `nodes/Pinterest/descriptions/index.ts`         | re-exports the five arrays                                                                                                                                                                                                                                                                                                                        |
| Builder barrels    | `nodes/Pinterest/requests/<resource>/index.ts`  | per-resource named exports                                                                                                                                                                                                                                                                                                                        |
| Request barrel     | `nodes/Pinterest/requests/index.ts`             | the only surface `Pinterest.node.ts` imports                                                                                                                                                                                                                                                                                                      |
| Errors             | `nodes/Pinterest/errors/pinterestApiError.ts`   | `mapPinterestApiError`, `PinterestApiErrorContext`                                                                                                                                                                                                                                                                                                |
| Media helpers      | `nodes/Pinterest/requests/media/`               | `buildMultipartBody`, `normalizeMediaUpload`, `normalizeMediaUploadList`, `validatePinterestUploadUrl`                                                                                                                                                                                                                                            |

## Operation inventory

The five resources and their operation option values, in the order they appear in the
description files. Keep the `execute()` cases and barrel exports aligned with this list.

### `pin` (11)

`addProductTags`, `create`, `get`, `list`, `listProductTags`, `getMultiple`,
`getAnalytics`, `update`, `delete`, `removeProductTags`, `save`

Builder module map:

- `requests/pin/create.ts` → `createPinRequest`
- `requests/pin/delete.ts` → `deletePinRequest`
- `requests/pin/get.ts` → `getPinRequest`
- `requests/pin/getAnalytics.ts` → `getPinAnalyticsRequest`
- `requests/pin/getMultiple.ts` → `getMultiplePinsRequest`
- `requests/pin/list.ts` → `listPinsRequest`
- `requests/pin/productTags.ts` → `addProductTagsRequest`, `listProductTagsRequest`, `removeProductTagsRequest`, `normalizeProductTagRemovalResponse`
- `requests/pin/save.ts` → `savePinRequest`
- `requests/pin/update.ts` → `updatePinRequest`

### `board` (11)

`create`, `createSection`, `get`, `list`, `listPins`, `listSections`, `listSectionPins`,
`delete`, `deleteSection`, `update`, `updateSection`

Each maps one-to-one to a module of the same name under `requests/board/` and a
`<verb>Board...Request` export.

### `media` (3)

`upload`, `get`, `list`

- `requests/media/upload.ts` → `uploadMediaVideo` (orchestrates three HTTP calls and
  returns `IDataObject`, not `IHttpRequestOptions`)
- `requests/media/get.ts` → `getMediaRequest`
- `requests/media/list.ts` → `listMediaRequest`

### `userAccount` (14)

`get`, `getAnalytics`, `getTopPinsAnalytics`, `getTopVideoPinsAnalytics`,
`listLinkedBusinesses`, `listFollowers`, `listFollowing`, `listFollowingBoards`,
`followUser`, `getWebsites`, `verifyWebsite`, `unverifyWebsite`,
`getWebsiteVerificationCode`, `listFollowingInterests`

### `entityHistory` (1)

`get`

## How the resource selector and fields connect

`Pinterest.node.ts` builds `description.properties` as:

```ts
properties: [
  { displayName: 'Resource', name: 'resource', type: 'options', options: [...], default: 'pin' },
  ...pinFields,
  ...boardFields,
  ...mediaFields,
  ...userAccountFields,
  ...entityHistoryFields,
]
```

A field array that is not spread here never reaches the editor, even if it is exported
from `descriptions/index.ts`.

## Related references

- Execution flow: [`execution-pipeline.md`](execution-pipeline.md)
- Builder contract: [`request-builders.md`](request-builders.md)
- Editor contract: [`descriptions.md`](descriptions.md)
- Endpoint table: [`api-contract.md`](api-contract.md)
