# Task completion

For any code change:
1. `pnpm run lint` — clean pass required (run `pnpm run lint:fix` first if formatting drifted).
2. `pnpm run build` — `n8n-node build` must succeed; it type-checks under `strict` and regenerates `dist/`.
3. Confirm the published surface still resolves: `dist/nodes/Pinterest/Pinterest.node.js` and `dist/credentials/PinterestOAuth2Api.credentials.js` must exist after build (declared under `n8n.nodes` / `n8n.credentials` in `package.json`).

Caveats:
- No unit/integration tests and no `test` script exist — never claim "tests pass". CI runs lint + build only.
- CI installs with `--frozen-lockfile`: don't hand-edit `pnpm-lock.yaml`, and add deps only via `pnpm add`.
- `dist/` is gitignored — never commit build output.
- New operation work is only complete once descriptions, request module, barrel exports, and the `execute` dispatch case all agree (`mem:conventions`).