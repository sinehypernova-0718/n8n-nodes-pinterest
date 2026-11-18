# Tech stack

- TypeScript 5.9.3. `tsconfig.json`: target/lib es2019 (+ es2022.error), module commonjs, `strict`, `noImplicitAny`, `noUnusedLocals`, `noImplicitReturns`, `useUnknownInCatchVariables: false` (so `catch (error)` is untyped by design), declarations + sourcemaps, `outDir: dist/`, `incremental`.
- n8n node API v1 (`n8n.n8nNodesApiVersion: 1`, `strict: true`). `n8n-workflow` is a peer dep supplied by the host — never bundle or list it as a runtime dep.
- Build/lint/release run through `@n8n/node-cli`. ESLint is a flat config that re-exports `@n8n/node-cli/eslint` only (`eslint.config.mjs`) — add rules there, not in a second config.
- pnpm 12.4.2 pinned via `packageManager` (corepack enforces it). `pnpm-lock.yaml` + `pnpm-workspace.yaml` committed; CI installs with `--frozen-lockfile`.
- Prettier 3.8.3 via `.prettierrc.js`: tabs (tabWidth 2), single quotes, `trailingComma: 'all'`, `printWidth: 100`, `endOfLine: 'lf'`, semicolons. `.prettierignore`: `dist`, `node_modules`, `pnpm-lock.yaml`.
- release-it 20.2.0 for the local release path; `n8n-node release` for the standard one.
- CI: `.github/workflows/ci.yml` on PRs and pushes to `master` — `pnpm install --frozen-lockfile` → lint → build (Node `lts/*`, pnpm store cached). Also `publish.yml`, `ci-cla-check.yml`, `dependabot.yml`.
- No test framework, no `engines` field, no `.nvmrc`.