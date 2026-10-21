# Grismont — Next.js website

Native Next.js 16.4.0 / React 19.3.0 / TypeScript application. The homepage pairs a custom process illustration with concrete service descriptions, interactive process examples, a free Discovery Scorecard and direct email contact. Fonts are bundled locally.

## Run locally

For a short step-by-step walkthrough, see [Local development setup](docs/local-development.md).

Use Node.js 20.9 or newer and a local PostgreSQL.

```sh
npm ci
cp .env.example .env.local        # set DATABASE_URL; leave RESEND_API_KEY empty to write emails to .outbox/
createdb grismont_scorecard
npm run db:migrate
npm run dev -- --port 3100
```

Open `http://127.0.0.1:3100`. For a production build:

```sh
npm run build
npm run start -- --port 3100
```

Tests: `npm test` (unit, including a check that every combination of answers yields a complete report) and `npm run test:e2e` (Playwright, full scorecard flow against the dev server and local database; run `npx playwright install chromium` once).

Schema changes: edit `db/schema.ts`, then `npm run db:generate` and `npm run db:migrate`.

## Pages

- `/`: homepage.
- `/courses`, `/downloads`, `/work/case-studies`, `/work/apps`: coming-soon pages for online courses, digital products, case studies and apps. Secondary links appear only in the footer, clearly labelled as coming soon. Each page points back to current services and the free scorecard.
- `/impressum`: operator and registration information.
- `/privacy`: privacy notice for the current minimal application.
- `/cookies`: actual application cookies/storage policy.
- `/scorecard`: Discovery Scorecard intake; `/scorecard/s/{token}` questionnaire (resumable); `/scorecard/r/{token}` report (`/pdf` for the PDF); `/scorecard/delete/{token}` deletion.
- `/advanced-audit`: resumable 44-item expert process questionnaire; the respondent provides an email address and confirms they want one resume-link email after their first answer is saved. `/advanced-audit/s/{token}` saves each answer; `/advanced-audit/r/{token}` immutable report with `/json` and `/pdf` downloads. No reminders or marketing emails are sent. Draft answers expire after 30 days; completed reports expire after 12 months.
- `/api/cron/daily`: three-stage inactivity reminders, report-email retries and data retention (Vercel Cron, `vercel.json`).

All pages share the header and footer; legal links are working routes. Legal information remains clearly marked as a draft because registered business identity, country, address, identifiers, and hosting practices have not been provided.

## Languages

English keeps the existing URLs. Hungarian pages use the `/hu` prefix, including questionnaires, reports, PDF downloads, deletion pages, legal notices, and upcoming-content pages. The header switch stays on the same page and retains query parameters and anchors. During a questionnaire it saves drafts and pending answers before switching.

Hungarian wording is adapted to meaning and context. Public homepage copy lives in `content/site/home.ts`; scorecard questions, findings and shared copy have matching `en` and `hu` directories. Advanced Audit questions and form/report labels are bilingual in `lib/advanced-audit/questions.ts` and its report components. Keep question IDs, option scores, finding IDs and placeholders aligned. Scores and finding selection do not depend on language. New reports preserve their language snapshot; saved language also controls scorecard reminder and report emails.

Apply database migrations before running schema-dependent features; `0002` adds the submission language, `0003` adds the three reminder stages, `0004` creates the Advanced Audit tables, and `0005` adds consented email capture and first-answer resume-link delivery for Advanced Audit. The chosen production domain is `grismont.hu`: set `APP_URL=https://grismont.hu` in production and verify that domain in Resend before enabling email delivery. Keep localhost and test email recipients for local testing.

## Production services

For a small Vercel deployment, provision an EU PostgreSQL database through the Vercel Marketplace (Neon is the simplest fit for the existing Drizzle/Postgres code). Set Vercel's `DATABASE_URL` to the provider's pooled connection string, then run `npm run db:migrate` against that exact production database before deploying schema-dependent code. Confirm the migration history and required tables on the same database before accepting traffic. The migration script can load `.env.local`; a production migration command must explicitly target the production `DATABASE_URL` and must not silently fall back to local settings. Keep separate databases for local development and previews.

Use Resend for the transactional report and reminder emails already implemented here. Verify the sending domain in Resend, publish its SPF/DKIM DNS records, and set `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`, `APP_URL`, `CRON_SECRET`, and `IP_HASH_SALT` in Vercel's Production environment. The Vercel daily cron sends reminders near the 1/3/5-day targets; Hobby scheduling is daily, so each may arrive up to about a day after its target.

The scorecard is not a newsletter signup. If you later want a marketing list, add a separate optional checkbox and signup flow with its own recorded consent and unsubscribe handling; do not copy scorecard addresses into a mailing list.

## Edit

- `app/page.tsx` and `content/site/home.ts`: homepage sections and English/Hungarian copy.
- `app/globals.css`: visual tokens, responsive layout, and motion styles.
- `app/home.css`: scoped homepage composition, diagrams and responsive layout.
- `components/FlowArt.tsx`: illustration artwork and accessible description, styled as a digital sticky note with a gently lifted lower edge and a soft shadow concentrated at the bottom right. The figure number, bottom label and “g.” stamp have been removed.
- `components/FlowDots.tsx` and `lib/animation/flow.ts`: a fixed pool of twelve dots recoils and yields at encounters; occasional paused dots are nudged forward by a follower. Green dots move smoothly and faster after the clarity gate. `MAX_GRAY_DOTS` caps active gray dots at twelve. Returning dots wait hidden off canvas until capacity and space at their entrance are available. The simulation pauses off screen, in background tabs and for reduced-motion preferences.
- `components/ProcessExplorer.tsx`: three illustrative situations with keyboard-accessible selection buttons. Examples describe an approach, not completed client projects.
- `components/SiteHeader.tsx`, `components/SiteFooter.tsx`: shared navigation.
- `components/ComingSoonPage.tsx` and `data/coming-soon.ts`: shared upcoming-content layout, wording and footer destinations.
- `components/LegalPage.tsx`: legal-page visual structure.
- `data/business.ts`: incomplete operator/hosting fields, centralized for completion.
- `app/{impressum,privacy,cookies}/page.tsx`: legal content.

## Discovery Scorecard

- The questionnaire is one question per card, Typeform-style, fully usable from the keyboard (number keys choose, Enter continues, Backspace goes back). It opens by asking which process to assess and pipes that name into the questions about it. Intake details are saved when the user starts questions, and every answer is saved as it is given.
- Content lives in `content/scorecard/en/` and `content/scorecard/hu/`: `questions.ts` (the process question, 30 scored questions, one diagnostic, one free text) and `findings.ts` (the rule-based findings library). Bump `CONTENT_VERSION` when changing either; stored reports keep their snapshot.
- Scoring and selection: `lib/scorecard/scoring.ts` and `lib/scorecard/report.ts`. AI readiness is capped at one level above the weaker of stability and data; automation readiness is capped at that weaker score itself.
- Storage: Postgres (`db/schema.ts`), via Drizzle. Emails: Resend over HTTPS (`lib/email/`). Completed reports are emailed immediately in the saved language; the daily Vercel Cron sends up to three reminders 1, 3 and 5 days after last saved activity, and retries failed delivery. The scorecard does not subscribe people to a newsletter or marketing list. PDF: `@react-pdf/renderer` (`lib/pdf/`).
- Planned production setup: Vercel (fra1), Neon Postgres (EU), Resend. Environment variables are listed in `.env.example`.
- Design spec: `docs/superpowers/specs/2026-10-13-discovery-scorecard-design.md`.

## Current scope

No analytics, booking embeds, accounts, browser cookies, local storage, or session storage are used. The scorecard and Advanced Audit store form data in PostgreSQL, as described in `/privacy`. Advanced Audit stores the email address provided with consent to send one private resume link after the first answer; it does not attach an IP address to audit answers or send reminders/marketing emails. Fonts and their licenses are bundled locally. No runtime third-party font service is used.

The scorecard is free. Contact and review requests open an email to `hello@grismont.hu`; there is no booking calendar. The public email is centralized in `data/business.ts`. Other legal and hosting fields remain unresolved.

Pages use `noindex,nofollow` while business details and legal content are incomplete. Before launch: complete the legal fields in `data/business.ts` (including the processors), confirm the legal basis wording on `/privacy`, verify the email sending domain in Resend, set the environment variables on Vercel, replace remaining bracketed copy, and adjust indexing in `app/layout.tsx`. Add canonical/social metadata when production hosting for `grismont.hu` is configured.

## Checks performed

- `npm run build`: passed; static and dynamic routes build successfully.
- `npm run typecheck`: passed.
- `npm test`: all 124 unit tests passed, covering scoring, report completeness, animation behavior, EN/HU content and rule parity, historical report snapshots, localized email escaping and delivery URLs.
- `npx playwright test tests/e2e/home.spec.ts tests/e2e/flow.spec.ts`: nine tests cover the homepage interactions, removed illustration labels, reduced-motion switching and a 45-second animation run. All twelve dots reach the green section; paused dots recover and visible gray dots keep clear of each other.
- Homepage and scorecard intake: no horizontal overflow at 320px, 390px, 768px and 1440px. Desktop and mobile screenshots captured for visual review.
- Full English and Hungarian scorecard journeys passed against the local database, including language changes with unsaved drafts, resume, report generation, PDF download, local email output and deletion. Hungarian public/legal/upcoming pages and scorecard states were checked at 320px; request tests cover locale-header spoofing and private-link response headers.
- `npx playwright test`: all 42 browser/request tests passed together after the localization changes.
- Eight Hungarian PDF samples (48 pages) were rendered and visually checked for accents, page breaks, footers and chart layout. Report chart labels and matching score tracks were also checked at 320–1440px.

Official legal references consulted:

- [EU guidance on website privacy notices](https://europa.eu/youreurope/business/growing/digitalising/securing-website/index_en.htm)
- [EU guidance on cookies](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm)

These references do not establish the business's jurisdiction or replace its missing operator facts.
