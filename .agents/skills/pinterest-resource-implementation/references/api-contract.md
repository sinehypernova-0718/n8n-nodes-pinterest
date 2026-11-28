# Pinterest API v5 Contract Map

A map of what the working tree claims to call. **This is not proof that Pinterest
accepts it.** Verify each row against the official Pinterest API v5 reference before
treating it as correct.

- Base URL: `https://api.pinterest.com/v5` (`PINTEREST_API_BASE_URL`)
- Auth: OAuth2 via `pinterestOAuth2Api` (extends `oAuth2Api`); the credential supplies
  the bearer token.
- Credential test: `GET /user_account`.
- Default hidden scopes:
  `ads:read,user_accounts:read,user_accounts:write,boards:read,boards:write,pins:read,pins:write`.
- List envelope: `{ items: [...], bookmark: string | null }`.
- Category/analytics envelopes vary by endpoint; do not assume a single shape.

## Pin (11)

| Operation           | Builder                    | Method + path                                     | Notes                                                                                              |
| ------------------- | -------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `addProductTags`    | `addProductTagsRequest`    | POST `/pins/{heroPinId}/product_tags`             | Body carries product tag entries.                                                                  |
| `create`            | `createPinRequest`         | POST `/pins`                                      | `board_id` + `media_source` required; optional fields omitted when empty.                          |
| `get`               | `getPinRequest`            | GET `/pins/{pinId}`                               | Optional `ad_account_id` query.                                                                    |
| `list`              | `listPinsRequest`          | GET `/pins`                                       | Bookmarked; `page_size`, filters, `arrayFormat: 'repeat'` for `creative_types`.                    |
| `listProductTags`   | `listProductTagsRequest`   | GET `/pins/{heroPinId}/product_tags`              | —                                                                                                  |
| `getMultiple`       | `getMultiplePinsRequest`   | GET `/pins/analytics`                             | Multiple-pin analytics; requires `pin_ids`, `start_date`, `end_date`, `app_types`, `metric_types`. |
| `getAnalytics`      | `getPinAnalyticsRequest`   | GET `/pins/{pinId}/analytics`                     | Date range + metric types.                                                                         |
| `update`            | `updatePinRequest`         | PATCH `/pins/{pinId}`                             | Partial update; omit unset fields.                                                                 |
| `delete`            | `deletePinRequest`         | DELETE `/pins/{pinId}`                            | —                                                                                                  |
| `removeProductTags` | `removeProductTagsRequest` | POST `/pins/{heroPinId}/product_tags/bulk-delete` | Response normalized.                                                                               |
| `save`              | `savePinRequest`           | POST `/pins/{pinId}/save`                         | Optional board/section destination.                                                                |

## Board (11)

| Operation         | Builder                       | Method + path                                     | Notes                                                                      |
| ----------------- | ----------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| `create`          | `createBoardRequest`          | POST `/boards`                                    | `name`, `privacy`, `is_ads_only`; optional `description`, `ad_account_id`. |
| `createSection`   | `createBoardSectionRequest`   | POST `/boards/{boardId}/sections`                 | `name` 1–180 chars.                                                        |
| `get`             | `getBoardRequest`             | GET `/boards/{boardId}`                           | Numeric id validated.                                                      |
| `list`            | `listBoardsRequest`           | GET `/boards`                                     | Bookmarked; privacy filter; collects all pages.                            |
| `listPins`        | `listBoardPinsRequest`        | GET `/boards/{boardId}/pins`                      | Bookmarked; collects all pages.                                            |
| `listSections`    | `listBoardSectionsRequest`    | GET `/boards/{boardId}/sections`                  | Bookmarked; collects all pages.                                            |
| `listSectionPins` | `listBoardSectionPinsRequest` | GET `/boards/{boardId}/sections/{sectionId}/pins` | Bookmarked; collects all pages.                                            |
| `delete`          | `deleteBoardRequest`          | DELETE `/boards/{boardId}`                        | Destructive.                                                               |
| `deleteSection`   | `deleteBoardSectionRequest`   | DELETE `/boards/{boardId}/sections/{sectionId}`   | Destructive.                                                               |
| `update`          | `updateBoardRequest`          | PATCH `/boards/{boardId}`                         | Partial update.                                                            |
| `updateSection`   | `updateBoardSectionRequest`   | PATCH `/boards/{boardId}/sections/{sectionId}`    | `name` required.                                                           |

## Media (3)

| Operation | Builder            | Calls                                                              | Notes                                                                                           |
| --------- | ------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `upload`  | `uploadMediaVideo` | POST `/media` → POST storage `upload_url` → GET `/media/{mediaId}` | Orchestrated; returns `IDataObject`; polls until processed unless `waitForProcessing` is false. |
| `get`     | `getMediaRequest`  | GET `/media/{mediaId}`                                             | Response normalized.                                                                            |
| `list`    | `listMediaRequest` | GET `/media`                                                       | Bookmarked; honours `returnAll`/`limit`.                                                        |

Media upload details:

- Register body: `{ media_type: 'video' }`.
- Registration response must contain `media_id`, `media_type: 'video'`, `upload_url`,
  `upload_parameters`.
- Upload parameters are validated and multipart-encoded locally.
- The storage URL is validated and domain-restricted; redirects are disabled.
- Size cap: 512 MB. Timeout: 60 s–600 s, scaled by file size.
- Supported extensions: `.mp4`, `.m4v`, `.mov`.

## User Account (14)

| Operation                    | Builder                             | Method + path                                | Notes                                               |
| ---------------------------- | ----------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `get`                        | `getUserAccountRequest`             | GET `/user_account`                          | Credential test uses the same path.                 |
| `getAnalytics`               | `getAnalyticsRequest`               | GET `/user_account/analytics`                | Date range + metrics.                               |
| `getTopPinsAnalytics`        | `getTopPinsAnalyticsRequest`        | GET `/user_account/analytics/top_pins`       | Sort/date/metric params.                            |
| `getTopVideoPinsAnalytics`   | `getTopVideoPinsAnalyticsRequest`   | GET `/user_account/analytics/top_video_pins` | Sort/date/metric params.                            |
| `listLinkedBusinesses`       | `listLinkedBusinessesRequest`       | GET `/user_account/businesses`               | Returns a **raw array**, not `{ items, bookmark }`. |
| `listFollowers`              | `listFollowersRequest`              | GET `/user_account/followers`                | Bookmarked; honours limit.                          |
| `listFollowing`              | `listFollowingRequest`              | GET `/user_account/following`                | Bookmarked; honours limit.                          |
| `listFollowingBoards`        | `listFollowingBoardsRequest`        | GET `/user_account/following/boards`         | Bookmarked; honours limit.                          |
| `followUser`                 | `followUserRequest`                 | POST `/user_account/following/{username}`    | Username is URL-encoded.                            |
| `getWebsites`                | `getWebsitesRequest`                | GET `/user_account/websites`                 | Bookmarked; honours limit.                          |
| `verifyWebsite`              | `verifyWebsiteRequest`              | POST `/user_account/websites`                | `verification_method` body.                         |
| `unverifyWebsite`            | `unverifyWebsiteRequest`            | DELETE `/user_account/websites`              | May return 204; mapped to `{}`.                     |
| `getWebsiteVerificationCode` | `getWebsiteVerificationCodeRequest` | GET `/user_account/websites/verification`    | Returns a verification code.                        |
| `listFollowingInterests`     | `listFollowingInterestsRequest`     | GET `/users/{username}/interests/follow`     | Username is URL-encoded; bookmarked.                |

## Entity History (1)

| Operation | Builder                   | Method + path                     | Notes                                                                                    |
| --------- | ------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `get`     | `getEntityHistoryRequest` | GET `/ad_accounts/entity_history` | Closed beta; requires ad account approval; not available in the API Sandbox. Bookmarked. |

## Query parameter conventions

- `ad_account_id` — numeric string, up to 18 digits. Present on many Pin and Board
  operations. Validate with `/^\d+$/` and length ≤ 18.
- `page_size` — integer 1–250. The node caps `limit` at 250 and uses 250 for
  `returnAll`.
- `bookmark` — opaque cursor. Never parse it; only echo it back.
- `pin_filter` — one of `exclude_native`, `exclude_repins`, `has_been_promoted`.
- `creative_types` — repeated query parameter; needs `arrayFormat: 'repeat'`.
- Date ranges — `YYYY-MM-DD` for analytics; Unix seconds for entity history
  (`start_time`, `end_time`).

## Response shape cautions

- List endpoints: `{ items, bookmark }`.
- Single-resource endpoints: the resource object.
- `listLinkedBusinesses`: a raw array.
- `unverifyWebsite`: possibly empty body / 204.
- Media registration: `{ media_id, media_type, upload_url, upload_parameters }`.
- Media status: `{ media_id, status, ... }` with `pending | succeeded | failed`.
- Analytics: endpoint-specific metric objects; do not invent a schema.

## Verification note

Before implementing or changing an operation, fetch the exact Pinterest reference page
and record the date. If the docs and the working tree disagree, the docs win for the
contract and the working tree is the defect. If the docs are silent, mark the cell
UNVERIFIED rather than guessing.
