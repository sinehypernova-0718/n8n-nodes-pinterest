 <p align="center">
  <img src="n8n-logo-black-accent.svg" width="200" alt="n8n" />
</p>

<h1 align="center">n8n-nodes-pinterest</h1>

<p align="center">
  A community-built <a href="https://www.pinterest.com/">Pinterest</a> integration for <a href="https://n8n.io/">n8n</a>.
</p>

<p align="center">
  <i>Automate Pinterest workflows, from content management to analytics.</i>
</p>

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

**@sinehypernova-0718/n8n-nodes-pinterest** brings Pinterest API operations into n8n workflows, letting you work with Pinterest resources through the workflow editor instead of manually constructing API requests.

## ✨ Features

- **Pinterest API v5 integration** — interact with supported Pinterest resources directly from n8n workflows.
- **OAuth2 authentication** — authorize API requests using Pinterest OAuth2 credentials.
- **Native n8n interface** — select resources, operations, and parameters through the workflow editor.
- **Pin management** — create, retrieve, list, update, delete, and save Pins.
- **Board management** — create, retrieve, list, update, and delete boards and board sections, and retrieve Pins associated with boards.
- **Pin analytics** — retrieve supported analytics metrics over specified date ranges.
- **Pagination support** — retrieve paginated results where supported by the relevant operation.


## 📁 Repository Structure

```text
n8n-nodes-pinterest/
├── credentials/
│   └── PinterestOAuth2Api.credentials.ts
├── nodes/
│   └── Pinterest/
│       ├── descriptions/
│       │   ├── BoardDescriptions.ts
│       │   ├── PinDescriptions.ts
│       │   └── index.ts
│       ├── requests/
│       │   ├── board/
│       │   │   ├── <operation>.ts
│       │   │   └── index.ts
│       │   ├── pin/
│       │   │   ├── <operation>.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       └── Pinterest.node.ts
├── package.json
├── README.md
└── LICENSE.md
```

### Architecture

- **`credentials/`** — defines the Pinterest OAuth2 credentials used to authenticate requests.
- **`descriptions/`** — contains resource and operation definitions displayed in the n8n editor. Its `index.ts` explicitly exports the descriptions consumed by the main node.
- **`requests/board/`** — contains request builders for Pinterest Board operations.
- **`requests/pin/`** — contains request builders for Pinterest Pin operations.
- **`requests/<resource>/<operation>.ts`** — keeps individual API request builders in separate operation-specific modules, such as `create.ts`, `get.ts`, `list.ts`, and `update.ts`.
- **Resource `index.ts` files** — explicitly export the request builders belonging to each resource.
- **`requests/index.ts`** — re-exports the resource-level barrels, providing a single import entry point for request modules.
- **`Pinterest.node.ts`** — defines the n8n node and coordinates operation execution, authenticated HTTP requests, pagination, and error handling.

The architecture separates editor-facing configuration from API request construction and execution. Resource descriptions define the available operations and parameters, while request modules build operation-specific requests. The main node remains responsible for invoking authenticated HTTP requests through n8n's credential-aware helpers and handling execution results.

Explicit exports keep imports predictable and avoid unnecessary wildcard exports. The resource-specific modules remain independent, while the barrel files provide convenient entry points without introducing another execution layer.

Additional resources can follow the same structure, with their own descriptions and operation-specific request modules. This allows the integration to expand without requiring a redesign of the existing architecture.

## 📦 Installation

Install the package through your n8n instance using the community node installation interface.

1. Open your n8n instance.
2. Navigate to **Settings → Community Nodes**.
3. Select **Install**.
4. Enter the package name `@sinehypernova-0718/n8n-nodes-pinterest`.
5. Review and accept the installation confirmation.
6. Once installation completes, open a workflow and search for the Pinterest node.

For detailed instructions, see the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

> **Note:** The package name entered during installation must match the name under which this project is published to npm (`@sinehypernova-0718/n8n-nodes-pinterest`). Community node installation availability also depends on your n8n deployment configuration and administrator policies.

## ⚙️ Operations

The Pinterest node exposes supported Pinterest API operations through n8n's resource and operation selectors. The available operations and parameters depend on the installed package version.

### Pins

The Pin resource supports operations for managing Pins and retrieving their associated information.

| Operation | Description |
|---|---|
| Create | Create a Pin using the supported Pinterest API parameters. |
| Get | Retrieve an individual Pin by its ID. |
| Get Multiple Pin Analytics | Retrieve analytics for multiple Pins in a batch request, using the supported analytics metrics and date range. |
| List | List Pins with supported filters and pagination. |
| Update | Update supported fields of an existing Pin. |
| Delete | Delete a Pin by its ID. |
| Save | Save a Pin to a board. |
| Get Analytics | Retrieve analytics for a Pin using supported metrics and date parameters. |

### Board

| Operation | Description |
|---|---|
| Create | Create a new board. |
| Create Board Section | Create a new board section. |
| Delete | Delete a single board. |
| Delete Board Section | Delete a single board section. |
| Get | Get a single board. |
| List | List boards. |
| List Board Sections | List sections of a board. |
| List Pins | List Pins on a board. |
| List Pins on Board Section | List Pins on a board section. |
| Update | Update a single board. |
| Update Board Section | Update a single board section. |

The **List** operation for Pins supports **Return All** and **Limit**. The board listing operations (List, List Pins, List Board Sections, and List Pins on Board Section) follow Pinterest's pagination bookmarks and return all pages. Pin, board, and board section IDs are numeric identifiers; operations that look up a resource by ID expect digits only.

Operation parameters, filters, pagination behavior, and available analytics metrics vary by endpoint. Refer to the operation descriptions in the n8n editor and the [Pinterest API v5 documentation](https://developers.pinterest.com/docs/api/v5/) for endpoint-specific requirements.

This list describes the resources currently implemented in the integration. Additional resources and operations can be introduced in future releases.

## 🔐 Credentials

The Pinterest node uses OAuth2 authentication to make authorized requests to the Pinterest API v5.

### Prerequisites

Before configuring the credentials, you need:

- A Pinterest account.
- A developer application registered through the [Pinterest Developers Portal](https://developers.pinterest.com/).
- The client ID and client secret issued for your application.
- Appropriate API access and permissions for the operations you intend to use.

Pinterest controls application access and approval. Registering a developer application does not automatically grant unrestricted access to every API endpoint.

### Configure OAuth2 credentials

Create a Pinterest OAuth2 API credential in n8n and supply the values required by the credential configuration.

| Setting | Value |
|---|---|
| Grant type | Authorization Code |
| Authorization URL | `https://www.pinterest.com/oauth/` |
| Access token URL | `https://api.pinterest.com/v5/oauth/token` |
| Client ID | The client ID issued for your Pinterest application |
| Client secret | The client secret issued for your Pinterest application |
| Scopes | `user_accounts:read`, `boards:read`, `boards:write`, `pins:read`, `pins:write` |

Configure the OAuth redirect URL using the callback URL supplied by n8n. Register that URL with your Pinterest application wherever required by Pinterest's developer configuration.

Save the credential and use n8n's authorization flow to connect your Pinterest account. Once authorization succeeds, select the credential in the Pinterest node.

### Permissions and access

The configured scopes cover the board and Pin read/write permissions used by the current implementation. The `user_accounts:read` scope supports the credential check against the `GET /v5/user_account` endpoint. Individual operations may still require specific permissions, resource access, or additional API eligibility.

Pin analytics availability and supported metrics are subject to Pinterest's API requirements. Application approval status, access restrictions, and Pinterest-side changes can affect whether an operation succeeds.

Keep your client secret and access tokens private. Never commit credentials to the repository or include tokens in issue reports, screenshots, or logs.

## 🧩 Compatibility

This package is designed for n8n's community node ecosystem and uses the n8n node API.

- **Integration type:** n8n community node.
- **Implementation language:** TypeScript.
- **API:** Pinterest API v5.
- **Authentication:** OAuth2.
- **Package distribution:** npm — published by GitHub Actions with npm provenance.
- **Development package manager:** pnpm — pinned through the `packageManager` field in `package.json` and `pnpm-lock.yaml`.

The package declares its n8n node metadata and entry points in `package.json`. Compatibility depends on the n8n version, the available `n8n-workflow` APIs, and the package's dependencies.

Refer to the repository's package metadata and release notes when evaluating compatibility with a particular n8n version.

The `0.1.x` releases are pre-1.0 releases. Operation coverage and compatibility may evolve as the integration develops.

## 🛠️ Development

### Requirements

- **[Node.js](https://nodejs.org/)** (v22 or higher) and **pnpm**
- **[git](https://git-scm.com/downloads)**
- **[Corepack](https://nodejs.org/api/corepack.html)** (optional) — pnpm 12.4.2 is pinned in `package.json` via the `packageManager` field

```bash
corepack enable
pnpm install
```

### Available scripts

| Script | Description |
| --- | --- |
| `pnpm run dev` | Start n8n with the Pinterest node and watch for changes. |
| `pnpm run build` | Compile TypeScript to JavaScript for production. |
| `pnpm run build:watch` | Build in watch mode. |
| `pnpm run lint` | Check code for errors and style issues. |
| `pnpm run lint:fix` | Automatically fix lint issues where possible. |
| `pnpm run release:local` | Create a local release: bump the version, update the changelog, commit, tag (`vX.Y.Z`), and push. |
| `pnpm run release` | The GitHub Actions publish entry point; builds and publishes to npm with provenance. |

> **Note:** Use `pnpm run release:local` to create and push a release tag. The repository's `.release-it.json` configures the `master` branch, the `vX.Y.Z` tag format, and changelog generation.

### Release process

Releases are published by GitHub Actions, never from a local machine, so every published version carries an npm provenance attestation (required by n8n for verified community nodes).

1. Make sure `master` is up to date and the working tree is clean.
2. Run `pnpm run release:local`. It lints, builds, prompts for a version bump, updates `CHANGELOG.md`, commits, creates a `vX.Y.Z` tag, and pushes it.
3. The tag push triggers `.github/workflows/publish.yml`, which checks out the tag, verifies it matches `package.json`, checks whether the version is already on npm, and publishes it with provenance.

> **Note:** release-it also creates a GitHub release and needs a `GITHUB_TOKEN` with `repo` scope (for example, `export GITHUB_TOKEN=$(gh auth token)`). Without it, release-it opens the GitHub release page in a browser.

### Required repository configuration

- A repository secret named `NPM_TOKEN` holding an npm granular access token with **read and write** publish permission for `@sinehypernova-0718/n8n-nodes-pinterest`.
- The default branch must be `master`; CI and the publish workflow are configured for it.
- `@n8n/node-cli` version 0.23.0 or later is required for npm provenance support.

## 🚀 Usage

After installing the node and configuring OAuth2 credentials, you can incorporate Pinterest API operations into your n8n workflows.

### Basic workflow setup

1. Create a workflow in n8n.
2. Add the Pinterest node.
3. Select your Pinterest OAuth2 credential.
4. Choose the resource you want to work with, such as **Pin** or **Board**.
5. Select the required operation.
6. Configure its parameters, IDs, filters, and other required fields.
7. Connect the node to the other nodes in your workflow.
8. Execute the workflow and inspect the returned data.

### Troubleshooting

If an operation fails:

- Verify that the Pinterest credential is authorized.
- Confirm that your application has the required API access and scopes.
- Check that the supplied resource IDs exist and are accessible to the connected account.
- Verify required fields and supported parameter values.
- Review the error returned by n8n and consult the relevant Pinterest API documentation.

For general workflow guidance, see the [n8n Try it out documentation](https://docs.n8n.io/try-it-out/).

## 🔗 Resources

- [Pinterest Developers Portal](https://developers.pinterest.com/) — manage developer applications and API access.
- [Pinterest API v5 documentation](https://developers.pinterest.com/docs/api/v5/) — API endpoints, request parameters, responses, and permissions.
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes) — community node discovery and installation.
- [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) — installation instructions.
- [n8n documentation](https://docs.n8n.io/) — workflow creation and node configuration.
- [GitHub repository](https://github.com/sinehypernova-0718/n8n-nodes-pinterest) — source code, issues, and contributions.

## 📝 Version history

### `0.1.1`

Adds board section management to the Pinterest integration for n8n.

- Adds Create Board Section, Delete Board Section, Update Board Section, and List Board Sections operations.
- Adds List Pins on Board Section to retrieve Pins associated with a board section.
- Includes pagination for the new board section listing operations where implemented.

This release extends the Board resource with board section management while preserving the existing integration structure.

### `0.1.0`

Initial pre-1.0 release of the Pinterest integration for n8n.

- Introduces Pin and Board resources.
- Adds OAuth2 authentication for Pinterest API requests.
- Includes Pin creation, retrieval, listing, updating, deletion, saving, and analytics operations.
- Includes Board creation, retrieval, listing, updating, deletion, and listing Pins associated with a board.
- Includes pagination and operation-specific request handling where implemented.

This release establishes the initial integration structure, with further Pinterest resources and operations available for future development.


## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

---

_This is an independent community project and is not an official Pinterest or n8n product._
