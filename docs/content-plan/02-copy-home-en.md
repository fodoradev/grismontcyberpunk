# 02 — Home page copy (English)

Page: `/` (EN). The Hungarian page `/hu` uses `03-copy-home-hu.md` with the same section order and IDs.
Based on: `01-positioning-offer-pricing.md`.
Placeholders: `{{FILL: ...}}` = fact from Attila. `{{DECIDE: ...}}` = choice. `[PROOF]` = block that stays
hidden until real content exists (see `05-proof-plan.md`).

Notes for implementation:
- Keep the current visual style, the animated "tangle to path" graphic and the section numbering.
- Section IDs are given in brackets, e.g. `#problems`. Keep the current IDs where they exist.
- Do not publish any block that still contains `{{FILL}}`. Hide `[PROOF]` blocks until filled.

---

## Meta
- **Title:** Process improvement, training and automation for operations | Grismont
- **Description:** Faster orders, reports and handovers for manufacturing, logistics and office teams.
  Practical Lean training, process improvement, automation and AI. Start with a free 8-minute scorecard.
- **OG title:** Less admin around operations | Grismont
- **OG description:** Process first. Then automation and AI, only where it pays.

## Navigation
- The problems (`#problems`)
- Training & services (`#services`)
- How I work (`#method`)
- About (`#about`)
- Contact (`#contact`)
- Button: **Free scorecard** → `/scorecard`
- Language toggle: **HU** → `/hu` (same section)

---

## 1. Hero (`#home`)

**Eyebrow:** For manufacturing, logistics and the office teams behind them

**H1:** Get back the hours your team loses to admin.

**Sub-line:** Orders, reports, approvals and handovers take too long and break too often.
I fix the process first, train your team to keep it working, and automate only what pays.

**Primary CTA:** Get your free scorecard → `/scorecard`
**Microcopy under primary CTA:** 8 minutes · 30 questions · report on screen and as PDF

**Secondary CTA:** Book a 20-minute call → `{{FILL: booking link, e.g. Cal.com}}`

**Tagline under the graphic:** Good work. Fewer tangles.

### Proof strip (directly under the hero)
Three short items. Use real facts only.
1. Lean Six Sigma Green Belt — `{{FILL: issuer, year}}`
2. `{{FILL: X}}` years in operations and advisory — `{{FILL: e.g. "shared services, logistics, finance operations"}}`
3. `[PROOF]` `{{FILL: one measured result, e.g. "Month-end report: 3 days → 4 hours"}}`

If item 3 is not ready, use: "Hungarian and English · on-site in Hungary, online elsewhere".

---

## 2. Recognise any of these? (`#problems`)

**Section number:** 01
**H2:** Where the hours go

**Intro:** The shop floor is often well organised. The work around it is not.
These three problems appear in almost every company I see.

### Problem card 1 — The weekly report
**Title:** The weekly report takes a day
**Text:** Someone exports data from two systems, copies it into Excel, checks it by hand and sends it.
Every week. When that person is on holiday, the report is late or wrong.

**Before:** Export → copy and paste → check by hand → fix errors → send
**After:** One agreed data source → automatic update → review of exceptions only

**Typical result:** {{DECIDE: show only after real proof exists, e.g. "6 hours a week → 30 minutes"}}

### Problem card 2 — The approval loop
**Title:** The order waits for three signatures
**Text:** A purchase request, a quote or a production change goes round by email. Nobody knows where it
is. The customer waits. The same questions are asked every time.

**Before:** Email → forward → "Who has it?" → reminder → approval → re-type into the system
**After:** One form with the right data → clear approval rules → automatic routing → status visible to all

### Problem card 3 — The AI idea
**Title:** "We should do something with AI"
**Text:** Everybody has an idea, but nobody knows which task is worth it. A tool is bought before the
process is clear. Six months later, nobody uses it.

**Before:** Buy a tool → try it on everything → little use → disappointment
**After:** List the tasks → measure time and errors → pick one task with a clear gain → test for 2 weeks → decide

**Closing line:** Sometimes the answer is a better checklist. Sometimes it is a custom tool.
We find out before anything is built.

---

## 3. Training & services (`#services`)

**Section number:** 02
**H2:** Ways to work together

**Intro:** Most clients start with a training or a half-day workshop. Both have a fixed price,
and both work on your real processes, not on textbook examples.

### Launch partner notice (box above the cards)
**Title:** Launch price for the first 5 partner companies
**Text:** I am building my reference list. The first 5 partner companies get the launch price.
In return, we publish the measured results together — anonymised if you prefer.
**Small text:** `{{FILL: X}}` of 5 places left.

### Card A — Training that pays for itself (featured)
**Label:** Most popular first step
**Title:** Team training
**Text:** A one-day, hands-on training for up to 12 people. Each team leaves with one real improvement to
make. After 30 days we meet online and measure the result.
**Topics (choose one):**
- Lean in the office: find and remove waste in admin work
- Practical problem solving: get to the root cause, not the first answer
- AI at work: safe, useful AI use for everyday tasks
**Price:** ~~490,000 Ft~~ **320,000 Ft** launch price · `{{DECIDE: "+ ÁFA" or "AAM"}}`
**CTA:** Plan a team training → `#contact` (pre-select "Training" in the form)

### Card B — Process discovery workshop
**Title:** Half-day workshop
**Text:** We map one process together, find where the time and errors go, and agree what to fix first.
You get a written summary with the three most valuable changes.
**Guarantee:** If we do not find at least `{{DECIDE: 10}}` hours of monthly saving, you do not pay.
**Price:** ~~190,000 Ft~~ **120,000 Ft** launch price. Credited in full if you continue.
**CTA:** Book a workshop → `#contact` (pre-select "Workshop")

### Card C — Improvement programme
**Title:** 6–8 week programme
**Text:** Three training days with team projects in between. Your people learn the method while they
improve real processes. At the end, you get a results report with the measured savings.
**Price:** from ~~1,390,000 Ft~~ **890,000 Ft** launch price
**CTA:** Discuss a programme → `#contact` (pre-select "Programme")

### Card D — Process Sprint and automation
**Title:** Done with you
**Text:** For one important process: baseline, fix, automate where it pays, measure the result.
2–4 weeks. Automation and AI tools are quoted after the sprint, when the process is stable.
**Price:** from ~~990,000 Ft~~ **690,000 Ft** launch price
**CTA:** Talk about a sprint → `#contact` (pre-select "Sprint")

**Line under the cards:** Not sure which one fits? Start with the free scorecard. It tells you where to
start. → `/scorecard`

---

## 4. How I work (`#method`)

**Section number:** 03
**H2:** Process first. Technology second.

**Intro:** Automating a bad process gives you a fast bad process. So the order is always the same.

1. **Find the friction (Lean).** Map the work as it really happens. Find the waiting, re-typing and rework.
2. **Make it reliable (Six Sigma).** Agree one standard. Measure it. Remove the causes of errors.
3. **Automate the routine (Automation).** Let software do the repetitive steps and handovers.
4. **Add AI with a purpose (AI).** Use AI where it removes real work, with clear data rules.

**Closing line:** Every step has a reason and a number behind it.

---

## 5. Proof (`#proof`) `[PROOF]`

Hide this whole section until at least 2 items are real. Content comes from `05-proof-plan.md`.

**Section number:** 04
**H2:** Results, not promises

**Intro:** Examples from my past work and from partner projects. Numbers are measured, not estimated.

**Card format (repeat 2–4 times):**
- **Title:** `{{FILL: e.g. "Month-end reporting in a shared service centre"}}`
- **Problem:** `{{FILL: one sentence}}`
- **What we did:** `{{FILL: one sentence}}`
- **Result:** `{{FILL: number, e.g. "3 days → 4 hours"}}`
- **Link:** Read the case → `/work/case-studies/{{slug}}`

**Extra row (optional):** Free tools I built → `/work/apps` · Templates I use → `/downloads`

**Testimonial slot (when available):**
> "`{{FILL: quote}}`"
> — `{{FILL: name, role, company}}`

---

## 6. The free scorecard (`#scorecard`)

**Section number:** 05
**H2:** Not sure where to start? Score one process.

**Text:** Pick one process you know well and answer 30 short questions. You get:
- six scores with short explanations
- three quick wins you can start next week
- the main risk to fix before you automate or use AI
- a 90-day roadmap

**Small text:** Free · 8 minutes · on screen and as PDF · no obligation to book
**CTA:** Start the scorecard → `/scorecard`
**Link:** See a sample report → `/scorecard/sample` `[PROOF]`

---

## 7. About (`#about`)

**Section number:** 06
**H2:** Hi, I'm `{{FILL: full name}}`.

**Photo:** `{{FILL: real photo, friendly, work setting}}`

**Text:**
I have spent `{{FILL: X}}` years in `{{FILL: e.g. operations, shared services and advisory}}` roles.
Most of that time I worked in the office processes that keep a company running: `{{FILL: e.g. reporting,
order handling, finance operations}}`. I saw the same thing everywhere: good people losing hours to
re-typing, chasing and checking.

So I learned to fix it. First with Lean and Six Sigma, then with automation, and now with AI.
I am a Lean Six Sigma Green Belt, and I build the automations and tools myself.

I work in Hungarian and English, on-site in Hungary and online anywhere.

**Career timeline (short):**
| Years | Role | One result |
| --- | --- | --- |
| `{{FILL}}` | `{{FILL}}` | `{{FILL}}` |
| `{{FILL}}` | `{{FILL}}` | `{{FILL}}` |
| `{{FILL}}` | `{{FILL}}` | `{{FILL}}` |

**Links:** LinkedIn → `{{FILL: URL}}` · Green Belt certificate → `{{FILL: URL if available}}`

---

## 8. What happens next (`#next`)

**H2:** What happens after you get in touch

1. **You send a short message or book a call.** I reply within one working day.
2. **20-minute call.** We talk about one process or training need. No sales pitch.
3. **Written proposal.** Scope, date and fixed price, within 2 working days.
4. **We start.** Usually within 2–3 weeks.

---

## 9. FAQ (`#faq`)

**H2:** Before we start

**Do my people need to know Lean Six Sigma?**
No. I explain everything in plain language, using your own processes.

**We are not a factory. Is this for us?**
Yes. Reports, approvals, handovers and re-typing look the same in an office, a warehouse or a
service company. The examples change; the method does not.

**Why is there a launch price?**
I am building my reference list. The first 5 partners pay less. In return, we publish the measured
results together. You decide if your company name appears.

**What if the workshop finds nothing?**
If we do not find at least `{{DECIDE: 10}}` hours of monthly saving, you do not pay for the workshop.

**Can we start with one small problem?**
Yes. That is the best way to start. One process, one clear result.

**Which tools do you use?**
The tool follows the process, your systems and your IT rules. Often it is what you already have
(Excel, Microsoft 365, Google Workspace). `{{FILL: tools you use, e.g. Power Automate, Make, n8n}}`

**What about our data?**
We agree the data rules before any work starts. The scorecard asks about the process only. It does not
need customer records or personal data.

**Do you work outside Hungary?**
Yes, online, in English or Hungarian.

**Is the training registered as adult training?**
`{{FILL: answer after registration, see 07-legal-checklist.md — e.g. "Yes. Registration number: B/2026/XXXXXX"}}`

---

## 10. Contact (`#contact`)

**H2:** Tell me what takes too long.

**Text:** One task, one report, one handover — that is enough to start. I reply within one working day.

**Form (3 visible fields + 1 choice):**
- Name *(required)*
- Work email *(required)*
- What takes too long? *(required, textarea, placeholder: "e.g. Our weekly production report takes a full day to build.")*
- I'm interested in: Training · Workshop · Programme · Sprint · Not sure yet *(optional, radio)*
- Checkbox *(required)*: I have read the [privacy notice](/privacy).
- Button: **Send message**
- Success message: "Thank you. I will reply within one working day. — {{FILL: first name}}"

**Next to the form:**
- Prefer to talk? **Book a 20-minute call** → `{{FILL: booking link}}`
- Email: hello@grismont.hu
- Or start with the **free scorecard** → `/scorecard`

---

## 11. Footer

**Tagline:** Process improvement. Training. Automation. AI. With a reason for every step.

**Columns:**
- Services: Team training · Workshop · Programme · Process Sprint
- Resources: Free scorecard · Case studies `[PROOF]` · Free tools `[PROOF]` · Templates `[PROOF]`
- Company: About · Contact · Impressum · Privacy · Cookies

**Rule:** Do not show "Coming soon" links. Show a link only when its page has content.

**Bottom line:** © 2026 `{{FILL: full legal name}}` egyéni vállalkozó · Grismont · hello@grismont.hu
