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

This project brings Pinterest API operations into n8n workflows, making it easier to work with Pinterest without manually building API requests.

## Features

- **Pins and Boards** — work with Pinterest resources through the n8n node.
- **OAuth2 authentication** — connect your Pinterest account using the configured credentials.
- **Native n8n interface** — configure supported resources and operations directly in the workflow editor.
- **Modular TypeScript codebase** — resource descriptions and API request builders are maintained separately.

## Installation

The first version will be available on npm soon. Installation instructions will be added when the package is published.

## Authentication

You'll need a Pinterest developer application with the appropriate API access and permissions.

You can create and manage your application through the [Pinterest Developers platform](https://developers.pinterest.com/). Refer to the [Pinterest API documentation](https://developers.pinterest.com/docs/) for information about authentication, permissions, and available endpoints.

## Development

Clone the repository and install its dependencies:

```bash
git clone https://github.com/sinehypernova-0718/n8n-nodes-pinterest.git
cd n8n-nodes-pinterest
pnpm install
```

Build the package:

```bash
pnpm build
```

Run the linter:

```bash
pnpm lint
```

Check `package.json` for the available scripts and development requirements.

## Contributing

Found a bug or have an idea for an improvement? Contributions, suggestions, and issue reports are welcome.

When reporting an issue, include the affected operation, relevant version information, and any error messages. Remove access tokens, client secrets, and other sensitive information before sharing logs.

## License

This project is licensed under the [MIT License](LICENSE).

---

This is an independent community project and is not an official Pinterest or n8n product.
