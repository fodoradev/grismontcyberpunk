# Grismont website — content pack (Phase 1: content and legal)

Put this folder in the project as `/content-plan/`. Claude Code reads these files in Phase 2.

## Work order
1. **Phase 1 — Content and legal (this pack).** Attila fills the placeholders and approves the decisions.
2. **Phase 2 — Add the content in Claude Code.** Implement the copy, forms and pages from files 02–06.
3. **Phase 3 — Technical setup.** Indexing, sitemap, analytics, schema, speed, booking and form backend.
   (A separate file, `08-technical-setup.md`, comes after Phase 1.)

## Files
| File | Content | Owner action |
| --- | --- | --- |
| `01-positioning-offer-pricing.md` | Focus, ideal client, offer ladder, prices | Approve decisions |
| `02-copy-home-en.md` | Full English home page copy | Fill placeholders |
| `03-copy-home-hu.md` | Full Hungarian home page copy (tegező) | Fill placeholders |
| `04-copy-scorecard-en-hu.md` | Scorecard, audit, sample report, emails | Fill booking link |
| `05-proof-plan.md` | Proof assets, interview questions, case study template | Answer the interview |
| `06-legal-impressum-en-hu.md` | Impressum HU + EN | Fill after registration |
| `07-legal-checklist.md` | Registration, tax, GDPR, adult training, contracts | Do with accountant |
| `IMPLEMENTATION.md` | Phase 2 status: what is built, decisions taken, and every value still to fill (file + key) | Fill the listed values |

## Placeholder rules (for Attila and for Claude Code)
- `{{FILL: ...}}` — a fact Attila must supply.
- `{{DECIDE: ...}}` — a choice Attila must make.
- `{{CHECK: ...}}` — verify before publishing.
- `[PROOF]` — a block or link that stays hidden until it has real content.

## Instructions for Claude Code (Phase 2)
- Do not publish any text that still contains `{{FILL}}`, `{{DECIDE}}` or `{{CHECK}}`.
  Before deploy, search the source for `{{` and stop if you find one.
- Render `[PROOF]` blocks behind a feature flag (e.g. `SHOW_PROOF=false`). Turn on per block when filled.
- Keep the existing visual design, animation and section numbering. Change copy, structure and forms only.
- EN and HU pages must have the same sections and IDs. The language toggle keeps the current path and anchor.
- Do not show "Coming soon" links anywhere.
- Use the exact names in `03-copy-home-hu.md` ("Folyamat-pontozó", "Részletes folyamat-audit").
- Section numbers (01, 02 …) are counted at render time, so a hidden `[PROOF]` section does not leave a gap.
- Prices: render from one config file so Attila can change them in one place.
