# Process Excellence Snapshot: Questionnaire & Scoring Model

**Product:** Process Excellence Snapshot (paid diagnostic, USD 300)
**Completion time:** 7–8 minutes (44 items: 41 multiple-choice + 3 short free-text)
**Scope:** Works for any industry and process type (office/transactional, service, manufacturing, logistics, IT, compliance)
**Report engine:** Fully rule-based. Every score, flag, recommendation, and roadmap item comes from deterministic rules in this document and in `02-report-variables-and-content.md`.
**Frameworks behind it:** Lean (TIMWOODS waste, flow, standard work, visual management, Runner/Repeater/Stranger), Six Sigma (DMAIC readiness, VOC/CTQ, first pass yield, root cause), CMMI/BPM maturity levels, ISO 9001 process-approach principles (ownership, documented information, monitoring, corrective action), and current automation/AI readiness practice (RPA, iPaaS, IDP, GenAI, agentic AI, process mining).

---

## 0. Design principles (why this is not a generic survey)

1. **Answer options describe behaviour, not opinions.** Respondents choose what *actually happens* ("Someone checks afterwards"), never a 1–5 agreement scale. This cuts optimism bias and makes scores defensible.
2. **"Don't know" is information.** Where it matters, "Don't know" is an explicit option. It scores 0 and is reported as a visibility gap. Not knowing your rework rate *is* the finding.
3. **No compensation between dimensions.** Strong reporting cannot hide missing standard work. Maturity *gates* cap the overall level (Section 5.5), the same way an auditor would.
4. **Consistency checks.** Ten built-in contradiction tests (Section 5.13) show where the answers don't match each other, e.g. "we have a current SOP" alongside "everyone does it differently". This is what makes the report feel like an audit, not a self-assessment.
5. **Automation readiness is scored separately from maturity.** A judgment-heavy process is not "immature". It simply needs a different technology path. This keeps the report from pushing RPA onto everything.
6. **Sequencing is enforced.** Roadmap rules follow *stabilise → standardise → measure → improve → automate*. The engine won't recommend an automation pilot for a process that fails the readiness gate.
7. **Every recommendation has an owner, a horizon, and a "done when".** No "consider improving communication".

---

## 1. Structure at a glance

| Section | Code | Items | Scored? | Approx. time |
|---|---|---|---|---|
| Process profile | P | 11 (3 free-text) | No (context, classification, personalisation) | 2:00 |
| Ownership & Governance | A / `GOV` | 4 | Yes (maturity) | 0:40 |
| Standardisation & Documentation | B / `STD` | 4 | Yes (maturity) | 0:40 |
| Measurement & Reporting | C / `MEA` | 4 | Yes (maturity) | 0:40 |
| Flow & Waste | D / `FLW` | 4 | Yes (maturity) | 0:45 |
| Quality & Control | E / `QUA` | 4 | Yes (maturity) | 0:40 |
| Data & Systems | F / `DAT` | 4 | Yes (maturity) | 0:40 |
| Automation & AI Readiness | G / `AUT` | 5 | Yes (readiness index, separate) | 0:50 |
| People & Improvement Culture | H / `CUL` | 4 | Yes (maturity) | 0:40 |
| **Total** | | **44** | **33 scored** | **~7:35** |

**Form rules**
- Every item except P11 is mandatory.
- Options are always listed from weakest to strongest (fast scanning; behavioural wording handles bias). "Don't know" always comes last.
- Show a progress bar with section names.
- The Grismont implementation uses the existing one-question card flow at every viewport, with the nine named sections represented in the segmented progress bar. This keeps the audit's keyboard-first interaction consistent with the Discovery Scorecard.
- Store the **numeric code** of each answer, not the label. The variables are named exactly as the item IDs below.

---

## 2. Intro screen (copy for the form)

> **Process Excellence Snapshot**
> Pick **one process** (e.g. "supplier invoice processing", "new-hire onboarding", "line changeover", "customer refund handling") and answer for **how it has really run over the last 3 months**, not how it should run or how it is written down.
> It takes about 8 minutes. There are no right answers. An honest "Don't know" gives a more accurate report than a guess.
> **You'll receive:** your maturity level against best practice, the critical risks an auditor would flag, where your answers contradict each other, an automation and AI verdict (what to automate, with which kind of tool, and when), a KPI set for your type of process, and a prioritised 90-day roadmap with step-by-step playbooks, ready-to-use templates, and your projected score after 90 days.

---

## 3. Section P: Process profile (not scored)

These items drive classification, KPI selection, priority weighting, and personalisation.

**P1. Which process are you assessing, and what does it deliver?** · `P1_process` · free text, max 150 characters
> Placeholder: *"Supplier invoice processing: from invoice received to payment approved."*

**P2. Which category fits best?** · `P2_category`
- 1 Finance & accounting (order-to-cash, procure-to-pay, record-to-report, payroll)
- 2 HR & people (hiring, onboarding, HR requests, offboarding)
- 3 Customer service & support
- 4 Production & manufacturing
- 5 Logistics, warehouse & supply chain
- 6 Quality, compliance & risk
- 7 IT & service management
- 8 Sales & marketing operations
- 9 Product / project delivery
- 10 Healthcare & clinical administration
- 11 Other

**P3. How many times does this process run per month (cases, orders, tickets, batches, requests)?** · `P3_volume`
- 1 Fewer than 20 · 2 20–200 · 3 200–1,000 · 4 1,000–10,000 · 5 More than 10,000

**P4. On average, how much hands-on working time does one case take, adding up everyone involved (not waiting time)?** · `P4_effort`
- 1 Under 5 minutes · 2 5–30 minutes · 3 30 minutes–2 hours · 4 2 hours–1 day · 5 More than 1 day

**P5. Who is involved in performing it?** · `P5_people`
- 1 One person
- 2 2–5 people in one team
- 3 Several people across 2–3 teams
- 4 4 or more teams/departments
- 5 Multiple teams plus external parties (suppliers, customers, outsourcers)

**P6. How many software systems/tools are used to complete one case (including email and spreadsheets)?** · `P6_systems`
- 1 None (paper/verbal) · 2 One · 3 2–3 · 4 4–5 · 5 6 or more

**P7. If this process stopped for one week, what would happen?** · `P7_criticality`
- 1 Minor inconvenience
- 2 Internal delays and extra work
- 3 Customers would notice (delays, complaints)
- 4 Direct revenue loss or regulatory/contractual breach
- 5 Business-critical: serious financial, safety, or legal consequences

**P8. What is the #1 outcome you want from improving this process?** · `P8_goal`
- 1 Less effort / lower cost to run
- 2 Faster turnaround / shorter lead time
- 3 Fewer errors / higher quality
- 4 Ability to scale volume without adding people
- 5 Stronger control / compliance / audit-readiness
- 6 Better customer or employee experience

**P9. What is your role in this process?** · `P9_role`
- 1 I perform it hands-on
- 2 I'm the team lead / supervisor
- 3 I'm the process owner / department manager
- 4 Senior leadership / executive
- 5 External advisor / consultant / internal CI function

**P10. What is the single biggest problem with this process today?** · `P10_pain` · free text, max 300 characters
> Placeholder: *"Invoices sit in inboxes for days and we pay late fees."*

**P11. What has already been tried to fix it, and what happened? (optional)** · `P11_tried` · free text, max 300 characters
> Placeholder: *"Bought an OCR tool last year, but half the invoices still need manual entry."*

---

## 4. Scored sections

Notation: each option shows its **points (0–4)**. `DK` = "Don't know" (scores 0 and sets the item's `_dk` flag to 1). "Feeds" lists where the item is used beyond its own dimension score.

### Section A: Ownership & Governance (`GOV`)

**A1. Is one named person accountable for this process end-to-end, from trigger to final output?** · `A1`
- 0 — No one / it's unclear
- 1 — Several people share it informally
- 2 — Each department owns its own part; nobody owns the whole
- 3 — A named owner exists but has limited authority to change it
- 4 — A named owner with authority to change it, and process performance is in their objectives

Feeds: RF2, Automation gate, AI gate, DMAIC gate

**A2. Are roles defined: who does each step, who approves, who must be consulted?** · `A2`
- 0 — Not defined; people work it out case by case
- 1 — Known informally ("everybody knows")
- 2 — Partly documented
- 3 — Documented (e.g. a responsibility chart) and mostly followed
- 4 — Documented, followed, and updated whenever the process changes

Feeds: RF6

**A3. How often is this process's performance formally reviewed?** · `A3`
- 0 — Never, or only when something goes badly wrong
- 1 — Occasionally / once a year
- 2 — Quarterly
- 3 — Monthly, with actions agreed
- 4 — Weekly or continuously, with actions tracked to closure

Feeds: X3

**A4. When a problem or exception occurs, how does it get resolved?** · `A4`
- 0 — No defined path; it depends who you know
- 1 — It goes to a manager, but handling is inconsistent
- 2 — A defined path exists but is slow or often bypassed
- 3 — Defined escalation path with agreed response times
- 4 — Defined and timed, and recurring issues automatically trigger root-cause analysis

---

### Section B: Standardisation & Documentation (`STD`)

**B1. How is the process documented?** · `B1`
- 0 — Not documented; it lives in people's heads
- 1 — Scattered notes, emails, personal files
- 2 — Documented, but outdated (>12 months) or incomplete
- 3 — Current SOP/work instruction or process map
- 4 — Current SOP *and* process map, version-controlled, available where the work is done

Feeds: RF6, X1, Automation gate

**B2. If two different people perform this process, how similar is the way they do it?** · `B2`
- 0 — Very different; everyone has their own way
- 1 — Same end result, but different methods and steps
- 2 — Mostly similar, with notable differences
- 3 — Nearly identical, with minor variations
- 4 — Identical; standard work is built into a checklist or system
- DK — Don't know (0)

Feeds: ARI, RF5, X1, Archetype, Automation gate

**B3. How long until a new, capable person can perform the process independently?** · `B3`
- 0 — More than 3 months, or only a specific expert can do it
- 1 — 1–3 months
- 2 — 2–4 weeks
- 3 — 1–2 weeks
- 4 — Under 1 week, using structured training material

Feeds: X6

**B4. If the most experienced person left tomorrow, what would happen?** · `B4`
- 0 — The process would stop
- 1 — Severe disruption for weeks
- 2 — Noticeable disruption for days
- 3 — Minor disruption; others are trained
- 4 — No impact; tasks are cross-trained and documented

Feeds: RF1, X6

---

### Section C: Measurement & Reporting (`MEA`)

**C1. Which best describes the KPIs for this process?** · `C1`
- 0 — There are no KPIs
- 1 — We only count activity (e.g. number processed)
- 2 — Some KPIs exist, but without targets
- 3 — KPIs with targets covering at least speed, quality, and volume
- 4 — Balanced KPIs with targets, linked to customer/business outcomes, including leading indicators

Feeds: RF3, X2, X8, AI gate, DMAIC gate, Dashboard gate

**C2. Do you know the end-to-end lead time (from request/trigger to completion)?** · `C2`
- 0 — No idea
- 1 — A rough guess
- 2 — Estimated from occasional sampling
- 3 — Measured regularly
- 4 — Measured automatically, including how much it varies (typical case *and* slowest cases), not just the average

Feeds: RF3, X2, Automation gate, DMAIC gate, PW-PM

**C3. How is reporting for this process produced?** · `C3`
- 0 — There is no reporting
- 1 — Manually compiled in spreadsheets each time
- 2 — Manually, but using a standard template
- 3 — Semi-automated (system exports feeding a refreshable report)
- 4 — Fully automated, live dashboard from system data

Feeds: X8, PW-BI

**C4. What happens when a KPI goes off target?** · `C4`
- 0 — Nobody notices, or there are no targets
- 1 — It's discussed but rarely acted on
- 2 — Someone takes action ad hoc
- 3 — Actions are assigned to owners and tracked
- 4 — Structured response: find the root cause, fix it, then check that the fix worked

Feeds: X3

---

### Section D: Flow & Waste (`FLW`)

**D1. How many times does the work change hands (between people, teams, or systems) from start to finish?** · `D1`
- 0 — More than 10
- 1 — 7–10
- 2 — 4–6
- 3 — 2–3
- 4 — 0–1
- DK — Don't know (0)

Feeds: Waste-Transport, PW-WF, PW-PM

**D2. Of the total elapsed time, roughly how much is the case *waiting* (in queues, for approvals, for information) rather than being worked on?** · `D2`
- 1 — Over 90% waiting
- 2 — 70–90% waiting
- 3 — 50–70% waiting
- 4 — Under 50% waiting
- DK — Don't know (0)

> Help text: "If a case takes 5 days to complete but only 2 hours of actual work, it is ~95% waiting."
> Note: the best answer is 4, and DK scores 0. Typical transactional processes land on 1 or 2. That is normal and is the improvement opportunity.

Feeds: Waste-Waiting, RF8

**D3. What share of cases must be corrected, redone, or sent back at some point?** · `D3`
- 0 — More than 25%
- 1 — 10–25%
- 2 — 5–10%
- 3 — 1–5%
- 4 — Under 1%
- DK — Don't know (0)

Feeds: Waste-Defects, RF4, RF7, X5

**D4. How are approvals/sign-offs handled?** · `D4`
- 0 — 3 or more approvals for every case, regardless of value or risk
- 1 — 2 approvals for every case
- 2 — 1–2 approvals; some cases skip based on judgment
- 3 — Approvals required only above defined thresholds (value/risk)
- 4 — Risk-based: low-risk cases auto-approved, or no approval needed by design

Feeds: Waste-Over-processing, RF8, PW-WF

---

### Section E: Quality & Control (`QUA`)

**E1. Do you know the error/defect rate (mistakes that reach the next step or the customer)?** · `E1`
- 0 — No
- 1 — Only anecdotally (from complaints)
- 2 — Estimated
- 3 — Measured periodically
- 4 — Measured continuously, tracked over time, and broken down by type of error

Feeds: DMAIC gate, AI gate

**E2. How are errors mainly prevented?** · `E2`
- 0 — We rely on people being careful
- 1 — Someone checks afterwards (manual inspection / four-eyes)
- 2 — Checklists are used during the work
- 3 — System validations block common errors (mandatory fields, dropdowns, rules)
- 4 — Error-proofing designed in (errors are impossible or detected automatically at source)

Feeds: Waste-Defects, RF4, X5

**E3. When a significant error happens, what typically follows?** · `E3`
- 0 — Fix it and move on
- 1 — Fix it and warn/blame the person
- 2 — Informal discussion of why it happened
- 3 — A structured search for the root cause (e.g. "5 Whys") for significant errors
- 4 — Root cause found, the fix *and* steps to stop it recurring are tracked, checked that they worked, and lessons shared

Feeds: RF6, RF7

**E4. How are the needs of this process's customer (internal or external) captured?** · `E4`
- 0 — They're not; we assume
- 1 — Only through complaints
- 2 — Occasional informal feedback
- 3 — Requirements or service levels (e.g. "within 2 working days") are defined and agreed
- 4 — Agreed service levels plus regular structured feedback (e.g. short surveys) that leads to changes

---

### Section F: Data & Systems (`DAT`)

**F1. How does the input for this process usually arrive?** (choose the most common) · `F1`
- 0 — Verbally, by phone, or on paper
- 1 — Unstructured emails/attachments in varying formats
- 2 — Semi-structured documents (standard templates, PDFs, spreadsheets)
- 3 — Structured digital form or portal
- 4 — Directly from another system, without anyone typing it in

Feeds: ARI, PW-IDP, PW-GENAI, PW-BI eligibility, AI gate

**F2. How reliable is the data used in this process?** · `F2`
- 0 — Frequently wrong or incomplete; constant chasing
- 1 — Often needs checking or correcting
- 2 — Generally OK, with known recurring issues
- 3 — Reliable; issues are rare
- 4 — Reliable, with a data owner and validation rules for key fields

Feeds: ARI, Waste-Motion, PW-BI, Automation gate, AI gate, Dashboard gate

**F3. How often is the same data typed or copy-pasted manually from one system/document into another?** · `F3`
- 0 — Constantly; it's a core part of the job
- 1 — Frequently
- 2 — Sometimes
- 3 — Rarely
- 4 — Never; systems are integrated

Feeds: AOS, Waste-Transport, X4, PW-INT, PW-RPA

**F4. How much does the process rely on workarounds (side spreadsheets, personal trackers, email chasing)?** · `F4`
- 0 — Constantly; the workarounds *are* the process
- 1 — Frequently
- 2 — Sometimes
- 3 — Rarely
- 4 — Never; the system supports the full flow

Feeds: Waste-Over-processing, PW-WF

---

### Section G: Automation & AI Readiness (`AUT`). Scored as a separate index, not part of maturity.

> Intro line on screen: *"These questions assess what kind of automation or AI fits this process. A process that needs human judgment isn't a bad process."*

**G1. Roughly what share of the steps follow clear rules ("if X, then do Y") versus needing human judgment?** · `G1`
- 0 — Mostly judgment (over 70% judgment)
- 1 — More judgment than rules
- 2 — About half and half
- 3 — Mostly rules (70–90%)
- 4 — Almost entirely rules (over 90%)

Feeds: ARI, PW-RPA, PW-GENAI

**G2. How often do the process rules, forms, or systems change?** · `G2`
- 0 — Constantly (monthly or more often)
- 1 — Every quarter
- 2 — About twice a year
- 3 — About once a year
- 4 — Stable for more than a year

Feeds: ARI, PW-RPA, Automation gate

**G3. What share of cases are exceptions that don't follow the standard path?** · `G3`
- 0 — More than 40%
- 1 — 25–40%
- 2 — 10–25%
- 3 — 5–10%
- 4 — Under 5%
- DK — Don't know (0)

Feeds: ARI, RF5, Archetype, Automation gate

**G4. How much of the process is automated today?** · `G4`
- 0 — Fully manual
- 1 — Personal shortcuts only (templates, macros, saved searches)
- 2 — Some automated steps (notifications, simple workflows, scripts)
- 3 — Major steps automated; people handle exceptions
- 4 — End-to-end automated with monitoring; people handle exceptions only

Feeds: AOS, Waste-Talent, X4

**G5. Which best describes your organisation's readiness to implement automation/AI for this process?** · `G5`
- 0 — No IT support, no AI policy, little appetite
- 1 — Interest exists, but no tools, budget, or support
- 2 — Tools are available (e.g. Power Automate, Zapier, Copilot/ChatGPT licences), but there is no governance
- 3 — Tools, IT support, and a basic data/AI usage policy are in place
- 4 — A dedicated automation/AI team or clear rules, approved tools, and automations already delivered successfully

Feeds: ARI, PW-AGENT, Automation gate, AI gate

---

### Section H: People & Improvement Culture (`CUL`)

**H1. How do improvements to this process usually happen?** · `H1`
- 0 — They don't, or only after something breaks
- 1 — Occasionally, by individuals on their own initiative
- 2 — Through periodic management-driven projects
- 3 — A regular improvement routine involving the team (e.g. a monthly improvement meeting)
- 4 — A continuous system: ideas collected, tested, results measured, and the better way made the new standard

**H2. Do the people doing the work suggest and implement improvements?** · `H2`
- 0 — No; it's not expected, or ideas aren't listened to
- 1 — Rarely; ideas get lost
- 2 — Sometimes, if their manager supports it
- 3 — Regularly; there's a channel and people get feedback
- 4 — Expected and empowered; small changes are made without escalation

Feeds: Waste-Talent, X7

**H3. What improvement skills exist in the team (Lean, Six Sigma, process mapping, automation)?** · `H3`
- 0 — None
- 1 — General awareness only
- 2 — One or two people trained
- 3 — Formally trained people (e.g. Lean Six Sigma Green Belt) actively using the methods
- 4 — An in-house expert or coach, plus people who can build automations themselves

Feeds: DMAIC gate

**H4. Realistically, how much time can the team dedicate to improving this process?** · `H4`
- 0 — None; we're firefighting all the time
- 1 — Very little; the team is overloaded
- 2 — Some, if it's prioritised
- 3 — Dedicated time is agreed (e.g. a few hours per week)
- 4 — Protected time and budget for improvement

Feeds: RF7, X7, DMAIC gate

---

## 4b. Closing screen

> Thank you. Your report is being generated and will arrive at **{{email}}** within {{delivery_sla}}.
> Tip: for the most accurate picture, have one person who *performs* the process and one who *manages* it each complete the assessment. Differences between their answers are often the most valuable insight.

---

## 5. Scoring model

### 5.1 Item scoring

- Every scored item returns an integer 0–4.
- `DK` returns 0 and sets `<item>_dk = 1` (items with an explicit DK option: B2, D1, D2, D3, G3).
- C2's "No idea" is an ordinary score-0 answer, not an explicit DK response.
- `dk_count` = sum of all `_dk` flags (0–5).

### 5.2 Dimension scores (0–100)

```
S_dim = ( sum of item points in dimension ) / ( 4 × number of items ) × 100
```

| Variable | Items | n |
|---|---|---|
| `S_GOV` | A1–A4 | 4 |
| `S_STD` | B1–B4 | 4 |
| `S_MEA` | C1–C4 | 4 |
| `S_FLW` | D1–D4 | 4 |
| `S_QUA` | E1–E4 | 4 |
| `S_DAT` | F1–F4 | 4 |
| `S_CUL` | H1–H4 | 4 |
| `S_AUT` | G1–G5 | 5 (displayed only; the readiness logic uses ARI) |

Round to one decimal for calculation and to a whole number for display.

### 5.3 Dimension bands

| Band | Score | Code | Colour |
|---|---|---|---|
| Critical | 0–39 | `CRIT` | Red |
| Developing | 40–59 | `DEV` | Amber |
| Established | 60–79 | `EST` | Light green |
| Leading | 80–100 | `LEAD` | Green |

### 5.4 Process Maturity Index (PMI)

Weighted average of the seven maturity dimensions. Automation readiness is **excluded**, because readiness is not maturity.

| Dimension | Weight | Rationale |
|---|---|---|
| GOV | 15% | Without ownership, no improvement sticks |
| STD | 20% | Standard work is the base for all Lean/Six Sigma/automation |
| MEA | 15% | You can't manage what you don't measure |
| FLW | 15% | Flow is where most lead time and effort are lost |
| QUA | 15% | Cost of poor quality and customer impact |
| DAT | 10% | Enabler for reporting and automation |
| CUL | 10% | Sustains the gains |

```
PMI_raw = 0.15·S_GOV + 0.20·S_STD + 0.15·S_MEA + 0.15·S_FLW + 0.15·S_QUA + 0.10·S_DAT + 0.10·S_CUL
```

### 5.5 Maturity level and gates

**Step 1: raw level from PMI_raw**

| Level | PMI_raw | Name | One-line meaning |
|---|---|---|---|
| L1 | 0–24.9 | Initial | Outcomes depend on individuals and luck |
| L2 | 25–44.9 | Reactive | Repeatable on a good day; managed by firefighting |
| L3 | 45–64.9 | Defined | Standardised and documented; performance partly visible |
| L4 | 65–84.9 | Managed | Measured, controlled, managed by data |
| L5 | 85–100 | Optimising | Continuously improved, automated where it pays, best practice |

**Step 2: apply gates (cap the level; the lowest cap wins)**

| Gate | Condition | Max level | Reason shown in report |
|---|---|---|---|
| G-STD | `S_STD < 40` | L2 | "A process without standard work cannot be rated as Defined." |
| G-GOV | `S_GOV < 50` | L3 | "Managed maturity requires clear ownership and governance." |
| G-MEA | `S_MEA < 50` | L3 | "Managed maturity requires measured performance." |
| G-RF | Any of RF1, RF3, RF6 active | L3 | "Critical risk present (see Critical Findings)." |
| G-OPT | `S_MEA < 70` or `S_CUL < 70` | L4 | "Optimising requires strong measurement and an embedded improvement culture." |

Outputs: `PMI_raw`, `level_raw`, `level_final`, `level_capped` (true/false), `cap_reasons[]`.

### 5.6 Automation Readiness Index (ARI)

How safely and effectively this process can be automated *now*.

| Component | Item | Weight |
|---|---|---|
| Rule-based share | G1 | 20% |
| Stability | G2 | 15% |
| Exception rate | G3 | 15% |
| Execution consistency | B2 | 15% |
| Organisational readiness | G5 | 15% |
| Input structure | F1 | 10% |
| Data quality | F2 | 10% |

```
ARI = Σ ( weight × item_points / 4 × 100 )
```

| ARI band | Range | Code |
|---|---|---|
| Not ready | 0–39 | `ARI_NR` |
| Foundations needed | 40–54 | `ARI_FN` |
| Ready for targeted automation | 55–74 | `ARI_RT` |
| Ready to scale | 75–100 | `ARI_RS` |

### 5.7 Workload and Automation Opportunity Score (AOS)

The report shows **no money figures**. Workload is a capacity indicator (hours), used to size the opportunity.

Midpoints:

| P3 code | Volume midpoint (cases/month) | P4 code | Effort midpoint (minutes) |
|---|---|---|---|
| 1 | 10 | 1 | 3 |
| 2 | 100 | 2 | 15 |
| 3 | 500 | 3 | 60 |
| 4 | 4,000 | 4 | 240 |
| 5 | 15,000 | 5 | 600 |

```
workload_hours = volume_mid × effort_mid / 60          (hands-on hours per month)
workload_fte   = workload_hours / 140                  (140 productive hours per FTE-month)
```

| Workload band | Hours/month | `workload_pts` |
|---|---|---|
| Low | < 20 | 0 |
| Medium | 20–79 | 40 |
| High | 80–399 | 70 |
| Very high | ≥ 400 | 100 |

```
AOS = 0.50 · workload_pts
    + 0.25 · (4 − F3) / 4 × 100        (manual re-keying = automation fuel)
    + 0.25 · (4 − G4) / 4 × 100        (headroom: how much is still manual)
```

`show_capacity_estimate` (config, default `true`): when true, the report shows the hours and FTE figures, labelled "order-of-magnitude estimate from banded answers".

### 5.8 Automation decision quadrant

| | AOS ≥ 50 (high opportunity) | AOS < 50 (low opportunity) |
|---|---|---|
| **ARI ≥ 55 (ready)** | `Q1` **Automate now** | `Q3` **Quick wins with low-code / personal automation** |
| **ARI < 55 (not ready)** | `Q2` **Fix, then automate** | `Q4` **Improve manually; not an automation priority** |

### 5.9 Process archetype (Lean: Runner / Repeater / Stranger)

| Archetype | Rule (evaluate in order) |
|---|---|
| `RUNNER` | `P3_volume ≥ 3` AND `G3 ≥ 3` AND `B2 ≥ 2` |
| `STRANGER` | `P3_volume = 1` OR `G3 ≤ 1` |
| `REPEATER` | Everything else |

### 5.10 Lean waste profile (6 of the 8 TIMWOODS/DOWNTIME wastes)

```
waste_intensity = 100 − ( mean of mapped item points / 4 × 100 )
```

| Waste | Variable | Mapped items |
|---|---|---|
| Waiting | `W_WAIT` | D2 |
| Defects | `W_DEF` | D3, E2 |
| Over-processing | `W_OVP` | D4, F4 |
| Transport (handoffs & data movement) | `W_TRA` | D1, F3 |
| Motion (searching, chasing, system switching) | `W_MOT` | F2, `P6_pts` |
| Non-utilised talent | `W_TAL` | H2, G4 |

`P6_pts` conversion: P6=1 → 2, P6=2 → 4, P6=3 → 3, P6=4 → 1, P6=5 → 0.

- Rank wastes by intensity (descending). Tie-break order: DEF > WAIT > TRA > OVP > TAL > MOT.
- `waste_top3[]` = top three. A waste is "significant" if intensity ≥ 50.
- Inventory and Overproduction are not assessed (the report says so explicitly).

### 5.11 Readiness gates (pass/fail checklists)

Each criterion is pass (✔) or fail (✘). The report shows the full checklist with the client's own result on each line.

**Automation Go/No-Go** (`gate_auto`)

| # | Criterion | Pass if |
|---|---|---|
| 1 | Process executed consistently | B2 ≥ 3 |
| 2 | Current documentation exists | B1 ≥ 3 |
| 3 | Rules are stable | G2 ≥ 2 |
| 4 | Exceptions under 25% | G3 ≥ 2 |
| 5 | Data good enough to automate on | F2 ≥ 2 |
| 6 | Baseline lead time known | C2 ≥ 2 |
| 7 | Accountable owner | A1 ≥ 3 |
| 8 | Tools/IT support available | G5 ≥ 2 |

Result: `GO` = 8/8 · `CONDITIONAL` = 6–7 passes AND criteria 1, 3, 4 all pass · `NO-GO` = otherwise.

**GenAI / AI-assist readiness** (`gate_ai`)

| # | Criterion | Pass if |
|---|---|---|
| 1 | Approved AI tools and usage policy | G5 ≥ 3 |
| 2 | Inputs are digital | F1 ≥ 1 |
| 3 | Data reliability acceptable | F2 ≥ 2 |
| 4 | Quality criteria defined (to judge AI output) | E1 ≥ 2 OR C1 ≥ 2 |
| 5 | Accountable owner | A1 ≥ 3 |

Result: `READY` = 5/5 · `PILOT-ONLY` = 3–4 AND criterion 2 passes · `NOT-READY` = otherwise.
Modifier: if `P7_criticality ≥ 4`, the report requires a human-in-the-loop design regardless of result.

**Data-driven improvement (DMAIC project) readiness** (`gate_dmaic`)

| # | Criterion | Pass if |
|---|---|---|
| 1 | KPIs defined | C1 ≥ 2 |
| 2 | Lead time measurable | C2 ≥ 2 |
| 3 | Error data available | E1 ≥ 2 |
| 4 | Owner/sponsor | A1 ≥ 3 |
| 5 | Team capacity | H4 ≥ 2 |
| 6 | Method skills | H3 ≥ 2 |

Result: `READY` = 6/6 · `READY-WITH-SUPPORT` = 4–5 · `NOT-READY` = ≤3.

**Live dashboard readiness** (`gate_dash`)

| # | Criterion | Pass if |
|---|---|---|
| 1 | KPIs defined | C1 ≥ 2 |
| 2 | Inputs captured in systems | F1 ≥ 2 |
| 3 | Data reliable | F2 ≥ 2 |
| 4 | Someone acts on the numbers | C4 ≥ 2 |

Result: `READY` = 4/4 · `PARTIAL` = 2–3 · `NOT-READY` = ≤1.

### 5.12 Critical findings (red flags)

Ordered by severity. `flags_red[]` keeps this order.

| ID | Name | Trigger | Linked primary action |
|---|---|---|---|
| RF6 | Control & compliance exposure | `P7 ≥ 4` AND (`B1 ≤ 1` OR `A2 ≤ 1` OR `E3 ≤ 1`) | ACT-GOV-02 |
| RF1 | Single point of failure | `B4 ≤ 1` | ACT-STD-03 |
| RF4 | Quality leakage | `D3 ≤ 1` (incl. DK) OR (`E2 = 0` AND `P7 ≥ 3`) | ACT-FLW-04 |
| RF2 | Orphan process | `A1 ≤ 1` | ACT-GOV-01 |
| RF3 | Flying blind | `C1 ≤ 1` AND `C2 ≤ 1` | ACT-MEA-02 |
| RF5 | Automation trap | `S_STD < 40` OR (`B2 ≤ 1` AND `G3 ≤ 1`) | ACT-STD-02 |
| RF7 | Firefighting loop | `H4 = 0` AND (`D3 ≤ 1` OR `E3 ≤ 1`) | ACT-CUL-04 |
| RF8 | Approval bottleneck | `D4 ≤ 1` AND `D2 ≤ 2` | ACT-FLW-03 |

### 5.13 Consistency checks (audit-style contradiction tests)

| ID | Name | Trigger |
|---|---|---|
| X1 | Documentation–reality gap | `B1 ≥ 3` AND `B2 ≤ 1` |
| X2 | Targets without visibility | `C1 ≥ 3` AND `C2 ≤ 1` |
| X3 | Review theatre | `A3 ≥ 3` AND `C4 ≤ 1` |
| X4 | Automation islands | `G4 ≥ 3` AND `F3 ≤ 1` |
| X5 | Ineffective controls | `E2 ≥ 3` AND `D3 ≤ 1` (excluding D3 = DK) |
| X6 | Hidden expertise | `B3 ≥ 3` AND `B4 ≤ 1` |
| X7 | Willing but no capacity | `H2 ≥ 3` AND `H4 ≤ 1` |
| X8 | Data without decisions | `C3 ≥ 3` AND `C1 ≤ 1` |
| X9 | Unverified flow claim | `D2 ≥ 3` AND `C2 ≤ 1` |
| X10 | Ungoverned automation | `G4 ≥ 3` AND `G5 ≤ 1` |

`cx_count` = number of triggered checks.

### 5.14 Confidence rating

| Confidence | Rule |
|---|---|
| High | `dk_count ≤ 1` AND `cx_count = 0` |
| Medium | `dk_count ≤ 3` AND `cx_count ≤ 2` (and not High) |
| Low | Otherwise |

Role note (`role_note`): if `P9_role ∈ {3,4}` add the "senior-view bias" note. If `P9_role = 1` add the "front-line view" note. If `P9_role = 5` add no note.

### 5.15 Priority ranking of dimensions

```
priority_dim = (100 − S_dim) × weight_dim × goal_mult_dim × foundation_mult_dim
```

- `weight_dim`: PMI weights from 5.4.
- `foundation_mult_dim` = 1.2 for GOV, STD, MEA when their score < 50; otherwise 1.0 (prerequisites come first).
- `goal_mult_dim` from P8 (default 1.0):

| P8 goal | ×1.5 | ×1.25 |
|---|---|---|
| 1 Less effort/cost | FLW | DAT, STD |
| 2 Faster turnaround | FLW | GOV, MEA |
| 3 Fewer errors | QUA | STD, DAT |
| 4 Scale | STD | DAT, MEA |
| 5 Control/compliance | GOV | QUA, STD |
| 6 Experience | CUL | QUA, FLW |

Outputs: `priority_rank[]` (7 dimensions, descending) and `top3_dims[]`.
Tie-break: lower dimension score first, then the PMI weight order (STD, GOV, MEA, FLW, QUA, DAT, CUL).

### 5.16 Automation & AI pathways

Evaluate all triggers. Display order is fixed (top to bottom). The report details the first three triggered pathways and lists the rest.

| Order | ID | Pathway | Trigger |
|---|---|---|---|
| 1 | PW-STD | Standardise before automating | `S_STD < 50` OR `B2 ≤ 1` |
| 2 | PW-PM | Process/task mining for discovery | `P5 ≥ 3` AND `P3 ≥ 3` AND `P6 ≥ 3` AND (`C2 ≤ 2` OR `D1_dk = 1`) |
| 3 | PW-WF | Workflow / BPM orchestration | `P5 ≥ 2` AND (`D1 ≤ 2` OR `F4 ≤ 1` OR `D4 ≤ 1`) |
| 4 | PW-INT | System integration (API / iPaaS) | `F3 ≤ 1` AND `P6 ≥ 3` |
| 5 | PW-IDP | Intelligent document processing | `F1 ∈ {1,2}` AND `P3 ≥ 2` |
| 6 | PW-BI | Automated reporting / BI | `C3 ≤ 2` AND `F2 ≥ 2` |
| 7 | PW-GENAI | GenAI assist (human-in-the-loop) | `G1 ≤ 2` AND `F1 ≥ 1` |
| 8 | PW-RPA | RPA / UI automation as a bridge | `F3 ≤ 1` AND `G1 ≥ 3` AND `G2 ≥ 2` AND `P6 ≥ 3` |
| 9 | PW-AGENT | Agentic AI (multi-step, supervised) | `ARI ≥ 70` AND `G5 ≥ 3` AND `B1 ≥ 3` AND `C2 ≥ 3` |

If no pathway triggers, use `PW-NONE` ("Optimise and monitor").

### 5.17 Projected scores after the 90-day roadmap

This shows the client what the roadmap is expected to achieve. Run it after the roadmap is assembled (file 02 §4.3).

1. An item is **addressed** if either of these is in `roadmap_30`, `roadmap_60`, or `roadmap_90`:
   - the action linked to it in file 02 §3.9, or
   - any action whose trigger condition references that item.
2. Projected points for each addressed item: `proj = max(current, min(current + 2, 3))`. Roughly, one 90-day action lifts a practice by up to two steps, but never past "3". Reaching "4" (best practice) takes sustained effort beyond 90 days.
3. Items that aren't addressed keep their current points.
4. Recalculate `S_<DIM>_proj`, `PMI_proj`, `level_proj` (gates applied, red flags re-evaluated on projected items), `ARI_proj`, `AOS_proj`, and `quadrant_proj` with the same formulas.
5. Display rule: show the projection only if `PMI_proj − PMI_raw ≥ 5`. Otherwise show: "Your process is already strong. The remaining gains come from the 'beyond 90 days' actions."

---

## 6. Worked example (use as a test case for the engine)

**Input:** Supplier invoice processing. P2=1, P3=4, P4=2, P5=3, P6=3, P7=4, P8=1, P9=2.

| Item | A1 | A2 | A3 | A4 | B1 | B2 | B3 | B4 | C1 | C2 | C3 | C4 | D1 | D2 | D3 | D4 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pts | 2 | 1 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 1 |

| Item | E1 | E2 | E3 | E4 | F1 | F2 | F3 | F4 | G1 | G2 | G3 | G4 | G5 | H1 | H2 | H3 | H4 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pts | 1 | 1 | 2 | 2 | 1 | 2 | 0 | 1 | 3 | 3 | 2 | 1 | 2 | 1 | 2 | 1 | 1 |

**Expected outputs**

| Output | Value |
|---|---|
| S_GOV / STD / MEA / FLW / QUA / DAT / CUL | 31.3 / 37.5 / 25.0 / 31.3 / 37.5 / 25.0 / 31.3 |
| PMI_raw | 31.9 → L2 Reactive (gate G-STD also caps at L2; G-RF caps at L3) |
| ARI | 52.5 → Foundations needed |
| Workload | 4,000 × 15 / 60 = 1,000 h/month ≈ 7.1 FTE → Very high |
| AOS | 0.5·100 + 0.25·100 + 0.25·75 = 93.8 |
| Quadrant | Q2 Fix, then automate |
| Archetype | REPEATER (G3 = 2 fails the Runner rule) |
| Red flags (ordered) | RF6, RF1, RF4, RF3, RF5, RF8 |
| Consistency checks | none of X1–X10 → cx_count = 0 |
| Advanced actions | none triggered (all dimension scores < 60, PMI < 65) |
| Projection (§5.17) | Depends on the assembled roadmap. Add the expected values once the engine produces them, then freeze them as a regression test |
| Confidence | High (dk 0, cx 0) |
| Priority (top 3) | STD 18.75 · FLW 15.47 · MEA 13.50 (then GOV 12.38, QUA 9.38, DAT 9.38, CUL 6.88) |
| Waste top 3 | Defects 75, Waiting 75, Transport 75 (tie-break order) |
| Pathways (detailed) | PW-STD, PW-PM, PW-WF (also triggered: INT, IDP, BI, RPA) |
| gate_auto | 4/8 → NO-GO |
| gate_ai | G5 fail, F1 pass, F2 pass, E1/C1 fail, A1 fail → 2/5 → NOT-READY |
| gate_dmaic | 0/6 → NOT-READY |
| gate_dash | C1 fail, F1 fail, F2 pass, C4 fail → 1/4 → NOT-READY |
| "One thing" | RF6 → ACT-GOV-02 (SIPOC + RACI) |

---

## 7. Implementation notes

- **Form tools:** Typeform, Tally, Jotform, or Google Forms all work. Use hidden fields to store numeric codes. If the tool can only store labels, keep a label→code lookup.
- **Calculation:** Do it in the automation layer (Make/Zapier/n8n code step, Google Apps Script, or a small serverless function), not in the form tool's built-in calculator. You need gates, flags, and ordering.
- **Rendering:** Merge into a Google Docs/Word template, or into HTML → PDF (e.g. Carbone, DocRaptor, PDFMonkey, or a Docs + Apps Script merge). All text is in `02-report-variables-and-content.md`.
- **Versioning:** Store `model_version` (start at `1.0`) with every submission. Don't change weights without bumping the version.
- **Calibration:** After the first ~30 paid reports, check the PMI distribution. If more than 60% land on L2, that is expected for a self-selected "we have a problem" audience. Don't inflate the scoring.
- **Upsell hooks (optional):** multi-respondent comparison (doer vs manager), a 60-minute debrief call, and a facilitated VSM workshop. Rule IDs in file 02 mark where these can be mentioned.

### 7.1 Current Grismont implementation

- The entry page is `/advanced-audit`; the footer link is labelled **Advanced audit** (Hungarian: **Részletes audit**).
- The implementation asks for an email address and explicit consent to send one private resume link after the first answer is saved. It does not collect a client name, company, or IP hash, and does not send reminders, marketing, or report emails. The completed report is available at its private report link and as PDF and JSON downloads. Draft progress and the email delivery log are deleted with the audit after 30 days; completed audit data and reports expire after 12 months.
- A 128-bit random resume token links the server-stored draft. Each answer is validated and saved as entered; unfinished audits expire after 30 days and completed audits/reports after 12 months.
- Site locale controls the question and option language (English/Hungarian); question IDs and numeric option codes stay language-independent.
- The versioned report is rule-based and downloadable. Its JSON is the lossless structured export; the PDF is the readable presentation.
