# Commands

Run from the repo root. pnpm only — npm/yarn would fight the pinned `packageManager` and the lockfile.

- `pnpm install --frozen-lockfile` — CI-equivalent install
- `pnpm run build` — `n8n-node build`, regenerates `dist/`
- `pnpm run build:watch` — raw `tsc --watch` (types only, no node-cli packaging)
- `pnpm run lint` / `pnpm run lint:fix` — `n8n-node lint` (ESLint + n8n node checks)
- `pnpm run dev` — `n8n-node dev` local node harness
- `pnpm run release` — `n8n-node release`; `pnpm run release:local` — `release-it`
- `n8n-node prerelease` — publish guard, wired to `prepublishOnly`

Windows specifics (default shell is PowerShell, not bash):
- `ls -la`, `cat`, `grep`, `head` are absent/aliased; use `Get-ChildItem`, `Get-Content -TotalCount`, `Select-String`, or prefer `rg` / `fd`.
- Chain with `;` instead of `&&`; quote paths (they contain backslashes).
- Recursive PowerShell walks over `node_modules` are very slow — always filter or use `rg`/`fd`.