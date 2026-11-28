# .agents

Agent-facing assets for the `n8n-nodes-pinterest` repository.

Skills follow the Anthropic Agent Skills layout: each skill is a directory with a
`SKILL.md` (YAML frontmatter + instructions) and optional `references/`, `scripts/`,
`assets/` and `evals/` directories. Only the frontmatter (`name` + `description`) is
loaded up front; files under `references/` are read on demand so the main instruction
file stays small.

## Skills

| Skill                                                                                    | Trigger it when...                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`pinterest-resource-implementation`](skills/pinterest-resource-implementation/SKILL.md) | You are adding or changing a Pinterest resource or operation: new request builder, editor fields, barrel export, dispatch case, bookmark pagination, or error handling. |
| [`pinterest-resource-verification`](skills/pinterest-resource-verification/SKILL.md)     | You are auditing an existing resource or operation against the working tree and the Pinterest API v5 contract, or writing a defect report.                              |

## Conventions

- `SKILL.md` stays under roughly 500 lines; depth lives in `references/`.
- Every claim in these skills is grounded in a file that exists in this repo. When the
  code changes, update the skill and its references in the same change.
- The skills name MCP connectors, but tool availability is session-dependent. Discover
  what the session exposes (`search({ namespace: "..." })` in Code Mode) and fall back
  to native `rg` / `fd` / `git` rather than assuming a server is mounted.
- The verification skill is read-only by design. It must never edit code, docs,
  memories or configuration while auditing.
