# Discovery Scorecard — Design Spec

Date: 2026-10-13
Status: Draft for owner review

## 1. Intent

The homepage sells the Discovery Scorecard as the entry point to every engagement ("7–8 minutes. One detailed report. Zero buzzwords."). This feature makes it real.

**Outcome:** a prospect answers ~30 concrete questions about their processes and gets an immediate, specific report (web page + PDF by email) that they could act on even if they never hire Grismont. Attila is notified, and the report is the agenda for the follow-up call.

**Success criteria**
- Answers describe observable facts, not opinions; every report sentence traces back to a specific answer or score.
- Different weak areas lead to different quick wins, risk and next step; no answer set produces an empty section (enforced by the §6 coverage test).
- Intake takes < 30 s; the full questionnaire 7–8 min; a dropped session costs at most one step of answers.
- The report reflects the Grismont method: process foundations before automation, automation before AI.

**Decisions made with the owner**
| Topic | Decision |
|---|---|
| Report model | Hybrid: instant automated report + PDF; Attila notified, adds personal recommendation in the call |
| Insight engine | Rule-based findings library authored by Attila; no LLM |
| Hosting | Vercel (fra1) + Neon Postgres (EU) + Resend (EU) + Vercel Cron |
| Intake | First name, email, company size band, industry (required); company name, role (optional); privacy consent |
| Language | English at launch; all copy in locale-keyed content files so Hungarian is translation-only |
| Question format | Observable-state options scored 0–4, a few rough-number band questions, one free text |
| Reminder | Exactly one, ≥24 h after last activity |
| Retention | Unfinished: deleted after 30 days. Completed: 12 months |

## 2. User flow

```
/scorecard (intake) ──Next──▶ /scorecard/s/{resumeToken}  step 1..6 (saved per step)
                                     │
                                     ├─ abandoned ≥24h ─▶ cron sends 1 reminder ─▶ same link resumes
                                     │
                                  Submit
                                     ▼
                          /scorecard/r/{reportToken}  (web report)
                          + email to submitter (PDF attached, web link)
                          + email to owner (summary + link)
```

1. **Intake** (`/scorecard`). Fields per §1. Consent checkbox text: "I've read the [privacy notice]. You may email me about this scorecard, including one reminder if I don't finish." Server action validates, creates a `submissions` row (`in_progress`), redirects to `/scorecard/s/{resumeToken}`. If the same email already has an `in_progress` submission, that one is marked `superseded` (no reminder) and a fresh one is created; the response never reveals whether the email existed.
2. **Questionnaire** (`/scorecard/s/{resumeToken}`). Six steps, one per area, progress bar, Back/Next. Each Next calls a server action that validates the step against the question bank and persists `answers` + `current_step`. Opening the link anywhere resumes at `current_step`. The free-text question sits on the last step.
3. **Submit.** Idempotent: if already `completed`, redirect to the existing report. Otherwise compute scores → select findings → write `reports` row with a frozen snapshot (`content_version`) → set `completed` → redirect to report → send submitter email (PDF attached) and owner notification. Email failure never blocks the redirect; failed sends are retried by cron.
4. **Reminder.** Daily Vercel Cron (Hobby plan allows daily only, so reminders land 24–48 h after last activity). Selects `in_progress` rows with `updated_at < now − 24h` and `reminder_sent_at IS NULL`; sends one email ("You're 3 of 6 areas in…" + resume link + delete link); sets `reminder_sent_at`.
5. **Deletion.** `/scorecard/delete/{resumeToken}` confirms and deletes the submission, its report and email logs. Linked from every email and the report page.
6. **Retention.** The same cron deletes `in_progress`/`superseded` rows older than 30 days and `completed` rows older than 12 months.

## 3. Data model (Postgres via Drizzle ORM)

```
submissions
  id               uuid pk
  resume_token     text unique   -- 128-bit random, base64url
  status           enum(in_progress, superseded, completed)
  first_name, email, company_size, industry   text not null
  company_name, role                          text null
  consent_at       timestamptz not null
  ip_hash          text          -- sha256(ip + IP_HASH_SALT), rate limiting only
  answers          jsonb not null default '{}'   -- { [questionId]: optionId | string }
  current_step     int not null default 0
  reminder_sent_at timestamptz null
  created_at, updated_at, completed_at

reports
  submission_id    uuid pk fk → submissions on delete cascade
  report_token     text unique
  content_version  text
  result           jsonb   -- ReportModel snapshot (§5), rendered by web + PDF
  created_at

email_log
  id, submission_id fk on delete cascade
  kind             enum(report, reminder, owner_notify, deletion_confirm)
  status           enum(pending, sent, failed)
  provider_id      text null
  attempts         int
  unique (submission_id, kind)   -- idempotency
```

Report and resume tokens are separate so sharing a report link doesn't let someone edit or delete answers.

## 4. Question bank (draft, `content/scorecard/en/questions.ts`)

Scores in brackets. Options are written as observable situations. Band questions convert rough numbers to scores. `(diag)` = unscored, used only by findings rules. Industry variants swap example wording (e.g. "order" vs. "request") but not scoring.

### Flow & waste (FW)
- **FW1** Take a typical request that needs about an hour of actual work (a quote, an approval, a report change). From the moment it's requested, when is it usually done? — Nobody could say; it varies wildly [0] · Within 1–2 weeks [1] · Within a few days [2] · Same or next day [3] · Same or next day, and we track it [4]
- **FW2** (diag) Where does that request spend most of its time? — Waiting for an approval · Sitting in someone's inbox or queue · Waiting for information from another team or the customer · Being corrected or redone · Actually being worked on · I don't know
- **FW3** How often does work come back to be corrected or redone because something was missing, wrong or unclear? — Constantly; it's part of the job [0] · Something significant most weeks [1] · Regularly, and we know the usual causes [2] · Occasionally [3] · Rarely, and when it happens we fix the cause [4]
- **FW4** When work moves from one person to the next, how does the next person know it's their turn? — They're told in passing, or they chase it [0] · Email or chat; things get missed [1] · A shared list or board that isn't always current [2] · A queue or system everyone actually uses [3] · A queue with visible limits; overdue items are flagged [4]
- **FW5** Roughly what share of a typical week does your team spend searching for information, chasing status or waiting on others? — 30%+ [0] · 20–30% [1] · 10–20% [2] · 5–10% [3] · Under 5% [4]

### Stability & standards (SS)
- **SS1** When a new person does this work for the first time, they learn it by… — asking whoever is around [0] · shadowing one specific person [1] · reading notes that are mostly current [2] · following a written standard that's updated when the process changes [3] · following a written standard; deviations are logged and trigger an update [4]
- **SS2** When two people do the same task, how often do their outputs differ in ways that matter? — Often, and we find out when a customer or manager complains [0] · Often; our checks catch most of it [1] · Sometimes [2] · Rarely; there's a shared template or checklist [3] · Rarely, and we measure it [4]
- **SS3** If the person who knows your most critical process best were away for two weeks, what would happen? — It would largely stop [0] · It would limp along with calls to them [1] · Others would manage, with mistakes [2] · Others would manage from the documentation [3] · Nothing; we rotate people so it's routine [4]
- **SS4** How are exceptions (unusual orders, special customers, edge cases) handled? — Everyone handles them their own way [0] · Always escalated to one senior person [1] · Known rules, but only in people's heads [2] · Written rules for the common ones [3] · Written rules; new exception types get added [4]
- **SS5** When the way of working changes, how does everyone find out? — When something goes wrong [0] · Word of mouth [1] · An email or meeting; documents aren't updated [2] · Documents updated and the change announced [3] · Updated, announced, and checked a few weeks later [4]

### Data & measurement (DM)
- **DM1** For your most important process, could you state last month's error or rework rate without looking it up? — We don't measure it [0] · It's measured, but I'd have to dig [1] · I have a rough idea, not sure it's right [2] · Yes, from a regular report [3] · Yes, and I know the trend and the main causes [4]
- **DM2** Where do the numbers in your management or KPI review come from? — There's no regular review [0] · Someone builds them by hand from several files [1] · A partly automated spreadsheet [2] · Mostly straight from our systems, with some manual fixes [3] · Straight from our systems; definitions are written down [4]
- **DM3** If two people pull the same number (last month's revenue, open orders), do they get the same result? — Rarely [0] · Often not, and an argument follows [1] · Usually, after reconciling [2] · Yes, mostly [3] · Yes: one agreed definition, one source [4]
- **DM4** When a decision is made about a process problem, what is it usually based on? — Whoever is most senior or most convinced [0] · A recent complaint or anecdote [1] · Data pulled for the occasion [2] · Data we review regularly [3] · Data with a baseline, and the result is measured afterwards [4]
- **DM5** How much of your key operating data lives in personal spreadsheets or inboxes instead of a shared system? — Most of it [0] · A lot [1] · About half [2] · Some [3] · Very little [4]

### Automation potential (AP) — two sub-scores
Opportunity (higher = more manual, rule-based work to automate):
- **AP1** Roughly how many hours per week does your team spend copying or re-typing data between systems, files or emails? — Under 2 [0] · 2–5 [1] · 5–15 [2] · 15–40 [3] · 40+ [4]
- **AP2** How many of your recurring tasks follow fixed rules, where the same inputs always lead to the same steps? — Hardly any [0] · A few [1] · Some [2] · Many [3] · Most [4]

Readiness:
- **AP3** Could you write the steps of your most repetitive task as if/then rules today, without asking anyone? — No [0] · Only the main path [1] · Main path and common exceptions, with help [2] · Yes [3] · It's already written down that way [4]
- **AP4** Do the systems you use let data out (export, API, integrations)? — I don't know [0] · Only manual export [1] · Some of them [2] · Most, and we've used it [3] · We have working integrations today [4]
- **AP5** What happened to the last automation or software tool you introduced? — It was abandoned [0] · We haven't introduced one [1] · It works, but only one person can fix it [2] · It works and has an owner [3] · It works, has an owner and documentation, and we measured the time saved [4]

### AI readiness (AI)
- **AI1** Is there a rule about which company or customer data may go into AI tools? — No; people use what they like [0] · AI is banned, but people probably use it anyway [1] · Informal guidance [2] · A written, communicated rule [3] · A written rule, plus approved tools on company accounts [4]
- **AI2** How is AI used in your company today? — People use free tools for work; we don't know what for [0] · Not at all [1] · A few people use it for writing and summaries [2] · Specific tasks in specific roles, done an agreed way [3] · Specific use cases with a measured benefit [4]
- **AI3** Where is the knowledge needed to answer a typical customer or internal question written down? — In people's heads [0] · Scattered files and old emails [1] · A shared drive, partly out of date [2] · A maintained knowledge base [3] · Maintained, with an owner and review dates [4]
- **AI4** If an AI tool drafted an answer or a decision, how would you check it was right? — We'd have no way to check [0] · Someone would read it and judge [1] · Compare it by hand against past examples [2] · We have clear criteria for a correct output [3] · Clear criteria plus a set of past cases to test against [4]
- **AI5** Is there a specific problem you want AI to solve, with a number attached? — No; we just feel we should use AI [0] · General ideas [1] · A specific use case, no numbers [2] · A specific case with an estimated cost or time saving [3] · A specific case with a measured baseline [4]

### People & ownership (PO)
- **PO1** Think of the last improvement your team made. Is it still done that way three months later? — I can't think of one [0] · It faded out [1] · Partly [2] · Yes [3] · Yes, and someone checks [4]
- **PO2** Who owns your most important cross-team process end to end, by name? — Nobody [0] · Everyone owns their own piece [1] · A manager, informally [2] · A named person [3] · A named person with the authority and a KPI to match [4]
- **PO3** When someone on the front line spots a problem, what usually happens? — They work around it [0] · They tell someone; rarely does anything change [1] · It's fixed case by case [2] · There's a regular moment to raise and track problems [3] · It's raised, tracked, the root cause is fixed, and they hear back [4]
- **PO4** How much time do people have for improvement work, beyond the daily job? — None [0] · Only after hours or in a crisis [1] · Occasionally, when a manager pushes [2] · Planned time for some people [3] · Planned, protected time, with results reviewed [4]
- **PO5** How does leadership react when someone shows a process is worse than everyone thought? — The messenger takes the heat [0] · Defensive, then quiet [1] · Accepted, but little follows [2] · Accepted, and a fix is resourced [3] · They ask for it; early bad news is welcomed [4]

### Free text (last step)
- **FT1** Which process would you fix first if you could, and what goes wrong in it? (optional, max 1,000 chars)

Total: 30 scored + 1 diagnostic + 1 free text.

## 5. Scoring and report model (`lib/scorecard/`)

**Area scores:** mean of scored answers, 0–4, one decimal. Levels: <1 Ad hoc · <2 Person-dependent · <2.75 Documented · <3.5 Managed · ≥3.5 Improving.

**Automation:** `opportunity` = mean(AP1, AP2); `readiness` = mean(AP3, AP4, AP5). The AP area score shown in the profile is `readiness`; opportunity is shown separately in the 2×2.

**Foundation gate:** `foundation = min(SS, DM)`. `AI_shown = min(AI_raw, foundation + 1)`. If capped, the report shows raw and capped values and a fixed explanation.

**No single headline number.** The report leads with the six-area profile. The owner notification uses the profile string (e.g. `FW 1.8 · SS 1.2 · DM 2.0 · AP 2.3/3.5 · AI 2.2 (raw 3.0) · PO 1.6`).

**ReportModel** (stored in `reports.result`, consumed by web and PDF):
```ts
type ReportModel = {
  contentVersion: string;
  intake: { firstName: string; companySize: SizeBand; industry: Industry; companyName?: string };
  areas: Record<AreaId, { score: number; level: Level; note: FindingText }>;
  ai: { raw: number; shown: number; capped: boolean };
  automation: { opportunity: number; readiness: number; quadrant: Quadrant };
  quickWins: FindingText[];      // exactly 3
  biggestRisk: FindingText;      // exactly 1
  roadmap: { d30: FindingText[]; d60: FindingText[]; d90: FindingText[] };
  nextStep: { kind: 'fix-first' | 'training' | 'workshop' | 'project'; text: FindingText };
  freeText?: string;
};
type FindingText = { id: string; title: string; observed: string; why: string; action: string; done: string };
```

## 6. Findings engine (`content/scorecard/en/findings.ts`, `lib/scorecard/select.ts`)

Each finding:
```ts
{ id, kind: 'quickWin' | 'risk' | 'roadmap' | 'areaNote' | 'nextStep',
  area, priority, phase?: 1 | 2 | 3,   // method order: 1 foundation (FW/SS/DM/PO), 2 automation, 3 AI
  when: (ctx) => boolean,              // ctx = answers, scores, intake
  variants?: { size?, industry? },
  text: { title, observed, why, action, done } }
```
`observed` may interpolate the chosen option label ("You told us new people learn by {SS1}"). Rules for writing text: no theory, no jargon without an inline explanation, every `action` time-boxed and with a `done` criterion a non-expert could verify.

**Selection**
- **Quick wins:** eligible `quickWin` findings sorted by priority; at most one per area; exactly 3 (fallback generic-but-specific wins per area guarantee the count).
- **Biggest risk:** highest-priority eligible `risk`. Built-in risk rules include "automation opportunity ≥3 and foundation <2" (automating chaos), "AI2 = 0 and AI1 ≤1" (data leaking into unapproved tools), "SS3 ≤1" (single point of failure). Fallback: the lowest area's risk.
- **Roadmap:** eligible `roadmap` items sorted by `phase`, then priority; phase-1 items fill d30 first. Phase 3 (AI) items may only appear in d90, and only if `foundation ≥ 2`. 2–3 items per column.
- **Area notes:** exactly one `areaNote` per area, chosen by level.
- **Next step** (first match wins):
  1. `foundation < 1.5` → **fix-first**: "Fix these three things first" (= the d30 items)
  2. `PO < 2` → **training** (improvements won't stick without the team owning the method)
  3. `opportunity ≥ 3 && readiness ≥ 2 && foundation ≥ 2` → **project**
  4. otherwise → **workshop** (AI use-case discovery if `AI5 ≥ 2`, else value-stream mapping)

**Coverage guarantee (test):** generate all level combinations across areas (5⁶ = 15,625) × sizes × industries, plus randomized answer sets; every combination yields a complete ReportModel (3 quick wins, 1 risk, ≥2 items in each roadmap column, 6 area notes, 1 next step).

**Content workflow:** I draft ~60–80 findings in P1; Attila reviews and rewrites in his voice before P3 ships. Bump `contentVersion` on any change; old reports keep their snapshot.

## 7. Report presentation

**Web** (`/scorecard/r/{reportToken}`, `noindex`, `Referrer-Policy: no-referrer`), using existing `#grismont-board` tokens, fonts and `gm-` class conventions:
1. Header: "{firstName}, here's where you stand." + date + PDF download link
2. Six-area profile: horizontal bars with level labels; AI bar shows raw value as a ghost segment beyond the cap
3. Automation 2×2 (opportunity × readiness) with their position and one-line quadrant meaning
4. Biggest risk callout (lilac)
5. Three quick-win cards (observed / why / action / done)
6. 90-day roadmap in three columns
7. Area notes (native `<details>`, consistent with homepage)
8. Their free-text answer quoted: "We'll start the call here."
9. Next step + call link (currently `/#contact`; real booking link later) + delete-my-data link

Charts are inline SVG built from pure geometry functions in `lib/scorecard/chart-geometry.ts`; the web uses DOM SVG, the PDF uses `@react-pdf/renderer` `Svg`/`Rect`/`Path` with the same geometry.

**PDF** (`lib/pdf/ReportDocument.tsx`): A4, sections 1–8 above, DM Sans/Manrope registered from `public/fonts` (add `outputFileTracingIncludes` so fonts ship with the serverless function). Generated at submit time and on demand at `/scorecard/r/{reportToken}/pdf`.

## 8. Email (`lib/email/`, React Email templates, Resend EU)

| Kind | To | Content |
|---|---|---|
| report | submitter | Short summary (profile + biggest risk title), web link, PDF attached, delete link |
| reminder | submitter | Progress ("3 of 6 areas"), resume link, delete link |
| owner_notify | `OWNER_NOTIFY_EMAIL` | Intake, profile string, free text, report link |
| deletion_confirm | submitter | Confirms deletion |

All sends go through `sendOnce(submissionId, kind, build)` which inserts/locks the `email_log` row; a `sent` row is never resent. Cron retries `failed` rows with `attempts < 3`. Sender domain must be verified in Resend (SPF/DKIM) before launch.

## 9. Security, abuse, privacy

- Tokens: 128-bit `crypto.randomBytes`, base64url; lookups by token only; no enumeration.
- Intake: hidden honeypot field; max 5 intakes per `ip_hash` per hour (query on `submissions`), generic error.
- All server actions validate input against the question bank (unknown ids/options rejected; free text length-capped and rendered as text only).
- Cron route requires `Authorization: Bearer ${CRON_SECRET}`.
- Still no cookies or browser storage; the cookie page stays accurate apart from naming processors.
- **Legal pages must be rewritten (blocking for launch):** `/privacy` gains scorecard data, purposes, legal basis (consent for reminder/report emails; owner to confirm), processors (Vercel, Neon, Resend; EU regions), retention (§2), deletion link, rights. `data/business.ts` placeholders remain launch blockers.
- Homepage copy: scorecard CTAs → `/scorecard`; "I analyze your answers and write your report ([3] working days)" → instant report + call; "[Free / price]" still needs the owner's decision.

## 10. Code layout

```
app/scorecard/page.tsx                    intake
app/scorecard/actions.ts                  startSubmission, saveStep, submit (server actions)
app/scorecard/s/[token]/page.tsx          questionnaire (client step form inside)
app/scorecard/r/[token]/page.tsx          web report
app/scorecard/r/[token]/pdf/route.ts      PDF download
app/scorecard/delete/[token]/page.tsx     deletion confirm
app/api/cron/daily/route.ts               reminders, email retries, retention
components/scorecard/*                    StepForm, ProgressBar, ProfileChart, Quadrant, FindingCard, Roadmap
content/scorecard/en/{questions,findings,copy}.ts
lib/scorecard/{types,scoring,select,report,chart-geometry,tokens}.ts
lib/pdf/ReportDocument.tsx
lib/email/{send,templates/*}.tsx
db/{schema,index}.ts, drizzle.config.ts
vercel.json                               cron schedule
```
Env: `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`, `CRON_SECRET`, `APP_URL`, `IP_HASH_SALT`. Provide `.env.example`.

New dependencies: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `resend`, `@react-email/components`, `@react-pdf/renderer`, `zod`; dev: `vitest`, `@playwright/test`.

## 11. Testing

- **Unit (Vitest):** scoring, gate, quadrant, selection, next-step rules, token generation, input validation.
- **Coverage test:** §6 exhaustive completeness check.
- **Content lint test:** every option has a score or is diag; every finding has non-empty fields and a `done`; no unresolved interpolation keys.
- **Rendering:** PDF renders to a buffer without error for fixture reports; email templates render to HTML snapshots.
- **E2E (Playwright):** intake → 6 steps → submit → report visible; resume link restores step; double submit yields one report. Runs against local Postgres (Docker) with the email sender stubbed.

## 12. Delivery phases

| Phase | Scope | Shippable result |
|---|---|---|
| P1 | DB schema, types, question bank, findings library draft, scoring + selection with tests | Owner reviews content; engine proven by tests |
| P2 | Intake + questionnaire with per-step saving, rate limit, honeypot | Collects answers |
| P3 | Submit, report snapshot, web report with charts | Instant web report |
| P4 | PDF, Resend integration, report + owner emails | Report delivered by email |
| P5 | Daily cron: reminder, retries, retention; deletion flow | Abandonment and data lifecycle handled |
| P6 | Privacy/cookies rewrite, homepage CTA and copy changes | Launch-ready pending owner's legal facts |

## 13. Out of scope

Admin dashboard, editing reports after submission, Hungarian translation, real booking integration, analytics, payments, multiple respondents per company, LLM-generated text.

## 14. Open items for the owner (do not block P1–P5)

- Scorecard price/free rule (homepage `[Free / price]`)
- Legal basis wording for the emails and the business facts in `data/business.ts`
- Sending domain for email
- Final rewrite of question and finding wording in your voice

## 15. Implementation notes (deviations from this spec, 2026-10-13)

- **Roadmap placement:** each roadmap item has a fixed `window` (30/60/90) chosen by the author, instead of being distributed by `phase`. This is simpler to edit and keeps the method order explicit. AI-pilot and automation items stay gated on `foundation >= 2`.
- **Quick wins skip the biggest risk's area**, so the report never gives the same advice twice.
- **Emails** are plain HTML/text template functions (`lib/email/templates.ts`) sent with `fetch` to the Resend API, without React Email or the Resend SDK. Without `RESEND_API_KEY` they are written to `.outbox/`.
- **No deletion confirmation email:** deletion is confirmed on screen, so no email address has to be kept after deletion. The `deletion_confirm` email kind was dropped.
- **Database driver:** `pg` (node-postgres) instead of `@neondatabase/serverless`, so the same code runs against local Postgres and Neon (use Neon's pooled connection string).
- **Report link on the page:** the report page doesn't show the delete link, because it only has the read-only report token. The delete link is in every email.
- **Automation readiness is capped by foundation** (`automationReady = min(readiness, min(SS, DM))`), like AI readiness. Without it, a company with weak stability or data could be shown "Automate now" while its biggest risk said "Automating a process that isn't stable yet". The quadrant, `rm90-automate`/`rm90-automate-gate` and the project next step all use the capped value; the report explains the cap when it applies.
- **Quadrant chart:** the dot is kept strictly inside its quadrant (a score of exactly 2.0 never sits on the dividing line), quadrant names sit outside the square so the dot can't cover them, and the company's quadrant is highlighted, in both the web report and the PDF.
- **Card flow (2026-10-13, later):** the six-section form became a Typeform-style flow, one question per card, opening with "which process should we look at?" (`P1`, required). Its answer is piped into process-specific prompts and findings (`{process}`); company-wide questions (AI rules, leadership) stay general. Keyboard: 1–9 choose and auto-advance, Enter/Space/→ continue, Backspace/← back. Each answer is saved on its own (`saveAnswerAction`), so `current_step` was dropped and a dropped session loses nothing. The progress bar has one segment per section, sized by question count, with a single light sweep when a section completes. The reminder email now counts questions answered.
