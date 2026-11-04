# Phase 2 — Implementation status

Living tracker for implementing files `01`–`07` in the codebase. Update it in the same commit as the code.
Status: ✅ done · 🟡 done, waiting on a value from Attila · ⏳ in progress · ⬜ not started · ⏭️ out of scope for Phase 2

## How unresolved values work in the code

- Every fact Attila still has to supply lives in **one place**: `data/site.ts` (site facts, booking link, proof,
  flags), `data/offers.ts` (prices, guarantee, VAT) or `data/business.ts` (Impressum/legal identity).
- An unresolved value is written exactly as in the content pack, e.g. `"{{FILL: booking link}}"`.
  The helper `known()` in `data/site.ts` treats any `{{…}}` string as missing, so the block that needs it is
  **hidden** (or, on legal pages, shown as a visible "to be provided" marker) instead of printing the placeholder.
- `[PROOF]` blocks are driven by data: a proof block renders only when its data exists (e.g. the `#proof`
  section needs at least 2 case studies). There is no separate env flag; an empty list is the "off" switch.
- Section numbers (01, 02 …) are counted at render time, so a hidden section leaves no gap.
- `npm run check:launch` searches the source for `{{FILL`, `{{DECIDE` and `{{CHECK` and fails while any remain.
  Run it before going live (it is deliberately not part of `npm run build`, so previews keep working).

## Decisions taken while implementing (change any of them in the files named)

| # | Decision | Where |
| --- | --- | --- |
| D1 | Prices from `01` §3 table are used as-is (regular + launch). | `data/offers.ts` |
| D2 | Guarantee threshold, VAT wording and "places left" stay `{{DECIDE}}`/`{{FILL}}`, so those lines are hidden for now. | `data/offers.ts` |
| D3 | Without a booking link, "Book a 20-minute call" buttons go to `#contact` (existing project convention). | `data/site.ts` |
| D4 | Hero H1 keeps the hand-drawn underline on one word ("admin" / "adminisztrációval"). | `content/site/home.ts` |
| D5 | The 3 problem cards reuse the interactive process explorer (same design, new copy). | `components/ProcessExplorer.tsx` |
| D6 | Coming-soon pages (`/courses`, `/downloads`, `/work/*`) are removed; footer shows `[PROOF]` links only when content exists. | — |
| D7 | Contact form: stored in `contact_messages`, forwarded to `OWNER_NOTIFY_EMAIL` (fallback `hello@grismont.hu`), retried daily, deleted after 12 months (07 B suggested "e.g. 1 year"). Max 5 messages/hour per IP. | `lib/contact/` |
| D8 | Service-card buttons go to `#contact` and preselect the interest (Training/Workshop/Programme/Sprint). | `components/ContactForm.tsx` |
| D9 | Unknown facts fall back to existing true copy: proof strip shows "Lean Six Sigma / Green Belt", "Operations and advisory experience", "Hungarian and English"; About says "Hi, I'm Attila." with the generic career sentence. | `content/site/home.ts` |
| D10 | Kept from the current design (not in the copy docs): the "question I keep coming back to" note in #about and the six-area list in #scorecard. | `app/page.tsx` |
| D11 | Scorecard step 1 keeps the invisible anti-spam honeypot (labelled "Website" for bots only). The visible "Website" field the doc mentions does not exist. | `components/scorecard/IntakeForm.tsx` |
| D12 | Step 3 is the final card of the question flow. "Show my report" saves the profile with the report; "Skip" submits without it. The report engine treats size/type of work as optional. | `components/scorecard/CardFlow.tsx`, `lib/scorecard/store.ts` |
| D13 | Progress shows "Question 7 of 33": the flow has 33 cards (process name + 30 scored + 1 diagnostic + 1 free text). Marketing copy keeps "30 questions". | `components/scorecard/CardFlow.tsx` |
| D14 | Existing scorecard sign-ups keep their reminders (they consented jointly before); new sign-ups get reminders only with the separate box. | `db/migrations/0007_scorecard_consents.sql` |
| D15 | Follow-ups: day 2 = quick win 1 in detail, day 5 = first case study (skipped until `caseStudies` has one), day 9 = personal note + booking link. Each stage is sent once, within 3 days of its target; unsubscribe link + `List-Unsubscribe` header on all. | `lib/scorecard/followups.ts`, `lib/email/templates.ts` |
| D16 | Report email subject and closing follow 04 §3; without a booking link it says "reply to this email". The PDF closing line matches. | `lib/email/templates.ts`, `lib/pdf/ReportDocument.tsx` |
| D17 | Advanced audit: privacy box required, resume-link email box optional; the email address is only needed (and stored) when that box is ticked. | `app/advanced-audit/actions.ts` |
| D18 | Sample report: fictional "Példa Kft." answers generated through the real scoring engine, so it always matches the live report. No PDF download on the sample. | `lib/scorecard/sample.ts` |
| D19 | Impressum: required rows show "[To be provided]" until filled; optional rows (postal address, phone, EU VAT, adult training, VAT) are hidden. The "Terms" link is left out until terms exist. NAIH details from 07 B are filled in, marked CHECK. | `data/business.ts`, `app/impressum/page.tsx` |
| D20 | HU naming: every "folyamatfelmérő / felmérő / felmérés" in the scorecard UI, emails, PDF and legal pages is now "Folyamat-pontozó" (suffixes adjusted: -ját, -ból, -val …). | — |
| D-design | Hero eyebrow now names "Lean Six Sigma and AI automation" (HU: "Lean Six Sigma és AI-automatizálás") so the visual redesign keeps the offer explicit. | `content/site/home.ts` |
| D-order | Homepage order changed for the funnel: problems, calculator, method, scorecard, services, about, next, FAQ, contact. See `docs/design-assessment.md`. | `app/page.tsx` |
| D-copy | New copy, EN and HU: hours calculator, hero person line, sample preview labels, "score a process like this". Calculator assumes 46 working weeks and a 40-hour week, stated on the page. Please review the Hungarian wording. | `content/site/home.ts` |
| D-visuals | All image slots are placeholders until supplied: samurai, portrait, training photo and four offer images. Backdrops are optional. Each has a prompt in `docs/asset-prompts.md`; the portrait and training photo must be real photographs. The training photo is not on the homepage now but `check:launch` still lists it. | `data/visuals.ts` |
| D-night | Superseded by D-washi (2026-11-04). The site had been redesigned to a dark cyberpunk "night shift" system; copy, offers and facts were unchanged. | `docs/design-guideline.md` |
| D-washi | 2026-11-04: retheme to the light "washi dawn" look (paper `#F6F3EE`, sumi ink, vermilion, jade, no glow, one sumi-dark contact band, pale dawn skyline with hinomaru, red 流れ hanko seal, display weight 700). Tokens, art, placeholders and prompts updated (commit c96fc3e). Copy, offers, facts and EN/HU parity are unchanged; no new unresolved values. Image slots V01-V12 unchanged in role, optional ideas N01-N04 live only in `asset-prompts.md`. PDFs and emails stay light, and the web report is light too. | `docs/design-guideline.md` |

## Workstreams

| WS | Scope | Source | Status |
| --- | --- | --- | --- |
| 1 | Config + placeholder handling + launch check | 00, 01 | ✅ |
| 2 | Home page EN + HU, header, footer, meta | 02, 03 | 🟡 live; fact-dependent blocks wait on values below |
| 3 | Contact form (DB, owner email, retention, privacy) | 02 §10, 07 B | ✅ |
| 4 | Scorecard: start page, 2-field intake, optional step 3, report CTA, naming | 04 §1–3 | 🟡 live; booking button waits on `bookingUrl` |
| 5 | Follow-up email series with separate consent + unsubscribe | 04 §3 | 🟡 day 2 + day 9 live; day 5 waits on a case study |
| 6 | Advanced audit page changes | 04 §4 | ✅ |
| 7 | Sample report page | 04 §5 | ✅ |
| 8 | Impressum restructure + privacy update | 06, 07 B | 🟡 structure live; values wait on registration |
| — | Case studies, free tools, templates, articles | 05 | ⏭️ needs Attila's interview answers |
| — | Indexing, sitemap, analytics, schema, booking tool | 00 Phase 3 | ⏭️ Phase 3 |

## Waiting on Attila (fill these in the files named; the blocks appear automatically)

| Value | File / key |
| --- | --- |
| Booking link (hero, contact, report, emails) | `data/site.ts` → `bookingUrl` |
| Full name (About heading, footer ©, Impressum) | `data/site.ts` → `fullName` |
| Green Belt issuer, year, certificate URL | `data/site.ts` → `greenBelt` |
| Years of experience + areas (proof strip, About) | `data/site.ts` → `yearsExperience`, `experienceAreas`, `aboutRoles`, `aboutProcesses` |
| LinkedIn URL, photo (`public/…`), career timeline | `data/site.ts` → `linkedinUrl`, `photo`, `timeline` |
| Tools you build with (FAQ) | `data/site.ts` → `tools` |
| Adult training registration number (FAQ, Impressum) | `data/site.ts` → `adultTrainingRegistration` |
| Launch places left | `data/offers.ts` → `launchPlacesLeft` |
| Guarantee threshold (workshop card + FAQ) | `data/offers.ts` → `guaranteeHours` |
| VAT wording (`"net"` or `"aam"`) | `data/offers.ts` → `vat` |
| `[PROOF]` hero result, weekly-report result, case studies (≥2 shows #proof; 1 enables follow-up day 5), testimonial | `data/site.ts` |
| Impressum: registered address, registration no., tax no., chamber, hosting provider (name, address, email, website), last-updated date; optional postal address, phone, EU VAT no. | `data/business.ts` |
| Privacy: hosting location, log retention; confirm Neon / Resend and the NAIH address (CHECK markers) | `data/business.ts` |
| Legal-basis wording on `/privacy` (still marked "to be confirmed by the operator") | `app/privacy/page.tsx` |

`npm run check:launch` lists every remaining marker with file and line.

## Not done in Phase 2 (and why)

- **Case-study pages** (`/work/case-studies/{slug}`), **free tools** (`/work/apps`), **templates** (`/downloads`), **articles** (`/insights`): need the interview answers in `05` §2. The home page and footer link to them automatically once content exists.
- **Hungarian legal pages** are translated but the privacy notice still carries its "draft" notice until the operator details and legal bases are confirmed.
- **`/hu/aszf` / `/terms`**: the ÁSZF does not exist yet (07 D).
- **Phase 3** items (indexing, sitemap, analytics, schema, booking tool integration).

## Verification (2026-10-27)

- `npm run typecheck`, `npm run build`: pass.
- `npm test`: 150 unit tests pass (incl. no-placeholder and EN/HU parity checks for the home page, contact validation, follow-up schedule and emails, sample report completeness).
- `npx playwright test`: 41 browser tests pass (home, contact form send, scorecard intake → step 3 → report, HU flow, Advanced audit with and without email, sample report, 320–1440 px layouts).
- Manually: owner contact email and follow-up day-2 email written to `.outbox/`; daily cron sends a follow-up once only; unsubscribe page stops the series.

## Washi dawn review pass (2026-11-04)

- Visual direction is the light "washi dawn" look; `docs/design-guideline.md` now covers quiet washi frames for empty slots, the ink contact-band skyline (`NightCity tone="ink"`), the vertical coordinates tag (>= 1240 px), `--gm-flow-text`, the light `WEB_COLORS`, footer and sign blade, and the phone hero order. No copy or unresolved values changed.
- `docs/asset-prompts.md` was checked against `data/visuals.ts` (V01-V12: file, ratio and size all match) and gained a "Quick start: generate these 5 first" list (V01, V02, V05-V07).
- `npm test`: 162 unit tests pass (`--testTimeout=60000`). E2E specs were reviewed and need no change (no colour, snapshot or dark-look assertions). Playwright was not run: it needs a database (no `.env.local`/`DATABASE_URL` here) and no browsers are installed.
