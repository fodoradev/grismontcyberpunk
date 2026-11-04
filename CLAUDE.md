# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node.js >= 20.9. Local development needs PostgreSQL (`.env.local` from `.env.example`; Next loads it automatically).

```sh
npm ci
npm run dev -- --port 3100     # dev server, bound to 127.0.0.1
npm run typecheck              # tsc --noEmit
npm run build                  # production build
npm test                       # vitest unit tests (tests/unit)
npx vitest run tests/unit/report.test.ts -t "shadow-AI"   # single file / single test
npm run test:e2e               # Playwright (tests/e2e), reuses a dev server on :3100
npm run db:generate            # drizzle-kit: SQL migration from db/schema.ts changes
npm run db:migrate             # apply db/migrations
npm run check:launch           # fails while {{FILL}}/{{DECIDE}}/{{CHECK}} placeholders remain (run before going live)
```

Without `RESEND_API_KEY`, emails (and PDF attachments) are written to `.outbox/` instead of being sent. The daily job can be triggered locally with `curl -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3100/api/cron/daily`.

## What this is

Marketing site for Grismont (Lean Six Sigma / automation / AI consulting), built with Next.js 16 App Router, React 19, TypeScript 7. The visual system is "washi dawn" (a light Japanese-futurist morning that keeps the cyberpunk heritage without neon: warm washi paper surfaces, sumi-black ink, vermilion crimson for friction and action, jade for work that runs clear, no glow, one sumi-dark band for contact, a pale dawn skyline with a hinomaru disc and a red 流れ hanko seal, huge condensed signage type, one cut corner, a flow line that starts tangled and runs straight, the Flow Samurai in the hero), specified in `docs/design-guideline.md`: treat visual changes as deliberate design decisions, not cleanup, and update that guide with them.

Routes: `/` (`app/page.tsx`), `/impressum`, `/privacy`, `/cookies`, the Discovery Scorecard under `/scorecard` (including the public `/scorecard/sample`), and `/advanced-audit`. Hungarian lives under `/hu/…` (rewritten by `proxy.ts`). All share `SiteHeader`/`SiteFooter` via `app/layout.tsx`.

## Content plan and unresolved facts

Copy and offers come from `docs/content-plan/` (01–07); `docs/content-plan/IMPLEMENTATION.md` tracks what is built, the decisions taken and every value still missing. Keep it updated with any change to that content.

- **Facts live in three files**: `data/site.ts` (name, booking link, Green Belt, experience, `[PROOF]` content, `sampleReportPublished`), `data/offers.ts` (prices, guarantee, VAT, launch places) and `data/business.ts` (Impressum/processor details). Home copy is built by `getHomeContent(locale)` in `content/site/home.ts`.
- **Unresolved values keep their content-pack marker** (`"{{FILL: …}}"`, `"{{DECIDE: …}}"`, `"{{CHECK: …}}"`). `known()` (`data/site.ts`) treats them as missing, so the block that needs them is hidden (legal pages show "[To be provided]"). Never render a marker, and never invent a value for one. `npm run check:launch` lists them.
- **`[PROOF]` blocks are data-driven**: `#proof` appears with ≥2 `caseStudies`, footer resource links only when the page exists. Homepage section numbers are counted at render time. No "coming soon" links anywhere.

## Architecture

- **Everything is scoped under `#grismont-board`.** `app/layout.tsx` wraps the whole site in `<div id="grismont-board">`, and every rule in `app/globals.css` is prefixed with `#grismont-board`. Design tokens (`--gm-paper`, `--gm-white`, `--gm-ink`, `--gm-muted`, `--gm-line`, `--gm-mist`, `--gm-crimson`, `--gm-crimson-deep`, `--gm-crimson-lift`, `--gm-steel`, `--gm-on-dark`, `--gm-band`, `--gm-flow`, `--gm-on-accent`, `--gm-display`, `--gm-sign`, `--gm-body`, `--gm-mono`, `--gm-gutter`, `--gm-space`, …) are defined on that element, not `:root`. Token names are roles kept from the earlier palette: `--gm-paper` is the light page, `--gm-white` a raised light surface and `--gm-ink` dark text, so never use `--gm-ink` as a background (the contact band uses `--gm-ink-surface`); text on crimson or jade is white `--gm-on-accent`. Small jade text only on paper or white (contrast); a `--gm-flow-text` token may exist for it. Classes use the `gm-` prefix; legal pages use `legal-*`. Later blocks in `globals.css` (e.g. the "Responsive hierarchy" section) intentionally override earlier rules, so check the whole file before editing a selector.
- **Homepage motion lives in one client component, `components/HomeMotion.tsx`** (the other client components are `ProcessExplorer` (the #problems cards), `ContactForm` and the scorecard/audit forms). It renders nothing and drives the scroll entrances imperatively by toggling classes on DOM it finds via selectors (`main>section`, `.home-hero`, `.home-section`):
  - adds `gm-reveal` / `gm-visible` for scroll entrances, gated by `gm-motion-enabled` on the root;
  - honors `prefers-reduced-motion` (removes motion classes);
  - every listener, observer, and class is removed in the effect cleanup. Keep it that way when modifying.
  Changing section structure or these class names in `app/page.tsx` can silently break motion; the CSS in `globals.css` (`.gm-reveal`, reduced-motion media query) must stay in sync. The only other motion is CSS: the hero's single, gentle load moment (headline, flow line, samurai frame and the 流れ hanko seal settling once, `home.css`, no flicker), and no persistent animation.
- **Visuals**: `data/visuals.ts` lists every slot, and `docs/asset-prompts.md` holds a ready-to-paste prompt for each `promptId`. A content slot's `{{FILL}}` `src` makes `components/VisualSlot.tsx` draw a labelled placeholder and keeps `check:launch` failing. Backdrops (`VisualBackdrop`, `getBackdrop`) have `src: null`, never block launch, and the section is complete on its CSS atmosphere without them. Set a path under `public/art/` and the image appears. The portrait and `training` are real photographs, only graded: never generate them. Other homepage client components: `HoursCalculator` (own inputs only), `MethodSteps` (rail), `ScorecardShowcase` (preview from `sampleReport`), `StickyCta` (phones).
- **`components/FlowArt.tsx`** (in `#method`) with `FlowDots.tsx` and `lib/animation/flow.ts` plays the tangled-to-clear stream for 12 s of in-view time, then sets `data-flow-settled` on the SVG and rests on the static dots, which are also the reduced-motion picture.
- **Header/footer use plain `<a href="/#section">`** anchors (not `next/link`) so in-page section links work from legal pages too. Homepage disclosures (scorecard areas, FAQ, mobile menu) are native `<details>`, with no JS state.
- **Contact form** (`#contact`): `components/ContactForm.tsx` → server action `lib/contact/actions.ts` → `contact_messages` table, owner email via `deliverEmail` (retried by the daily job), deleted after 12 months, 5/hour per IP hash. Service-card links carry `data-interest` to preselect the form's interest.
- **Legal pages** wrap content in `components/LegalPage.tsx` and read operator/hosting facts through `getBusiness(locale)` in `data/business.ts`; fill them there rather than hardcoding in pages.
- **Fonts** (Big Shoulders Display for display lines, set in capitals; Figtree for reading text; IBM Plex Mono for small labels; a two-glyph Noto Sans JP subset for the 流れ sign) are self-hosted TTFs in `public/fonts/`, subset to Latin + Latin Extended, with `@font-face` at the top of `globals.css`. The PDFs read the Figtree files. Do not add runtime third-party font services.
- `next.config.ts` sets security headers and disables `X-Powered-By`.

## Discovery Scorecard

Flow: `/scorecard` intake asks only first name + email, a required privacy box and a separate optional reminders box (server action `startScorecard` → row in `submissions`) → `/scorecard/s/{resumeToken}`, a Typeform-style flow (`components/scorecard/CardFlow.tsx`): one question per card, starting with the process to assess (`P1`), each answer saved in the background by `saveAnswerAction` (optimistic, in order, retried). The final card is the optional step 3 (company size, type of work, role, company, separate follow-up-email consent) → `submitAction(token, profile)` saves the profile, scores the answers, stores a frozen `ReportModel` in `reports.result`, redirects to `/scorecard/r/{reportToken}`, and sends the emails in `after()`. A daily cron (`app/api/cron/daily` → `runDaily` in `lib/scorecard/delivery.ts`) sends up to three reminders (only with `reminder_consent_at`), the follow-up series (day 2/5/9, only with `follow_up_consent_at` and not `unsubscribed_at`; schedule in `lib/scorecard/followups.ts`), retries failed emails and deletes expired data (30 days unfinished, 12 months completed). `/scorecard/unsubscribe/{resumeToken}` stops the follow-ups.

- Company size and type of work are optional (`Intake.companySize?`, `industry?`): findings must not assume them.
- Hungarian name of the scorecard is **Folyamat-pontozó** everywhere (Advanced audit: **Részletes folyamat-audit**).

- **Pure engine vs. I/O.** `lib/scorecard/{types,scoring,report,validation,chart-geometry}.ts` are pure and unit-tested. `store.ts` (Drizzle queries) and `delivery.ts` (PDF + email orchestration) do the I/O. `db/index.ts` connects lazily through `getDb()`, so the build never needs `DATABASE_URL`.
- **Keyboard contract** (`CardFlow.tsx`): 1–9 choose (auto-advance after 380 ms), Enter/Space/→ continue, Backspace/← back, ↑/↓ move between options; inside a text field only Enter (not Shift+Enter) leaves it. Card order is `QUESTIONS` order, and resume lands on `firstOpenIndex(answers)` (`validation.ts`).
- **Content is data.** `content/scorecard/en/questions.ts` (option index = 0–4 score; prompts may pipe in `{process}`) and `findings.ts` (findings with `when(ctx)` rules and `{QID}` / `{process}` / `{weakest}` / `{score.X}` placeholders). Shared report wording lives in `copy.ts`. Selection in `report.ts` ranks by priority plus area weakness and picks 3 quick wins from different areas, skipping the biggest risk's area. Every report's text comes from here; bump `CONTENT_VERSION` when it changes. `tests/unit/report.test.ts` runs all 15,625 area-level combinations and lints placeholders, so run `npm test` after any content edit.
- **Method order is enforced in code** (`scoring.ts`): AI readiness is capped at `min(SS, DM) + 1`, and automation readiness at `min(SS, DM)` (`automationReady`). The automation quadrant, the "automate" roadmap items and the project next step all use `automationReady`, so they can't disagree. `tests/unit/quadrant.test.ts` checks this agreement and that the dot (`quadrantPoint` in `chart-geometry.ts`) always lands inside its quadrant.
- **Two tokens per submission**: `resume_token` (edit/delete) and `report_token` (read-only). Never put the resume token on the report page.
- **Emails are send-once**: always go through `sendOnce(submissionId, kind, build)` in `lib/email/send.ts`, which claims the `email_log` row atomically.
- **Web and PDF report share data, not components**: `components/scorecard/ReportView.tsx` (DOM SVG) and `lib/pdf/ReportDocument.tsx` (`@react-pdf` primitives) both use `chart-geometry.ts`. Change both when the report layout changes. Print stays on paper: the PDF and emails use the light `COLORS`, and the web report (`WEB_COLORS`) follows the same light washi dawn palette. The PDF reads fonts from `public/fonts` (traced via `outputFileTracingIncludes` in `next.config.ts`).
- Scorecard styles are the `sc-` block in `globals.css`, with the current flow, report, intake and legal layout overriding it from `app/inner.css`, all scoped under `#grismont-board`.
- **Focused flow shell**: on `/scorecard/s/*` and `/advanced-audit/s/*` CSS hides the nav, header CTA and footer. The counter counts scored questions only ("Question n of 30"), so the process and free-text cards carry no number. Area-complete lines come from `components/scorecard/momentum.ts`.
- **Forms submit through `onSubmit` + `startTransition`**, keeping the `action` prop only for submits before hydration: a bare `action` prop resets uncontrolled fields when it returns, which loses a consent tick. Avoid `<output>` near forms; it has an implicit `status` role.

## Project constraints (from README)

- No analytics, cookies, localStorage/sessionStorage or third-party embeds. The scorecard, the Advanced audit and the contact form store personal data, and `/privacy` describes exactly what each stores, why and for how long. If you change the data, emails or retention, update `/privacy` (and `data/business.ts` for processors) to match.
- Bracketed text in the copy (e.g. `[Free / price]`) is unresolved business information. Don't invent values for it.
- Booking CTAs still point at `/#contact` as placeholders until a real booking link exists.
- `robots: { index: false, follow: false }` in `app/layout.tsx` stays until launch. Canonical/social metadata waits until a production domain is chosen.
