# Execution Pipeline Reference

How a Pinterest node execution travels from the editor to an HTTP response and back.
Read this before changing `Pinterest.node.ts` or adding a paginated operation.

## End-to-end flow

```text
1. Editor
   resource + operation are selected. Only fields whose displayOptions.show
   matches the current pair are rendered.

2. execute()
   items = getInputData()
   for each item i:
     resource  = getNodeParameter('resource', i)
     operation = getNodeParameter('operation', i)

3. Dispatch
   switch (resource) {
     case 'pin':          switch (operation) { ... }
     case 'board':        switch (operation) { ... }
     case 'media':        switch (operation) { ... }
     case 'userAccount':  switch (operation) { ... }
     case 'entityHistory':switch (operation) { ... }
     default: throw NodeOperationError('Unsupported resource: ...')
   }

4. Builder
   A standard builder returns IHttpRequestOptions:
     { method, url, qs?, body?, arrayFormat? }
   url is relative to the API base.
   uploadMediaVideo returns IDataObject directly instead.

5. Transport
   options = { baseURL: PINTEREST_API_BASE_URL, json: true, ...requestOptions }
   response = await this.helpers.httpRequestWithAuthentication.call(
     this, 'pinterestOAuth2Api', options
   )

6. Error boundary
   catch (error) → throw mapPinterestApiError(error, { itemIndex: i })

7. Pagination / special handling
   Some operations replace the single response with a collected list.
   Some operations normalize the response before output.

8. Output
   returnData.push(
     ...constructExecutionMetaData(
       returnJsonArray(responseData ?? {}),
       { itemData: { item: i } },
     )
   )
```

## Transport contract

`execute()` owns the two transport defaults:

- `baseURL: PINTEREST_API_BASE_URL` (`https://api.pinterest.com/v5`)
- `json: true`

Because the spread is `...requestOptions` **after** the defaults, a builder that returns
`baseURL` or `json` silently overrides them. Builders must not set either. A builder that
needs a different URL shape (for example the external media storage URL) must be an
orchestration function that calls `this.helpers.httpRequest` itself, as
`uploadMediaVideo` does.

The authenticated helper applies the OAuth2 token from `pinterestOAuth2Api`. Builders
never read credentials and never add an `Authorization` header.

## Dispatch rules

- Every operation value in a description must have a `case` in the matching resource
  switch.
- Every `case` must map to a builder that is exported from `requests/index.ts`.
- `default:` must throw:

```ts
throw new NodeOperationError(
	this.getNode(),
	`The <Resource> operation "${operation}" is not implemented yet`,
	{ itemIndex: i },
);
```

- `requestOptions` is for builders that return `IHttpRequestOptions`.
- `responseData` is for builders that already produced a response.
- Do not let a branch fall through with both values `undefined`; the node throws
  `The <resource> operation "<op>" did not produce a request` in that case.

## Response handling chain

After dispatch, if `responseData` is still `undefined` and `requestOptions` exists:

```text
if (resource === 'pin' && operation === 'list')                 → collectPinListPages
else if (resource === 'board' && operation === 'list')          → collectBoardListPages
else if (resource === 'board' && operation === 'listPins')      → collectBoardPinsListPages
else if (resource === 'board' && operation === 'listSections')  → collectBoardSectionsListPages
else if (resource === 'board' && operation === 'listSectionPins')→ collectBoardSectionPinsListPages
else if (resource === 'media' && operation === 'list')          → collectMediaListPages
else if (resource === 'userAccount' && operation === 'listFollowers') → collectFollowersPages
else if (resource === 'userAccount' && operation === 'listFollowing') → collectFollowingPages
else if (resource === 'userAccount' && operation === 'listFollowingBoards') → collectFollowingBoardsPages
else if (resource === 'userAccount' && operation === 'getWebsites') → collectWebsitesPages
else if (resource === 'userAccount' && operation === 'listFollowingInterests') → collectFollowingInterestsPages
else if (resource === 'entityHistory' && operation === 'get')   → collectEntityHistoryPages
else if (resource === 'userAccount' && operation === 'listLinkedBusinesses')
        → raw-array request inline (no helper)
else
  → single authenticated request
```

Then, for the single-request path:

- `media:get` → `normalizeMediaUpload(...)`
- `pin:removeProductTags` → `normalizeProductTagRemovalResponse(...)`
- `userAccount:unverifyWebsite` → `responseData ?? {}` (204/empty-body success)

## Pagination helper contract

All helpers share the same shape:

```ts
async function collectThingPages(
	this: IExecuteFunctions,
	firstPageRequest: IHttpRequestOptions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const limit = returnAll
		? Number.POSITIVE_INFINITY
		: (this.getNodeParameter('limit', itemIndex, 50) as number);

	const collected: IDataObject[] = [];
	const seenBookmarks = new Set<string>();

	let requestOptions: IHttpRequestOptions = {
		baseURL: PINTEREST_API_BASE_URL,
		json: true,
		...firstPageRequest,
	};

	const initialBookmark = firstPageRequest.qs?.bookmark;
	if (typeof initialBookmark === 'string' && initialBookmark !== '') {
		seenBookmarks.add(initialBookmark);
	}

	while (true) {
		let response: IDataObject;
		try {
			response = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				'pinterestOAuth2Api',
				requestOptions,
			)) as IDataObject;
		} catch (error) {
			throw mapPinterestApiError(error, { itemIndex });
		}

		if (Array.isArray(response?.items)) {
			collected.push(...(response.items as IDataObject[]));
		}

		if (collected.length >= limit) break;

		const nextBookmark = response?.bookmark;
		if (
			typeof nextBookmark !== 'string' ||
			nextBookmark === '' ||
			seenBookmarks.has(nextBookmark)
		) {
			break;
		}
		seenBookmarks.add(nextBookmark);

		const nextPageRequest = await thingPageBuilder.call(this, itemIndex, nextBookmark);
		requestOptions = {
			baseURL: PINTEREST_API_BASE_URL,
			json: true,
			...nextPageRequest,
		};
	}

	return returnAll ? collected : collected.slice(0, limit);
}
```

Behavioural differences that exist in the working tree and must be understood before
copying a helper:

- `collectPinListPages`, `collectMediaListPages`, `collectFollowersPages`,
  `collectFollowingPages`, `collectFollowingBoardsPages`, `collectWebsitesPages`,
  `collectFollowingInterestsPages` and `collectEntityHistoryPages` honour `returnAll`
  and `limit` and slice the result.
- `collectBoardListPages`, `collectBoardPinsListPages`,
  `collectBoardSectionsListPages` and `collectBoardSectionPinsListPages` collect all
  pages and return the full list; they do not read or slice `limit`. Their descriptions
  therefore do not expose `returnAll`/`limit`. Do not “fix” this by adding a limit
  field without also changing the helper and the API expectations.

## Output and failure semantics

- One input item produces one output item, unless a paginated operation produces a
  list (the list elements become the output rows for that item).
- `responseData ?? {}` means a `204`/empty body becomes an empty object rather than a
  missing item.
- `continueOnFail()` catches any error and emits `{ error: message }`, then continues.
- Without `continueOnFail()`, a `NodeApiError`/`NodeOperationError` is re-thrown through
  `mapPinterestApiError`; any other value is wrapped in `NodeOperationError`.

## Related references

- Builder rules: [`request-builders.md`](request-builders.md)
- Pagination and errors in depth: [`pagination-and-errors.md`](pagination-and-errors.md)
