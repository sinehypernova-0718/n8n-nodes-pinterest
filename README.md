 <p align="center">
  <img src="https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png" width="200" alt="n8n" />
</p>

<h1 align="center">n8n-nodes-pinterest</h1>

<p align="center">
  A community-built <a href="https://www.pinterest.com/">Pinterest</a> integration for <a href="https://n8n.io/">n8n</a>.
</p>

<p align="center">
  <i>Automate Pinterest workflows, from content management to analytics.</i>
</p>

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

**n8n-nodes-pinterest** brings Pinterest API operations into n8n workflows, letting you work with Pinterest resources through the workflow editor instead of manually constructing API requests.

## ✨ Features

- **Pinterest API integration** — interact with supported Pinterest resources and operations directly from n8n workflows.
- **OAuth2 authentication** — authenticate requests using Pinterest OAuth2 credentials.
- **Native n8n interface** — select resources and operations and configure their parameters through the workflow editor.
- **Pin management** — create, retrieve, list, update, delete, and save Pins using supported Pinterest API operations.
- **Board management** — create, retrieve, list, update, and delete boards, and retrieve Pins associated with a board.
- **Pin analytics** — retrieve analytics for supported metrics and date ranges.
- **Pagination support** — retrieve paginated API results where supported by an operation.
- **Modular TypeScript architecture** — resource descriptions, request builders, and execution logic are organized by responsibility.
- **Extensible design** — add further Pinterest resources and operations while preserving the existing architecture.

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
4. Enter the package's final published npm name.
5. Review and accept the installation confirmation.
6. Once installation completes, open a workflow and search for the Pinterest node.

For detailed instructions, see the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

> **Note:** The package name entered during installation must match the name under which this project is published to npm. Community node installation availability also depends on your n8n deployment configuration and administrator policies.

## ⚙️ Operations

The Pinterest node exposes supported Pinterest API operations through n8n's resource and operation selectors. The available operations and parameters depend on the installed package version.

### Pins

The Pin resource supports operations for managing Pins and retrieving their associated information.

| Operation | Description |
|---|---|
| Create | Create a Pin using the supported Pinterest API parameters. |
| Get | Retrieve an individual Pin by its ID. |
| Get Multiple | Retrieve multiple Pins using the supported API functionality. |
| List | List Pins with supported filters and pagination. |
| Update | Update supported fields of an existing Pin. |
| Delete | Delete a Pin by its ID. |
| Save | Save a Pin to a board. |
| Get Analytics | Retrieve analytics for a Pin using supported metrics and date parameters. |

### Boards

The Board resource supports operations for managing boards and accessing their associated Pins.

| Operation | Description |
|---|---|
| Create | Create a Pinterest board. |
| Get | Retrieve an individual board by its ID. |
| Get Multiple | Retrieve multiple boards using the supported API functionality. |
| List | List boards with pagination. |
| Update | Update supported fields of an existing board. |
| Delete | Delete a board by its ID. |
| List Pins | Retrieve Pins associated with a board. |

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
| Scopes | `boards:read`, `boards:write`, `pins:read`, `pins:write` |

Configure the OAuth redirect URL using the callback URL supplied by n8n. Register that URL with your Pinterest application wherever required by Pinterest's developer configuration.

Save the credential and use n8n's authorization flow to connect your Pinterest account. Once authorization succeeds, select the credential in the Pinterest node.

### Permissions and access

The configured scopes cover the board and Pin read/write permissions used by the current implementation. Individual operations may still require specific permissions, resource access, or additional API eligibility.

Pin analytics availability and supported metrics are subject to Pinterest's API requirements. Application approval status, access restrictions, and Pinterest-side changes can affect whether an operation succeeds.

Keep your client secret and access tokens private. Never commit credentials to the repository or include tokens in issue reports, screenshots, or logs.

## 🧩 Compatibility

This package is designed for n8n's community node ecosystem and uses the n8n node API.

- **Integration type:** n8n community node.
- **Implementation language:** TypeScript.
- **API:** Pinterest API v5.
- **Authentication:** OAuth2.
- **Package distribution:** npm.
- **Development package manager:** pnpm.

The package declares its n8n node metadata and entry points in `package.json`. Compatibility depends on the n8n version, the available `n8n-workflow` APIs, and the package's dependencies.

Refer to the repository's package metadata and release notes when evaluating compatibility with a particular n8n version.

The initial `0.1.0` release is a pre-1.0 release. Operation coverage and compatibility may evolve as the integration develops.

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
