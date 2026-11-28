# Evidence and Reporting

How to label claims and write findings so another engineer can act on them without
re-doing the audit.

## Evidence labels

Use exactly one per claim.

| Label          | Meaning                                                               | Requirement                                                              |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **VERIFIED**   | Read directly in the working tree or the fetched authoritative source | Cite path + symbol (and line where useful), or the source + date/version |
| **INFERRED**   | Deduced from VERIFIED facts                                           | State the deduction explicitly                                           |
| **UNRESOLVED** | Sources conflict or the claim could not be confirmed                  | Report both sides; never pick silently                                   |
| **UNVERIFIED** | Assumed or not checked                                                | Say so; do not soften it to “probably fine”                              |

A memory is not evidence. The code and the official Pinterest contract are.

## Severity rubric

| Severity    | Use when                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **blocker** | The operation cannot work at all for the documented use case, or leaks a secret.                |
| **high**    | A documented, common path produces a wrong request/response; data loss or security exposure.    |
| **medium**  | Edge case, missing validation, misleading UI, or maintainability risk with a realistic failure. |
| **low**     | Cosmetic, naming, docs, or a latent risk unlikely to fire.                                      |
| **info**    | Observation or question; no action required.                                                    |

Severity is about impact, not confidence. A confident cosmetic issue is still low; an
unproven security suspicion can still be high if the impact would be severe.

## Categories

| Category                 | Meaning                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **confirmed defect**     | A source proves the code wrong.                                                                    |
| **potential defect**     | Suspicious but unproven; needs a runtime check or a doc that is missing.                           |
| **unverified behaviour** | Not checked; explicitly out of scope for this audit.                                               |
| **accepted limitation**  | A deliberate, documented choice (for example, board list helpers intentionally collect all pages). |

## Finding template

```text
Severity:      blocker | high | medium | low | info
Category:      confirmed defect | potential defect | unverified behaviour | accepted limitation
Resource/op:   <resource>:<operation>  (or "cross-cutting")
Location:      <exact path> — <symbol>  (line where useful)
Evidence:      <what you read/fetched; the source and its version/date>
Expected:      <the authoritative contract, with the source>
Observed:      <what the code does>
Impact:        <runtime effect on a workflow>
Correction:    <minimal recommended change>  (do NOT apply in a read-only audit)
Verification:  VERIFIED | INFERRED | UNRESOLVED | UNVERIFIED
```

## Worked example

```text
Severity:      medium
Category:      potential defect
Resource/op:   board:list
Location:      nodes/Pinterest/Pinterest.node.ts — collectBoardListPages
Evidence:      Read the helper and BoardDescriptions.ts. The helper collects every page
               and never reads `returnAll`/`limit`; the description exposes no such
               fields. Pinterest API v5 docs for GET /boards checked 2026-11-28.
Expected:      Either a bounded list operation honouring a user limit, or an explicitly
               documented "returns all boards" behaviour.
Observed:      The operation silently returns every board, ignoring the page_size the
               builder may send.
Impact:        A large account can return a very large item set with no user control;
               the workflow may be slow or hit memory limits.
Correction:    Decide the intended contract; if a limit is wanted, add returnAll/limit
               to the description, make the helper stop early, and slice the result.
Verification:  VERIFIED (code) / UNRESOLVED (intended product behaviour)
```

Note how the example separates what is proven (the helper ignores limits) from what is
not (whether that is intended).

## Rules

1. Cite the file and symbol for every code claim; cite the source + date for every API
   claim.
2. State explicitly what you did **not** verify.
3. Never assert “no issues” without naming what you inspected and what you ran.
4. A check you did not run is **not run** with the reason — never “passed”.
5. Distinguish a confirmed defect from a potential defect, unverified behaviour and an
   accepted limitation.
6. Do not propose a rewrite when a minimal correction is enough.
7. Do not apply the correction. A verification-only audit is read-only.
8. Keep one finding per block; do not bundle unrelated issues.
9. Prefer exact line numbers from tool output; do not guess.
10. If you cannot pin the Pinterest version/date, say the claim is UNVERIFIED.

## Anti-patterns

- “Looks correct” without naming the contract source.
- “Tests pass” when only lint/build ran.
- Treating a memory as proof.
- Reporting a speculative bug as confirmed.
- Reporting a style preference as a defect.
- Editing the code while claiming to audit it.
- Omitting the impact (“what breaks in a workflow”).
- Hiding an UNRESOLVED conflict by choosing the more convenient side.

## Related references

- Layers and checklist: [`verification-matrix.md`](verification-matrix.md)
- Defect classes: [`defect-patterns.md`](defect-patterns.md)
- Connector usage: [`mcp-methodology.md`](mcp-methodology.md)
