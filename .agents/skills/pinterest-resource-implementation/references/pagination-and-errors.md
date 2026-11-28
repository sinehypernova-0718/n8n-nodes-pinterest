# Pagination and Error Handling Reference

Two cross-cutting concerns that are easy to get subtly wrong: bookmark pagination and
the single error boundary.

## Pagination model

Pinterest API v5 list responses use:

```json
{
  "items": [ ... ],
  "bookmark": "opaque-cursor-or-null"
}
```

There is no offset/page-number pagination in the endpoints this node uses. Pagination is
therefore cursor-based and lives in `Pinterest.node.ts`, never in a builder.

### Builder side

- Paginated builders accept `bookmark?: string`.
- The builder reads `returnAll`/`limit` only to choose `page_size`.
- The builder reuses the caller's bookmark over the user-entered one.
- The builder does not loop.

```ts
export async function listThingsRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	bookmark?: string,
): Promise<IHttpRequestOptions> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const qs: IDataObject = {};

	if (returnAll) {
		qs.page_size = 250;
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
		if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
			throw new NodeOperationError(this.getNode(), 'Limit must be an integer between 1 and 250', {
				itemIndex,
			});
		}
		qs.page_size = limit;
	}

	const pageBookmark =
		bookmark ?? (this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject).bookmark;
	if (typeof pageBookmark === 'string' && pageBookmark.trim() !== '') {
		qs.bookmark = pageBookmark.trim();
	}

	return { method: 'GET', url: '/things', qs };
}
```

### Node side

The `collect*Pages` helper:

1. Reads `returnAll` and `limit`.
2. Seeds `seenBookmarks` with the first request's bookmark, if any.
3. Sends the first request.
4. Appends `response.items` when it is an array.
5. Stops when the collected count reaches `limit` (if the helper honours a limit).
6. Reads `response.bookmark`; stops if absent, empty, or already seen.
7. Re-invokes the builder with the new bookmark.
8. Returns `returnAll ? collected : collected.slice(0, limit)` when a limit applies.

The repeated-bookmark guard is essential: a buggy or malicious cursor loop would
otherwise hang the workflow forever.

### Helper inventory and limit behaviour

| Helper                             | Operation                            | Honours `limit`?  |
| ---------------------------------- | ------------------------------------ | ----------------- |
| `collectPinListPages`              | `pin:list`                           | yes               |
| `collectBoardListPages`            | `board:list`                         | no (collects all) |
| `collectBoardPinsListPages`        | `board:listPins`                     | no                |
| `collectBoardSectionsListPages`    | `board:listSections`                 | no                |
| `collectBoardSectionPinsListPages` | `board:listSectionPins`              | no                |
| `collectMediaListPages`            | `media:list`                         | yes               |
| `collectFollowersPages`            | `userAccount:listFollowers`          | yes               |
| `collectFollowingPages`            | `userAccount:listFollowing`          | yes               |
| `collectFollowingBoardsPages`      | `userAccount:listFollowingBoards`    | yes               |
| `collectWebsitesPages`             | `userAccount:getWebsites`            | yes               |
| `collectFollowingInterestsPages`   | `userAccount:listFollowingInterests` | yes               |
| `collectEntityHistoryPages`        | `entityHistory:get`                  | yes               |

The board helpers correspond to descriptions that do not expose `returnAll`/`limit`.
If you add a limit there, you must change both the helper and the description, and
confirm the endpoint actually accepts a page size.

### Raw-array endpoint

`userAccount:listLinkedBusinesses` returns a plain array, not `{ items, bookmark }`.
It is handled inline in `execute()` and must not be routed through a `collect*Pages`
helper. A generic helper would collect zero items because `response.items` is
`undefined`.

### Pagination anti-patterns

- Adding a `while (bookmark)` loop inside a builder.
- Adding `returnAll` to a non-paginated endpoint.
- Forgetting `arrayFormat: 'repeat'` on repeated query arrays.
- Slicing only after collecting everything when `limit` is meant to stop early (wasteful
  but not incorrect); prefer the shared shape.
- Cloning a helper and changing the response field name without changing the loop guard.

## Error model

`mapPinterestApiError(error, { itemIndex, runIndex })` in
`nodes/Pinterest/errors/pinterestApiError.ts` is the single boundary.

Behaviour:

1. **`NodeApiError`** — sanitized and returned.
   - If `httpCode` holds a transport code (`ECONNREFUSED`, `ECONNRESET`, `ENOTFOUND`,
     `ETIMEDOUT`, `EHOSTUNREACH`, `EAI_AGAIN`, `ECONNABORTED`, `ERR_NETWORK`), it is
     cleared and moved to `context.network.code`.
   - Missing `itemIndex`/`runIndex` are filled from the supplied context.
   - Mutation failures are swallowed so error mapping never masks the original failure.
2. **`NodeOperationError`** — returned unchanged. A local validation failure is never
   reclassified as an API failure.
3. **Anything else** — re-thrown unchanged. Unexpected programming errors are not
   disguised as Pinterest API failures.

### Where to call it

Every `catch` around `httpRequestWithAuthentication` or a raw `httpRequest` must route
through the mapper:

```ts
try {
	response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pinterestOAuth2Api',
		options,
	);
} catch (error) {
	throw mapPinterestApiError(error, { itemIndex });
}
```

This includes the pagination helpers and the media upload orchestration.

### Execute-level handling

```ts
catch (error) {
	if (this.continueOnFail()) {
		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray({ error: (error as Error).message }),
			{ itemData: { item: i } },
		);
		returnData.push(...executionData);
		continue;
	}
	if (error instanceof NodeApiError || error instanceof NodeOperationError) {
		throw mapPinterestApiError(error, { itemIndex: i });
	}
	throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
}
```

### Empty-body and status handling

- `userAccount:unverifyWebsite` may return `204 No Content`. `execute()` maps
  `undefined` to `{}` so the item still exists. Do not generalize this to every
  endpoint.
- The media storage upload checks `response.statusCode` is `2xx` explicitly because it
  uses `this.helpers.httpRequest` with `returnFullResponse: true`, not the authenticated
  API helper.
- Media polling treats `status: 'failed'` as a user-visible error and `status:
'succeeded'` as terminal.

### Error anti-patterns

- Catching and re-throwing the raw error, losing the n8n error type.
- Wrapping a `NodeOperationError` in a `NodeApiError` (or vice versa).
- Leaving a transport code in `httpCode`.
- Logging the token, headers, signed upload parameters, or the full request config.
- Reporting `continueOnFail()` as if it were normal error propagation.

## Related references

- Execution flow: [`execution-pipeline.md`](execution-pipeline.md)
- Builder contract: [`request-builders.md`](request-builders.md)
- Endpoint list: [`api-contract.md`](api-contract.md)
