 <p align="center">
  <img src="https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png" width="200" alt="n8n" />
</p>

<h1 align="center">n8n-nodes-pinterest</h1>

<p align="center">
  A community-built <a href="https://www.pinterest.com/">Pinterest</a> integration for <a href="https://n8n.io/">n8n</a>.
</p>

<p align="center">
  <i>First release coming soon.</i>
</p>

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

**n8n-nodes-pinterest** brings Pinterest API operations into n8n workflows, letting you work with Pins and Boards through the workflow editor instead of manually constructing API requests.

## Features

- **Pins and Boards** — perform supported operations on Pinterest resources directly from n8n workflows.
- **OAuth2 authentication** — configure Pinterest API access through the node's credentials.
- **Native n8n interface** — select resources and operations and configure their parameters in the workflow editor.
- **Modular TypeScript architecture** — keep node descriptions, request builders, and execution logic separated by responsibility.

## Repository Structure

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
└── LICENSE
```

### Architecture

- **`credentials/`** — defines the Pinterest OAuth2 credentials used to authenticate requests.
- **`descriptions/`** — contains the resource and operation definitions displayed in the n8n editor. Its `index.ts` explicitly exports the descriptions used by the main node.
- **`requests/board/`** — contains request builders for Pinterest Board operations.
- **`requests/pin/`** — contains request builders for Pinterest Pin operations.
- **`requests/<resource>/<operation>.ts`** — each operation has its own TypeScript file. For example, `create.ts`, `get.ts`, `list.ts`, and `update.ts`. The filename describes the operation, while the module builds the corresponding API request.
- **Resource `index.ts` files** — explicitly export the request builders belonging to each resource.
- **`requests/index.ts`** — re-exports the resource-level barrels, giving the main node a single import entry point.
- **`Pinterest.node.ts`** — defines the n8n node and coordinates operation execution, authenticated HTTP requests, pagination, and error handling.

The barrel files keep imports concise without merging resource-specific modules or introducing another execution layer.

## Installation

The first release is coming soon. Installation instructions will be added once the package is published on npm.

## Authentication

You'll need a Pinterest developer application with the appropriate API access and permissions.

- [Pinterest Developers](https://developers.pinterest.com/) — create and manage your developer application.
- [Pinterest API Documentation](https://developers.pinterest.com/docs/) — consult the API documentation for authentication, permissions, and supported endpoints.

Configure your Pinterest OAuth2 credentials in n8n before using the node. Access to particular operations depends on the permissions granted to your Pinterest application.

## Development

### Prerequisites

- Node.js
- pnpm

Use the Node.js version and package-manager requirements specified by the repository configuration.

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/sinehypernova-0718/n8n-nodes-pinterest.git
cd n8n-nodes-pinterest
pnpm install
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

For additional scripts and development requirements, refer to `package.json`.

## Contributing

Bug reports, suggestions, and contributions are welcome.

When reporting an issue, include the affected resource and operation, relevant version information, and any error messages. **Never include access tokens, client secrets, or other sensitive credentials** in issues or logs.

## License

This project is licensed under the [MIT License](LICENSE).

---

This is an independent community project and is not an official Pinterest or n8n product.
