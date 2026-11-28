# MCP and Connector Methodology

How to use the available connectors for research and code navigation without
over-trusting any single source.

Tool availability is **session-dependent**. Discover what is mounted before relying on
a namespace, and fall back to native tools when a namespace is absent. Never report a
connector call you did not make.

## Discovery

In Code Mode, query the global `search()` function:

```js
search({ namespace: 'serena' });
search({ namespace: 'github' });
search({ namespace: 'exa' });
search({ namespace: 'context7' });
search({ namespace: 'gitmcp' });
search({ namespace: 'fff' });
```

An empty result in one session does not prove the server is universally unavailable. It
means this session cannot use it; use the native fallback and say so.

## Pinterest contract research

### Official docs / OpenAPI

Primary source. Fetch the exact endpoint page, not a search snippet. Record:

- the URL and the date checked;
- the method, path, path/query/body parameters;
- required vs optional, enums, defaults, constraints;
- response envelope and status codes;
- OAuth scope/ability;
- beta/sandbox/deprecation notes.

If the spec and observed behaviour disagree, record both and mark **UNRESOLVED**.

### Exa

Use for discovery and “what changed” questions:

- `tools.exa.web_search_exa` — find the endpoint page or changelog.
- `tools.exa.web_fetch_exa` — read a known page as prose.

Exa is good for broad coverage; it is not a substitute for the official reference.

### Firecrawl

Use when you need structured content from `developers.pinterest.com`:

- `tools.firecrawl.firecrawl_scrape` — one page.
- `tools.firecrawl.firecrawl_map` — discover the page tree.
- `tools.firecrawl.firecrawl_search` — search within the docs site.

If Firecrawl is not mounted, use `webfetch` on the exact URL.

### `webfetch`

A plain HTTP fetch is enough for a single known docs page. It does not search.

## Repository navigation

### Serena

Preferred for symbol-level work:

- `get_symbols_overview` — outline a file before reading it.
- `find_symbol` — locate a definition (`include_body: false`, `depth: 0`).
- `find_referencing_symbols` — every call site before judging a shared symbol.
- `get_diagnostics_for_file` — type/lint signals without a full build.
- `search_for_pattern` — strings and config.
- memories — orientation only.

In the `ide` context some filesystem tools are removed; use native reads and shell for
those.

### fff

Indexed checkout search:

- `find_files` — filename/path lookup.
- `grep` — content search with context.

### Native fallbacks

`rg` for content, `fd` for filenames, `git` for history/status/diff. On Windows use
PowerShell syntax (`;` instead of `&&`, quote backslash paths), and avoid recursive
`Get-ChildItem` over `node_modules`.

## Hosted repository context

### GitHub MCP

Use for this repo's issues, PRs, actions, releases and history, and for comparable n8n
community nodes. Read upstream files at a pinned ref when comparing behaviour. Fall
back to shell `git` for local VCS operations.

### gitmcp

Use for public-repo documentation (`llms.txt`, `llms-full.txt`, README) and code search
when a dependency or example lives on GitHub. Do not use it for private local code.

## n8n API questions

### context7

Use for `n8n-workflow` types and editor conventions:

- `IExecuteFunctions` helpers;
- `INodeProperties` field types;
- `resourceLocator` and `loadOptionsDependsOn`;
- `httpRequestWithAuthentication` behaviour;
- error classes (`NodeApiError`, `NodeOperationError`).

If context7 is unavailable, read the installed types under
`node_modules/n8n-workflow` directly.

## Cross-checking

- Use one server for the job; add a second only when it adds information.
- Cross-check a critical claim with at least two independent sources.
- Do not ask another agent “is it correct?” instead of reading the code and the docs.
- Web snippets, AI output and memory are never authoritative.
- Record which connector produced each fact, especially when the answer is
  **UNRESOLVED**.

## Order of authority

```text
Official Pinterest API v5 reference (pinned by date)
  > Pinterest guides / changelog / deprecation notes
  > Working tree (descriptions, builders, dispatch, transport, errors)
  > .serena memories
  > Search snippets / third-party examples / assumptions
```

A lower source never overrides a higher one. A disagreement is a finding.

## Practical recipes

### “Is this endpoint path correct?”

1. Fetch the official endpoint page (Exa/Firecrawl/`webfetch`).
2. Read the builder (`find_symbol` or direct read).
3. Compare method, path, params, body, response.
4. If they differ, record expected vs observed.

### “Does this field reach the request?”

1. Find the description field by `name`.
2. Find the builder's `getNodeParameter` call with the same string.
3. Find the assignment into `qs`/`body`.
4. Confirm the `displayOptions.show.operation` includes the operation that reads it.

### “Is this pagination correct?”

1. Confirm the endpoint returns `{ items, bookmark }` from the docs.
2. Read the helper's loop guard and limit handling.
3. Read the builder's `page_size` and `bookmark` handling.
4. Read the description's `returnAll`/`limit` fields.

### “Is this error handling safe?”

1. Find every `catch` around the request.
2. Confirm `mapPinterestApiError(error, { itemIndex })`.
3. Confirm no token/signed parameter is logged.
4. Confirm `continueOnFail()` semantics.

## What not to do

- Do not assume Serena, Firecrawl or Playwright is mounted.
- Do not use a web snippet as the sole proof of an API contract.
- Do not run `git`/`gh` mutations during a read-only audit.
- Do not silently prefer the code when the docs disagree; report **UNRESOLVED**.
- Do not claim a build/lint/test ran if the command was not executed.

## Related references

- Evidence labels: [`evidence-and-reporting.md`](evidence-and-reporting.md)
- Layers and checklist: [`verification-matrix.md`](verification-matrix.md)
