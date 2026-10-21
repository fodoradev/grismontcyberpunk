# Process Excellence Snapshot: Report Variables, Template & Content Library

This file holds everything the rule-based engine needs to assemble the client report:

1. **Variable dictionary**: every input and computed variable
2. **Report blueprint**: section order, template syntax, and assembly rules
3. **Content library**: all prewritten text blocks, keyed by rule
4. **Action library & roadmap rules**: the 90-day plan generator
5. **KPI library**: recommended KPI set by process category
6. **Personalisation rules**: free-text handling with no AI
7. **QA checklist** before sending

All scoring logic is defined in `01-questionnaire-and-scoring.md` (section numbers below refer to that file as §).

**Template syntax** (Handlebars-style, tool-agnostic):
`{{var}}` inserts a value · `{{#if cond}}…{{/if}}` conditional · `{{#each list}}…{{/each}}` loop · `[[BLOCK-ID]]` inserts a library block · `{{label:var}}` inserts the option label (lower-cased mid-sentence) instead of the code · `{{sep}}` inserts ", " (or " and " before the last item) only when a preceding conditional clause was rendered.

---

## 1. Variable dictionary

### 1.1 Submission metadata

| Variable | Type | Source / rule |
|---|---|---|
| `submission_id` | string | Form tool |
| `submitted_at` | date | Form tool. Display as `DD Month YYYY` |
| `client_name` | string | Checkout / form hidden field |
| `client_company` | string | Checkout / form hidden field |
| `email` | string | Checkout |
| `model_version` | string | Constant, `1.0` |
| `report_id` | string | `PES-{{YYYYMMDD}}-{{last 5 of submission_id}}` |
| `show_capacity_estimate` | bool | Config, default `true` |
| `delivery_sla` | string | Config, e.g. "15 minutes" |

### 1.2 Raw inputs

| Variable | Type | Values | Notes |
|---|---|---|---|
| `P1_process` | text | ≤150 chars | Sanitise: trim, strip line breaks, Title Case for the cover only |
| `P2_category` | int | 1–11 | → KPI family (§5 of this file) |
| `P3_volume` | int | 1–5 | → workload, archetype, pathways |
| `P4_effort` | int | 1–5 | → workload |
| `P5_people` | int | 1–5 | → pathways |
| `P6_systems` | int | 1–5 | → `P6_pts`, pathways |
| `P7_criticality` | int | 1–5 | → RF4, RF6, AI modifier |
| `P8_goal` | int | 1–6 | → priority multipliers, headline wording |
| `P9_role` | int | 1–5 | → role note |
| `P10_pain` | text | ≤300 chars | → pain-point mapping (§6) |
| `P11_tried` | text | ≤300 chars, optional | → prior-attempt rules (§6) |
| `A1`…`A4`, `B1`…`B4`, `C1`…`C4`, `D1`…`D4`, `E1`…`E4`, `F1`…`F4`, `G1`…`G5`, `H1`…`H4` | int | 0–4 | Item points |
| `B2_dk`, `D1_dk`, `D2_dk`, `D3_dk`, `G3_dk` | bool | 0/1 | "Don't know" selected; C2 "No idea" is an ordinary score-0 response |

### 1.3 Computed scores

| Variable | Type | Rule (§ ref) | Display |
|---|---|---|---|
| `S_GOV`, `S_STD`, `S_MEA`, `S_FLW`, `S_QUA`, `S_DAT`, `S_CUL` | float 0–100 | §5.2 | Integer, e.g. "38/100" |
| `S_AUT` | float 0–100 | §5.2 | Integer (radar only, labelled "readiness") |
| `band_<DIM>` | enum | `CRIT`/`DEV`/`EST`/`LEAD` (§5.3) | Label + colour |
| `PMI_raw` | float | §5.4 | Integer |
| `level_raw`, `level_final` | int 1–5 | §5.5 | "Level 2 – Reactive" |
| `level_name` | string | Initial / Reactive / Defined / Managed / Optimising | |
| `level_capped` | bool | §5.5 | |
| `cap_reasons[]` | list | Gate reason texts (§5.5) | Bullet list |
| `ARI` | float | §5.6 | Integer |
| `ARI_band` | enum | `ARI_NR`/`ARI_FN`/`ARI_RT`/`ARI_RS` | Label |
| `workload_hours` | float | §5.7 | Round: <100 → nearest 5; <1,000 → nearest 10; else nearest 50 |
| `workload_fte` | float | §5.7 | 1 decimal |
| `workload_band` | enum | Low / Medium / High / Very high | |
| `AOS` | float | §5.7 | Integer |
| `quadrant` | enum | `Q1`–`Q4` (§5.8) | |
| `archetype` | enum | `RUNNER`/`REPEATER`/`STRANGER` (§5.9) | |
| `W_WAIT`, `W_DEF`, `W_OVP`, `W_TRA`, `W_MOT`, `W_TAL` | float | §5.10 | Integer, horizontal bar |
| `waste_top3[]` | list | §5.10 | |
| `gate_auto`, `gate_ai`, `gate_dmaic`, `gate_dash` | enum | §5.11 | Badge |
| `gate_<x>_items[]` | list of {criterion, pass} | §5.11 | Checklist ✔/✘ |
| `gate_<x>_passes` | int | §5.11 | "5 of 8" |
| `flags_red[]` | ordered list | §5.12 | |
| `flags_cx[]` | list | §5.13 | |
| `dk_count`, `cx_count` | int | §5.1, §5.13 | |
| `confidence` | enum | High / Medium / Low (§5.14) | |
| `priority_<DIM>` | float | §5.15 | Not displayed |
| `priority_rank[]`, `top3_dims[]` | list | §5.15 | |
| `pathways[]` | ordered list | §5.16 | |
| `pathways_detail[]` | first 3 of `pathways[]` | | |
| `items_gap[]` | list | Items with points ≤1 (incl. DK) | §3.9 lines |
| `items_strength[]` | list | Items with points = 4 | §3.9 lines |
| `weakest_item_<DIM>` | item ID | Lowest item in the dimension. Tie → first in order | |
| `pain_theme`, `pain_theme2` | enum | §6.1 | |
| `tried_rules[]` | list | §6.2 | |
| `one_thing` | action ID | §4.4 | |
| `roadmap_30[]`, `roadmap_60[]`, `roadmap_90[]`, `roadmap_later[]` | lists of action IDs | §4.3 | |
| `kpi_family` | enum | §5.1 mapping | |
| `strengths[]` | list | Dimensions with score ≥ 60, highest first, max 2. If none, items scoring 4 (max 2). If none, empty | [[STRENGTHS]] |
| `S_<DIM>_proj`, `PMI_proj`, `level_proj`, `level_proj_name`, `ARI_proj`, `AOS_proj`, `quadrant_proj` | mixed | file 01 §5.17 | "Now → after 90 days" |
| `show_projection` | bool | `PMI_proj − PMI_raw ≥ 5` | |
| `templates[]` | list | Template IDs referenced by actions in the 90-day roadmap (§4.7) | Appendix B |

### 1.4 Display labels

| Code | Display name | Short |
|---|---|---|
| GOV | Ownership & Governance | Governance |
| STD | Standardisation & Documentation | Standard Work |
| MEA | Measurement & Reporting | Measurement |
| FLW | Flow & Waste | Flow |
| QUA | Quality & Control | Quality |
| DAT | Data & Systems | Data |
| CUL | People & Improvement Culture | Culture |
| AUT | Automation & AI Readiness | Automation Readiness |

---

## 2. Report blueprint

Target length: **16–20 pages PDF** (the first 2 pages work on their own for a busy executive). Tone: direct, specific, consultant-grade. No filler, no motivational language.

**Client-facing names.** Never show internal codes in the report. Use these names instead:

| Internal | Shown to client as |
|---|---|
| PMI | Maturity score |
| ARI | Automation readiness |
| AOS | Automation opportunity |
| RF-x / X-x / ACT-x / PW-x | The block's title only (no IDs) |
| `CRIT` / `DEV` / `EST` / `LEAD` | Critical gap / Developing / Established / Best practice |

| # | Section | Content source | Length |
|---|---|---|---|
| 1 | Cover | Metadata, level badge | 1 p |
| 2 | Executive summary + how to read this report | §2.2 template, [[HOW-TO-READ]] | 1 p |
| 3 | Process profile & archetype | Profile answers, [[ARCH-*]], workload | 1 p |
| 4 | Maturity scorecard | Radar chart, table, [[LVL-*]], gates | 1–2 p |
| 5 | Critical findings | [[RF-*]], [[CX-*]] | 1–2 p |
| 6 | Your stated problem | §6 personalisation | ½ p |
| 7 | Dimension deep dives (in `priority_rank` order) | [[DIM-*-band]], [[GOLD-*]], item lines | 4–5 p |
| 8 | Lean waste profile | [[WASTE-*]] | 1 p |
| 9 | Automation & AI verdict | Readiness, quadrant, pathways, automation + AI checklists | 2–3 p |
| 10 | Recommended KPI set & reporting design | §5 KPI library, dashboard checklist | 1 p |
| 11 | 90-day roadmap | §4 action library + playbooks, projection, DMAIC checklist | 2–3 p |
| 12 | Method, confidence & limitations | [[CONF-*]], [[METHOD]] | ½ p |
| 13 | Appendices | A answers · B templates · C glossary | 2–3 p |

**HOW-TO-READ** (box under the executive summary):
> **How to read this report.** Each area is scored 0–100: below 40 is a critical gap, 40–59 developing, 60–79 established, 80+ best practice. Your **maturity level (1–5)** is the overall verdict. It is capped when a foundation is missing, because strength in one area can't make up for a missing basic. **Automation readiness** is scored separately: a process that needs human judgment isn't "immature", it just needs a different kind of tool. Every finding and action traces back to your own answers. The "Why" column in the roadmap shows which.

### 2.1 Cover

```
PROCESS EXCELLENCE SNAPSHOT
{{P1_process}}
{{client_company}} · Prepared for {{client_name}} · {{submitted_at}}
Report ID {{report_id}} · Model v{{model_version}}

[ LEVEL {{level_final}} – {{level_name}} ]   Maturity {{PMI_raw}}/100   Automation readiness {{ARI}}/100
```

### 2.2 Executive summary (template)

```
## Executive summary

**{{P1_process}} is operating at Level {{level_final}} – {{level_name}}** (maturity score {{PMI_raw}}/100).
[[LVL-{{level_final}}-headline]]
{{#if level_capped}}The raw score alone would indicate Level {{level_raw}}. The level is capped because: {{cap_reasons | join "; "}}.{{/if}}

**What's working.** [[STRENGTHS]]

**Where the leverage is.** Given your goal ({{label:P8_goal}}), the three areas that will move results most are
**{{top3_dims[0].name}}** ({{top3_dims[0].score}}/100), **{{top3_dims[1].name}}** ({{top3_dims[1].score}}/100) and
**{{top3_dims[2].name}}** ({{top3_dims[2].score}}/100).

**Automation verdict: [[QUAD-{{quadrant}}-headline]]** Automation readiness {{ARI}}/100 ({{ARI_band.label}}), opportunity {{AOS}}/100.
{{#if show_capacity_estimate}}The process consumes roughly {{workload_hours}} hands-on hours per month (≈ {{workload_fte}} FTE).{{/if}}

**Critical findings: {{flags_red.length}}.** {{#each flags_red}}{{name}}{{#unless @last}} · {{/unless}}{{/each}}
{{#if flags_red.length == 0}}No critical risks were triggered.{{/if}}

**If you do only one thing in the next 30 days:**
> **{{one_thing.title}}**: {{one_thing.done_when}}

{{#if show_projection}}**Where the roadmap takes you:** maturity {{PMI_raw}} → about **{{PMI_proj}}** (Level {{level_final}} → Level {{level_proj}}) in 90 days if the actions are completed as defined.{{/if}}

Key numbers (tiles): Maturity {{PMI_raw}} · Level {{level_final}} · Readiness {{ARI}} · Opportunity {{AOS}} · Critical findings {{flags_red.length}} · Confidence {{confidence}}
```

### 2.3 Process profile

```
| Process | {{P1_process}} |
| Category | {{label:P2_category}} |
| Volume | {{label:P3_volume}} cases/month |
| Hands-on effort per case | {{label:P4_effort}} |
| People involved | {{label:P5_people}} |
| Systems per case | {{label:P6_systems}} |
| Business criticality | {{label:P7_criticality}} |
| Improvement goal | {{label:P8_goal}} |
| Respondent | {{label:P9_role}} |
{{#if show_capacity_estimate}}| Estimated workload | ≈ {{workload_hours}} h/month (≈ {{workload_fte}} FTE) – {{workload_band}} |{{/if}}

### Process archetype: {{archetype.label}}
[[ARCH-{{archetype}}]]
```

### 2.4 Maturity scorecard

- **Radar chart**: 7 maturity dimensions plus a dashed reference ring at 60 ("Established" threshold). Plot S_AUT as a separate single bar, not on the radar.
- **Table**: Dimension | Score | Band | Weakest point (`weakest_item_<DIM>` gap line, or "—" if its score is ≥ 3).
- Then [[LVL-{{level_final}}-body]] and [[LVL-{{level_final}}-next]].
- If `level_capped`, show a box: "Why your level is capped" listing `cap_reasons[]`.

### 2.5 Critical findings

```
{{#each flags_red}} [[RF-{{id}}]] {{/each}}
{{#if flags_red.length == 0}}[[RF-NONE]]{{/if}}

### Consistency observations
{{#if flags_cx.length > 0}}
Some of your answers point in different directions. This is common and usually the most revealing part of an audit.
{{#each flags_cx}} [[CX-{{id}}]] {{/each}}
{{else}}[[CX-NONE]]{{/if}}
```

### 2.6 Your stated problem → see §6 of this file.

### 2.7 Dimension deep dives

For each dimension in `priority_rank` order:

```
### {{rank}}. {{dim.name}}: {{dim.score}}/100 ({{dim.band.label}})
[[DIM-{{dim.code}}-{{dim.band}}]]

**What best practice looks like:** [[GOLD-{{dim.code}}]]

**What your answers show**
{{#each items in dim where points ≤ 1}} ✘ {{gap_line}} {{/each}}
{{#each items in dim where points = 4}} ✔ {{strength_line}} {{/each}}
{{#if no item ≤1 and none = 4}}No critical gaps and no best-practice items. Results sit in the middle range. See the actions below.{{/if}}

**Actions from your roadmap in this area:** {{list of roadmap action IDs whose dim = this dim, with horizon}}
```

The top 3 dimensions get the full block. Dimensions ranked 4–7 get only the **Diagnosis** paragraph and the item lines (keeps the report tight).

### 2.8 Lean waste profile

Horizontal bar chart of the 6 wastes (0–100). Then:

```
{{#each waste_top3 where intensity ≥ 50}} [[WASTE-{{code}}]] {{/each}}
{{#if no waste ≥ 50}}[[WASTE-LOW]]{{/if}}
Note: Inventory (work-in-progress/backlog) and Overproduction are not assessed in this snapshot.
```

### 2.9 Automation & AI readiness

```
**Automation readiness: {{ARI}}/100 – {{ARI_band.label}}** · **Automation opportunity: {{AOS}}/100**
[[ARI-{{ARI_band}}]]

ARI components table: Rule-based share (G1) · Stability (G2) · Exceptions (G3) · Consistency (B2) · Org readiness (G5) · Input structure (F1) · Data quality (F2), each shown as a 0–4 bar.

**Decision quadrant** (2×2 chart, client dot plotted at (AOS, ARI))
[[QUAD-{{quadrant}}-body]]

**Recommended pathways**
{{#each pathways_detail}} [[PW-{{id}}]] {{/each}}
{{#if pathways.length > 3}}Also relevant later: {{pathways[3..] names joined}}.{{/if}}

**Automation Go/No-Go: {{gate_auto}}** ({{gate_auto_passes}}/8) [[GATE-AUTO-{{gate_auto}}]]
{{gate_auto_items as ✔/✘ table}}
**GenAI readiness: {{gate_ai}}** ({{gate_ai_passes}}/5) [[GATE-AI-{{gate_ai}}]]
{{gate_ai_items as ✔/✘ table}}
{{#if P7_criticality ≥ 4}}[[GATE-AI-HITL]]{{/if}}
```

### 2.10 KPI set → see §5 of this file. Close the section with the dashboard checklist (✔/✘ table) and [[GATE-DASH-{{gate_dash}}]].

### 2.11 Roadmap → see §4.3 of this file. Render as a table per horizon:
`Action | Why (trigger) | Owner | Effort | Done when`
Under each action, show its three first steps and the KPI it should move (§4.6). End the section with the projection block (§4.8), a box "Ready for a formal improvement project?" (DMAIC checklist ✔/✘ + [[GATE-DMAIC-{{gate_dmaic}}]]), and the roadmap footer (§4.5).

### 2.12 Method, confidence & limitations

```
**Confidence in this assessment: {{confidence}}** [[CONF-{{confidence}}]]
{{#if dk_count > 0}}You answered "Don't know" to {{dk_count}} question(s): {{list labels}}. Each scored zero, and each is itself a visibility gap.{{/if}}
{{#if P9_role in (3,4)}}[[ROLE-SENIOR]]{{/if}}{{#if P9_role == 1}}[[ROLE-FRONTLINE]]{{/if}}
[[METHOD]]
```

### 2.13 Appendices

- **Appendix A:** full answer list (question, chosen option label, points).
- **Appendix B:** templates for the roadmap actions (§4.7).
- **Appendix C:** [[GLOSSARY]].

---

## 3. Content library

Writing rules for all blocks: second person ("you/your"), present tense, no hedging words ("might possibly"), no unverifiable statistics. Where a general reference point is used, it is attributed to "Lean practice" or "common industry experience".

### 3.1 Maturity levels

**LVL-1-headline:** Outcomes currently depend on individual effort and memory rather than on a defined process.
**LVL-1-body:** At Level 1 the process works because specific people make it work. There is no single agreed method, performance isn't measured, and problems are handled when they surface. That's survivable at low volume, but it doesn't scale. Every absence, peak, or staff change shows up directly as delays and errors.
**LVL-1-next:** **Getting to Level 2–3:** name an owner, document how the process actually runs today, agree one method, and start measuring lead time and rework by hand. Focused effort usually achieves this within 2–3 months. No technology investment is needed.

**LVL-2-headline:** The process gets done, but it is managed reactively: through effort, experience, and firefighting rather than through standards and data.
**LVL-2-body:** At Level 2 the process is repeatable when the usual people are available and volume is normal. Documentation is partial or outdated, methods vary between people, and performance is known mostly by feel. Most of the team's improvement energy goes into fixing today's problems rather than removing their causes.
**LVL-2-next:** **Getting to Level 3 (Defined):** one documented and followed standard method, defined roles, a baseline for lead time and error rate, and a monthly review. This is where most of the "cheap" gains are. Typically 3–6 months of focused effort.

**LVL-3-headline:** The process is defined and largely standardised. The next gains come from managing it by data and closing the improvement loop.
**LVL-3-body:** At Level 3 there is a defined way of working that people mostly follow, and some performance data exists. The typical gaps are measurement that isn't yet systematic, flow losses between teams, and quality managed by inspection rather than prevention. This is the right point to start targeted automation, because a stable base now exists.
**LVL-3-next:** **Getting to Level 4 (Managed):** KPIs with targets reviewed on a fixed cadence, structured responses to deviations, error-proofing of top failure modes, and automated data capture.

**LVL-4-headline:** The process is measured and controlled. The remaining opportunity is continuous, team-driven improvement and smart automation.
**LVL-4-body:** At Level 4 performance is visible, deviations trigger action, and quality is built in rather than inspected. The process can be a reference model for the organisation. Gains from here come from flow optimisation, eliminating residual exceptions, and scaling automation and AI with proper governance.
**LVL-4-next:** **Getting to Level 5 (Optimising):** an embedded improvement routine owned by the front line, leading indicators, and automation of rules-based work with monitored exception handling.

**LVL-5-headline:** The process operates at best-practice level: measured, controlled, continuously improved, and automated where it pays off.
**LVL-5-body:** At Level 5 the process improves itself through a routine. The front line identifies and fixes issues, data drives decisions, and automation handles the repetitive work. The risks at this level are complacency and key-person dependency in the improvement system itself.
**LVL-5-next:** **Sustaining Level 5:** benchmark externally, rotate improvement leadership, and use this process as the template to raise adjacent processes.

### 3.2 Dimension band blocks

Each dimension has a **GOLD** block (the target state, shown for every dimension) and four band blocks with **Diagnosis**, **Why it matters**, and **Focus**. Ranks 4–7 show only the Diagnosis and the GOLD line.

#### Ownership & Governance

**GOLD-GOV:** A named end-to-end owner with real decision rights. Roles documented on one page and kept current. A fixed review cadence where every deviation leaves with an owner and a date. Escalations with response times. Recurring issues routed to root cause, not just re-fixed.

**DIM-GOV-CRIT**
- **Diagnosis:** Nobody owns this process end-to-end. Individual steps have someone doing them, but nobody is accountable for the outcome. Problems that cross team boundaries (which most problems do) have no home. Roles are implicit, and escalation depends on personal networks.
- **Why it matters:** Without an owner who has authority to change the process, every other improvement in this report will stall or fade. Missing ownership is the most common root cause of "we fixed it last year and it came back".
- **Focus:** Appoint an owner with a written mandate. Define roles on one page (SIPOC + RACI). Start a 30-minute monthly performance review with a fixed agenda.

**DIM-GOV-DEV**
- **Diagnosis:** Ownership exists in parts, usually per department, but the end-to-end flow is nobody's job, or the owner lacks authority to change it. Roles are partly defined. Reviews and escalations happen, but not reliably.
- **Why it matters:** Partial ownership optimises the parts at the expense of the whole. Each team hits its own targets while the customer still waits. Cross-team handoffs are where lead time and errors build up.
- **Focus:** Extend the owner's mandate to cover the full SIPOC, from trigger to final output. Set up a fixed monthly review with 3–5 KPIs. Document an escalation path with response times.

**DIM-GOV-EST**
- **Diagnosis:** Governance is in place: a named owner, defined roles, and regular reviews. The remaining gap is usually closing the loop. Actions aren't always tracked to closure, and recurring issues aren't routed to root-cause analysis.
- **Why it matters:** Governance without closed loops becomes ritual: meetings happen, but performance plateaus.
- **Focus:** Track every review action to closure with an owner and a date. Make recurring escalations automatically trigger root-cause analysis. Write the process KPIs into the owner's objectives.

**DIM-GOV-LEAD**
- **Diagnosis:** Governance is at best-practice level. Clear accountability, defined roles, a disciplined review cadence, and escalations that feed improvement.
- **Why it matters:** Strong governance shortens every change cycle. Decisions take one meeting instead of five, which is why the rest of this roadmap can move faster for you than for most.
- **Focus:** Point it at harder problems. Extend governance across company boundaries (supplier and customer service levels), set up succession cover for the owner role, and once a year review the *design* of the process, not just its performance.

#### Standardisation & Documentation

**GOLD-STD:** One agreed best-known method, written as short visual standard work and available where the work happens. A checklist or the system itself enforces it. Every critical task has at least two trained people. New staff work independently within days, not months.

**DIM-STD-CRIT**
- **Diagnosis:** The process lives in people's heads. Different people perform it differently, new staff take a long time to become independent, and the business depends on a few individuals.
- **Why it matters:** Different methods produce different results: errors, unpredictable lead times, and inconsistent customer experience. It also blocks automation, because you can't automate a process that has no single definition. In Lean terms, without a standard there is nothing to improve.
- **Focus:** Map how the process really runs by walking it with the people who do it (not from memory in a meeting room). Agree one best-known method. Write it as 1–2 pages of visual standard work, and cross-train every critical step.

**DIM-STD-DEV**
- **Diagnosis:** Some documentation exists, but it's incomplete, outdated, or not what people actually follow. Execution differs noticeably between people, and resilience to absence is limited.
- **Why it matters:** Documentation that doesn't match reality is worse than none: it creates false confidence, fails audits, and misleads new starters.
- **Focus:** Rebuild the documentation from observed practice. Move it to the point of use (a checklist in the tool, not a PDF on a drive). Use a skills matrix to make sure every critical task has at least two independent performers.

**DIM-STD-EST**
- **Diagnosis:** The process is defined and broadly followed, and onboarding is reasonably fast. The remaining gaps are enforcement and resilience: standards aren't yet built into the system, and some tasks still depend on one person.
- **Why it matters:** Standards that rely on discipline erode under pressure. Standards built into the tool hold up.
- **Focus:** Embed the standard in the system (required steps, templates, checklists). Version-control the documentation and review it on a fixed cadence. Close the remaining single-person dependencies.

**DIM-STD-LEAD**
- **Diagnosis:** Standard work is embedded, current, and resilient. Anyone trained can perform the process the same way.
- **Why it matters:** This is the ideal base for scaling volume and for automation.
- **Focus:** Make the standard the starting point for improvement. Every accepted improvement updates it within a week, and adherence is spot-checked quarterly. Use it as the specification for any automation, because it already defines the rules a bot or workflow needs.

#### Measurement & Reporting

**GOLD-MEA:** 4–7 outcome KPIs, each with a written definition, a target, and an owner. End-to-end lead time measured including its spread, not just the average. Data captured automatically. A short weekly review that discusses only deviations. Real signals separated from normal noise with run or control charts.

**DIM-MEA-CRIT**
- **Diagnosis:** Performance is effectively invisible. There are no meaningful KPIs, and lead time is unknown or guessed. Decisions about this process rest on anecdotes and on whoever complains loudest.
- **Why it matters:** Without a baseline you can't prove an improvement worked, size an automation case, or notice deterioration before your customer does.
- **Focus:** Before changing anything, baseline 30 cases by hand: start time, end time, and rework (yes/no). It takes about 2–3 hours and improves every decision after it. Then define 4–5 KPIs with written operational definitions and targets.

**DIM-MEA-DEV**
- **Diagnosis:** Some measurement exists, but it counts activity rather than outcomes, lacks targets, is compiled by hand, or isn't acted on.
- **Why it matters:** Activity counts ("we processed 1,200") don't tell you whether the customer was served well. Manual reporting consumes capacity and arrives too late to act on.
- **Focus:** Shift from activity to outcome KPIs (lead time, first pass yield, SLA attainment). Set targets. Run a weekly 15-minute review where every off-target KPI gets a named owner and an action.

**DIM-MEA-EST**
- **Diagnosis:** KPIs with targets are in place and reviewed. The gaps are data automation and response discipline: telling real signals from normal noise, and checking that countermeasures actually worked.
- **Why it matters:** Reacting to every fluctuation wastes effort and erodes trust in the numbers. Missing real shifts lets problems grow.
- **Focus:** Automate data capture. Use run or control charts for the 2–3 most important KPIs. Add a "verify effectiveness" step to every corrective action.

**DIM-MEA-LEAD**
- **Diagnosis:** Measurement is a strength: balanced KPIs, automated reporting, and a structured response to deviations.
- **Why it matters:** This is what lets you manage by exception and spot problems early.
- **Focus:** Add leading indicators (e.g. incoming volume, backlog age) for capacity planning, and replicate the dashboard design for adjacent processes.

#### Flow & Waste

**GOLD-FLW:** Few handoffs, each one justified. Work enters only when complete ("definition of ready") and flows oldest-first with a limit on work-in-progress. Approvals exist only where the risk justifies them. Rework is rare, measured, and its causes are being removed.

**DIM-FLW-CRIT**
- **Diagnosis:** Work spends most of its life waiting: in queues, inboxes, and approval chains. It passes through many hands, and a significant share is sent back for rework.
- **Why it matters:** Lead time, effort, and errors all build up at handoffs. Every handoff adds a queue and a chance to lose information. In transactional processes, Lean practice regularly finds that well under 10% of elapsed time is spent on actual work. The rest is the opportunity.
- **Focus:** Map the value stream with real timestamps to separate working time from waiting time. Remove the top two rework causes at the source. Replace blanket approvals with risk-based thresholds.

**DIM-FLW-DEV**
- **Diagnosis:** Flow is hampered by several handoffs, significant waiting, and a noticeable rework or approval burden. The process works, but slowly and with avoidable effort.
- **Why it matters:** Flow losses are often the cheapest gains available. They need decisions, not technology.
- **Focus:** Analyse send-back reasons and fix the top causes at intake. Simplify approvals. Reduce handoffs by combining steps or giving one role more of the end-to-end work.

**DIM-FLW-EST**
- **Diagnosis:** Flow is reasonably lean: limited handoffs, controlled rework, and proportionate approvals. Remaining losses are mostly in waiting time and batching.
- **Why it matters:** At this stage, lead-time gains come from queue management rather than from removing steps.
- **Focus:** Limit work-in-progress, process first-in-first-out, replace batch processing with continuous flow, and track backlog age.

**DIM-FLW-LEAD**
- **Diagnosis:** Flow is close to best practice. Few handoffs, low rework, and risk-based approvals.
- **Why it matters:** The remaining opportunity is mostly in automation and straight-through processing.
- **Focus:** Target straight-through processing for standard cases and monitor flow metrics to catch drift.

#### Quality & Control

**GOLD-QUA:** Errors prevented at the source by design rather than caught by inspection. The error rate measured and broken down by type. Every significant error gets a root-cause analysis and a preventive action that is checked for effectiveness. Customer requirements agreed and monitored.

**DIM-QUA-CRIT**
- **Diagnosis:** Quality depends on people being careful, plus inspection after the fact. Error rates are unknown, errors are corrected without finding the root cause, and customer requirements are assumed rather than agreed.
- **Why it matters:** Inspection catches some defects but never prevents them. The cost of poor quality stays hidden in rework, complaints, and firefighting time, and the same errors keep coming back.
- **Focus:** Start an error log with 5–8 categories. Pareto it after four weeks and error-proof the top two causes at the source. Agree requirements or SLAs with the process's customer.

**DIM-QUA-DEV**
- **Diagnosis:** There is some quality control (checklists, reviews, occasional analysis), but error data is estimated rather than measured, and root-cause work is informal.
- **Why it matters:** Without categorised error data, effort goes to the most visible errors, not the most frequent or costly ones.
- **Focus:** Measure and categorise errors. Introduce 5 Whys or A3 for significant errors, and replace manual checks with system validations where possible.

**DIM-QUA-EST**
- **Diagnosis:** Errors are measured, common errors are blocked by system rules, and significant issues get structured root-cause analysis.
- **Why it matters:** The next step is moving from correcting to preventing, and confirming that corrective actions hold.
- **Focus:** Track corrective *and* preventive actions to verified closure. Collect structured customer feedback. Error-proof the remaining top failure modes.

**DIM-QUA-LEAD**
- **Diagnosis:** Quality is built in: errors are prevented at the source, measured continuously, and systematically learned from. Customer requirements are agreed and monitored.
- **Why it matters:** This is the Six Sigma ideal: predictable output with low variation.
- **Focus:** Hold the gains with a control plan, and extend error-proofing to supplier and customer interfaces.

#### Data & Systems

**GOLD-DAT:** Inputs arrive through one structured channel or directly from other systems. One system of record per case. No re-keying. Key data fields have an owner and validation rules. No side spreadsheets needed to know where a case stands.

**DIM-DAT-CRIT**
- **Diagnosis:** Inputs arrive unstructured, data is unreliable, and people spend significant time re-keying information and maintaining side spreadsheets.
- **Why it matters:** This effort adds no value and is a leading source of errors. It also blocks automated reporting and almost every form of automation.
- **Focus:** Introduce a standard intake: one structured form or portal with a "definition of ready" so incomplete requests are not accepted. List every manual data transfer. Move tracking from shadow spreadsheets into a system of record.

**DIM-DAT-DEV**
- **Diagnosis:** Data is partly structured and generally usable, but manual transfers and workarounds are still common, and known data issues recur.
- **Why it matters:** Every manual transfer is both effort and an error opportunity, and recurring data issues erode trust in reports.
- **Focus:** Assign owners to key data fields and add validation rules. Close the most frequent manual transfers with integration or automation. Retire the most-used side spreadsheet.

**DIM-DAT-EST**
- **Diagnosis:** Data is mostly structured and reliable, and manual transfers are limited. The remaining work is closing integration gaps.
- **Why it matters:** This is a good base for automated reporting and targeted automation.
- **Focus:** Integrate the remaining manual transfers and formalise data ownership.

**DIM-DAT-LEAD**
- **Diagnosis:** Data flows system-to-system with ownership and validation. Workarounds are rare.
- **Why it matters:** Your data is ready for advanced analytics, process mining, and AI.
- **Focus:** Use the data: process mining for continuous flow visibility, and predictive indicators.

#### People & Improvement Culture

**GOLD-CUL:** A regular improvement routine run by the team itself. Ideas answered within days. The front line allowed to make low-risk changes without asking. Protected time for improvement. Lean/Six Sigma and low-code automation skills available in-house.

**DIM-CUL-CRIT**
- **Diagnosis:** Improvement happens only when something breaks. The team is at capacity, frontline ideas aren't captured, and improvement skills are thin.
- **Why it matters:** A team that's always firefighting has no time to remove the causes of the fires, so the problem feeds itself. Improvements imposed from outside will fade.
- **Focus:** First deliver one or two quick wins that free up time. Then protect a small, fixed improvement slot (e.g. 2 hours/week) and run a monthly improvement routine with a visible board.

**DIM-CUL-DEV**
- **Diagnosis:** Improvements happen, but they depend on individuals or management projects rather than a routine. Frontline input is welcome but not systematic.
- **Why it matters:** Project-based improvement produces step gains that slowly erode. A routine produces continuous gains.
- **Focus:** Set up a monthly improvement routine (PDCA board, idea channel with a response deadline). Train the team in basic Lean tools.

**DIM-CUL-EST**
- **Diagnosis:** There is a regular improvement routine with team involvement and some trained practitioners.
- **Why it matters:** The remaining step is making improvement self-sustaining and empowering small changes without escalation.
- **Focus:** Delegate authority for low-risk changes, build automation skills (citizen developers), and measure improvement throughput.

**DIM-CUL-LEAD**
- **Diagnosis:** Continuous improvement is embedded: the team is empowered, skilled, and given time.
- **Why it matters:** This is the strongest predictor that the gains in this report will last.
- **Focus:** Spread it deliberately. Have this team coach one adjacent process, and track improvement throughput (ideas implemented per month and their measured effect) as a KPI in its own right.

### 3.3 Automation Readiness Index bands

**ARI-ARI_NR (Not ready, 0–39):** This process isn't ready for automation. Automating now would hard-code today's variation and exceptions into software, producing a fragile solution that costs more to maintain than it saves. That's not a judgment on the team. It means the work comes *before* the technology: standardise, cut exceptions, and clean up the inputs.

**ARI-ARI_FN (Foundations needed, 40–54):** The process is partly ready. Some conditions for automation are in place, but gaps in consistency, exceptions, inputs, or organisational support would undermine a project today. Targeted foundation work (see the Go/No-Go checklist) typically moves a process into the "ready" range within one quarter.

**ARI-ARI_RT (Ready for targeted automation, 55–74):** The process can support automation of well-defined steps. Start with a pilot on the highest-volume, most rule-based step. Set clear success criteria (e.g. straight-through rate, error rate, lead time) and a defined human route for exceptions.

**ARI-ARI_RS (Ready to scale, 75–100):** The process is a strong automation candidate: rule-based, stable, consistent, with good inputs and organisational support. You can go beyond single-step automation to end-to-end orchestration. Make sure monitoring, bot/agent ownership, and change control are in place before you scale.

### 3.4 Automation decision quadrant

**QUAD-Q1-headline:** Automate now.
**QUAD-Q1-body:** High readiness and high opportunity: this process is in the "automate now" quadrant. The prerequisites are largely in place and the workload justifies the investment. Build the case from the measured baseline, pilot the highest-volume step, and design exception handling from day one. Aim to automate the standard path and let people handle exceptions.

**QUAD-Q2-headline:** Fix, then automate.
**QUAD-Q2-body:** The opportunity is large, but the process isn't ready. This is the most common and most dangerous quadrant. The pressure to "just automate it" is high, and automation projects that start here are the ones that run over budget and get abandoned. Spend the next 60–90 days on the foundation actions in your roadmap (standard method, fewer exceptions, structured intake, baseline). Then reassess. The automation case will be stronger and the build cheaper.

**QUAD-Q3-headline:** Quick wins with low-code tools.
**QUAD-Q3-body:** The process is ready, but the workload is modest. A large automation programme isn't justified, but low-code and personal automation (templates, form-to-system flows, scheduled reports, AI assistants) can remove friction cheaply. Keep each solution simple and documented, with an owner.

**QUAD-Q4-headline:** Improve manually. Automation isn't the priority.
**QUAD-Q4-body:** Low readiness and low workload: automation wouldn't pay back here. The value is in process discipline (standard work, measurement, quality at the source), which costs little and delivers quickly. Revisit automation if volume grows.

### 3.5 Process archetypes

**ARCH-RUNNER:** **Runner: high volume, low variability.** In Lean terms, this process is a "runner": frequent, predictable, and repetitive. Best practice is a dedicated flow with strict standard work, continuous (not batched) processing, and straight-through automation of the standard path. Runners give the highest automation return, *provided* exceptions are routed to a separate lane so they don't clog the main flow.

**ARCH-REPEATER:** **Repeater: regular, with moderate variation.** This process recurs regularly, but with enough variation or exceptions that one rigid flow won't fit. Best practice: standardise and automate the common path (usually 60–80% of cases), define 2–3 standard variants for the frequent exceptions, and keep a human-handled lane for the rest. Tracking the share of cases that follow the standard path is a key KPI.

**ARCH-STRANGER:** **Stranger: low volume or high variation.** This process is either infrequent or highly variable. Over-engineering is the main risk. Rigid workflows and rule-based bots will break on the variation. Best practice: lightweight standards (checklists, templates, decision guides), a searchable knowledge base, and AI assistance for judgment-heavy steps (drafting, summarising, retrieving precedent) rather than full automation.

### 3.6 Automation & AI pathways

Each pathway shows: **What it is**, **Why it fits you** (the triggering facts, rendered from the conditions), **Typical tools** (vendor-neutral examples, not endorsements), **Where to start**, and **Watch-outs**.

**PW-STD: Standardise before you automate**
- *What it is:* Agree and document one standard method, reduce exceptions, and stabilise inputs. No technology involved.
- *Why it fits you:* Standard Work score {{S_STD}}/100{{#if B2 ≤ 1}}, and execution differs significantly between people{{/if}}.
- *Typical tools:* Process mapping (swimlane), standard work templates, checklists, skills matrix.
- *Where to start:* ACT-STD-01 and ACT-STD-02 in your roadmap.
- *Watch-outs:* Don't let a vendor demo skip this step. Every automation built on an unstable process needs rebuilding within a year.

**PW-PM: Process/task mining for discovery**
- *What it is:* Software that rebuilds the real process flow from system event logs (timestamps), showing every path, delay, and rework loop.
- *Why it fits you:* Multiple teams ({{label:P5_people}}), {{label:P3_volume}} cases/month across {{label:P6_systems}} systems, and limited visibility of lead time.
- *Typical tools:* Celonis, SAP Signavio Process Intelligence, UiPath Process Mining, Microsoft Power Automate Process Mining, Apromore.
- *Where to start:* Check whether your main system logs case ID + activity + timestamp. If it does, a 4–6 week discovery is feasible. If not, use a manual value stream map (ACT-FLW-01) first.
- *Watch-outs:* Mining shows *what* happens, not *why*. Pair it with workshops with the people who do the work.

**PW-WF: Workflow / BPM orchestration**
- *What it is:* A workflow tool that routes each case through defined steps, assigns tasks, enforces approvals, tracks status, and replaces email chasing and side trackers.
- *Why it fits you:* {{#if D1 ≤ 2}}Many handoffs. {{/if}}{{#if F4 ≤ 1}}Heavy reliance on workarounds and email chasing. {{/if}}{{#if D4 ≤ 1}}Blanket approval steps. {{/if}}
- *Typical tools:* Microsoft Power Automate / Power Apps, ServiceNow, Jira Service Management, Pipefy, Kissflow, Monday.com, Camunda, Pega, Appian.
- *Where to start:* Model the standard path and the 2–3 most common exceptions. Use one intake form. Make status visible to the requester.
- *Watch-outs:* Don't digitise every approval. Remove unnecessary ones first (ACT-FLW-03).

**PW-INT: System integration (API / iPaaS)**
- *What it is:* Connecting systems directly so data flows automatically instead of being re-keyed.
- *Why it fits you:* Frequent manual re-keying across {{label:P6_systems}} systems.
- *Typical tools:* Native connectors of your existing systems, iPaaS (Make, Zapier, n8n, Workato, MuleSoft, Boomi, Azure Logic Apps).
- *Where to start:* Use the re-keying inventory (ACT-DAT-03). Rank transfers by frequency × error impact, then check for native connectors first.
- *Watch-outs:* Integration moves bad data faster. Fix field definitions and validations (ACT-DAT-02) at the same time.

**PW-IDP: Intelligent document processing**
- *What it is:* AI that reads incoming emails, PDFs, and forms, extracts the data into structured fields, and passes uncertain cases to a person for validation.
- *Why it fits you:* Inputs arrive as {{label:F1}}, at {{label:P3_volume}} cases/month.
- *Typical tools:* Microsoft Azure AI Document Intelligence, AWS Textract, Google Document AI, ABBYY Vantage, Rossum, or LLM-based extraction with validation rules.
- *Where to start:* Collect 50–100 real samples. Measure field-level accuracy in a pilot. Set a confidence threshold below which a person validates.
- *Watch-outs:* First ask whether you can make the sender use a structured form or portal (ACT-DAT-01). Removing the document beats reading it.

**PW-BI: Automated reporting / BI**
- *What it is:* KPIs calculated automatically from system data and shown on a refreshing dashboard instead of compiled by hand.
- *Why it fits you:* Reporting is {{label:C3}}, while data quality is sufficient to automate on.
- *Typical tools:* Power BI, Tableau, Looker / Looker Studio, Qlik, Metabase.
- *Where to start:* Define the KPI set first (Section 10 of this report), then build one page with 4–5 KPIs, trends, and targets.
- *Watch-outs:* A dashboard nobody reviews is waste. Pair it with a review routine (ACT-MEA-04).

**PW-GENAI: GenAI assist (human-in-the-loop)**
- *What it is:* Large language model assistants that support judgment-heavy steps: triaging and classifying requests, drafting responses or documents, summarising cases, and answering questions from your SOPs and policies (retrieval-augmented generation). A person reviews and decides.
- *Why it fits you:* A large share of the work needs judgment, and inputs are digital. Rule-based automation would struggle here, but AI assistance fits.
- *Typical tools:* Microsoft 365 Copilot, ChatGPT Enterprise/Team, Claude for Work, Google Gemini for Workspace, or LLM features in your existing platform (e.g. ServiceNow, Salesforce, Zendesk).
- *Where to start:* Pick one high-frequency, low-risk task (e.g. drafting first responses or summarising case history). Define what "good output" looks like, run 2–4 weeks with mandatory human review, and measure time saved and the correction rate.
- *Watch-outs:* Use only approved tools with appropriate data protection. Never let AI make final decisions on high-impact cases without review. Keep the prompts and SOPs it relies on under version control.

**PW-RPA: RPA / UI automation as a bridge**
- *What it is:* Software robots that copy a person's clicks and keystrokes across applications. Useful where systems have no API.
- *Why it fits you:* The work is rule-based, stable, and involves frequent re-keying across several systems.
- *Typical tools:* UiPath, Microsoft Power Automate Desktop, Automation Anywhere, Blue Prism (SS&C).
- *Where to start:* Only after integration options are ruled out (PW-INT). Choose a high-volume, rule-based sub-process with less than 10% exceptions.
- *Watch-outs:* RPA is brittle. Screen changes break bots. Budget for maintenance, assign a bot owner, and treat RPA as a bridge until proper integration is possible.

**PW-AGENT: Agentic AI (multi-step, supervised)**
- *What it is:* AI agents that carry out multi-step work across tools: gathering information, deciding the next step within defined rules, executing actions, and escalating exceptions to people.
- *Why it fits you:* High automation readiness, mature governance and tooling, documented process, and measured performance. These are the conditions that make agentic automation safe to try.
- *Typical tools:* Agent capabilities in Microsoft Copilot Studio, Salesforce Agentforce, ServiceNow AI Agents, UiPath Agentic Automation, or custom agents built on Claude/OpenAI/Gemini APIs.
- *Where to start:* One bounded use case with clear permissions, an audit log of every action, a human approval step for consequential actions, and a rollback plan.
- *Watch-outs:* Agents amplify process quality, good or bad. Monitor accuracy continuously, and keep a named human accountable for the agent's work.

**PW-NONE: Optimise and monitor**
- No specific automation pathway is triggered. Focus on the improvement actions in your roadmap, and revisit automation when volume or complexity changes.

### 3.7 Critical findings (red flags)

Format for each: **Finding** · **Risk** · **Immediate action**

**RF-RF6: Control & compliance exposure**
- **Finding:** This process has revenue or regulatory impact ({{label:P7_criticality}}), but {{#if B1 ≤ 1}}it isn't properly documented{{/if}}{{#if A2 ≤ 1}}{{sep}}roles and approvals aren't formally defined{{/if}}{{#if E3 ≤ 1}}{{sep}}significant errors aren't root-caused{{/if}}.
- **Risk:** If an auditor, regulator, or customer asked you to show how this process is controlled, you couldn't demonstrate it. Undocumented controls count as missing controls.
- **Immediate action:** Within 30 days, build a one-page SIPOC and RACI (ACT-GOV-02). Identify the 3–5 key control points and document who performs each, and how it is evidenced.

**RF-RF1: Single point of failure**
- **Finding:** If the most experienced person left, the process would {{#if B4 = 0}}stop{{else}}be severely disrupted for weeks{{/if}}.
- **Risk:** Absence, resignation, or illness becomes a business-continuity event. This expert is also usually the bottleneck and can't take part in improvement work.
- **Immediate action:** Build a skills matrix for the process's critical tasks. Pair-train a second person on the top three tasks within 30 days. Have the expert record short screen-capture walkthroughs as a start for the documentation (ACT-STD-03).

**RF-RF4: Quality leakage**
- **Finding:** {{#if D3_dk}}You don't know how often work is redone or sent back.{{else}}{{label:D3}} of cases are corrected, redone, or sent back.{{/if}}{{#if E2 = 0 and P7 ≥ 3}} Error prevention relies on individuals being careful, in a process your customers would notice.{{/if}}
- **Risk:** Rework uses capacity silently, inflates lead time, and leads to customer-facing errors. In processes with this profile, rework is commonly one of the largest single sources of lost effort.
- **Immediate action:** For two weeks, tally every send-back and correction by reason on a simple sheet. Pareto the results and fix the top two causes at the source (ACT-FLW-04).

**RF-RF2: Orphan process**
- **Finding:** Nobody is clearly accountable for this process end-to-end.
- **Risk:** Problems between teams go unresolved, improvement initiatives have no sponsor, and everyone can reasonably say "not my job".
- **Immediate action:** Have leadership appoint an end-to-end owner with a written mandate: scope, decision rights, and KPIs in their objectives (ACT-GOV-01).

**RF-RF3: Flying blind**
- **Finding:** The process has no meaningful KPIs, and end-to-end lead time is not measured (your answer: "{{label:C2}}").
- **Risk:** You can't tell whether things are getting better or worse, can't prove the value of improvements, and can't size an automation case.
- **Immediate action:** Baseline 30 recent cases by hand this month: start, end, touches, and rework (ACT-MEA-02). It takes about 2–3 hours and anchors every decision after it.

**RF-RF5: Automation trap**
- **Finding:** {{#if S_STD < 40}}The process isn't standardised (Standard Work {{S_STD}}/100){{/if}}{{#if B2 ≤ 1 and G3 ≤ 1}}{{sep}}methods vary between people and over a quarter of cases are exceptions{{/if}}.
- **Risk:** Automating now would hard-code the variation. Bots and workflows built on an unstable process break constantly, need expensive rework, and are a leading reason automation programmes fail.
- **Immediate action:** Don't start an automation build yet. First agree one standard method and reduce the most common exceptions (ACT-STD-02, ACT-AUT-07).

**RF-RF7: Firefighting loop**
- **Finding:** The team has no capacity for improvement{{#if D3 ≤ 1}}, while a significant share of work is redone{{/if}}{{#if E3 ≤ 1}}{{sep}}errors are fixed without addressing causes{{/if}}.
- **Risk:** This loop feeds itself. Unaddressed causes generate more firefighting, which removes any time to address causes. It's also a burnout and attrition risk.
- **Immediate action:** Leadership should explicitly free 2 hours per week for one month and spend them on the top rework cause only (ACT-CUL-04). Reinvest the capacity it frees.

**RF-RF8: Approval bottleneck**
- **Finding:** Approval rule today: "{{label:D4}}", and most of the elapsed time is waiting.
- **Risk:** Uniform approvals add queue time to every case, including the low-risk majority, and dilute the attention approvers give to cases that really matter.
- **Immediate action:** Analyse the last 100 approvals: how many were rejected or changed? Set value/risk thresholds and auto-approve or delegate below them (ACT-FLW-03).

**RF-NONE:** No critical findings were triggered. The process has no immediate ownership, continuity, quality, or control exposure at the level that would require urgent action.

### 3.8 Consistency observations

**CX-X1: Documentation–reality gap.** You report current documentation, but also that people perform the process quite differently. This usually means the documentation describes the *intended* process, not the *real* one. Have two people perform the process while you compare against the SOP. The differences tell you what to update, or which deviations to adopt as the new standard.

**CX-X2: Targets without visibility.** You have KPIs with targets, but end-to-end lead time isn't known. KPIs are probably measured per step or per team, which hides the customer's experience. Add end-to-end lead time as a headline KPI.

**CX-X3: Review theatre.** Performance is reviewed regularly, but off-target KPIs rarely lead to action. Reviews without consequences train people to ignore the numbers. End each review with named owners, actions, and due dates, and check them at the next review.

**CX-X4: Automation islands.** Major steps are automated, but data is still re-keyed frequently. Automation has been built per step without connecting the steps. Map the data flow end-to-end and close the gaps between automated islands (PW-INT).

**CX-X5: Ineffective controls.** System validations are in place, yet rework is high. The controls block the wrong errors, or most rework comes from upstream (incomplete inputs, unclear requirements). Pareto the rework reasons. The fix is usually at intake, not in more validation.

**CX-X6: Hidden expertise.** New staff become independent quickly, yet losing your most experienced person would be severely disruptive. That person probably handles the exceptions, the escalations, or the "difficult" cases, and that knowledge isn't in the training. Document the top 10 exception scenarios and how they are resolved.

**CX-X7: Willing but no capacity.** Your team actively suggests improvements but has almost no time to implement them. Ideas that never get implemented eventually stop coming. Protect a small, fixed slot and focus it on ideas that free capacity first.

**CX-X8: Data without decisions.** Reporting is (semi-)automated, but there are no real KPIs, so data is produced but not used to steer. Define 4–5 outcome KPIs with targets and rebuild the report around them.

**CX-X9: Unverified flow claim.** You estimate that cases are mostly being worked on rather than waiting, but end-to-end lead time isn't measured. Without timestamps, waiting time is almost always underestimated, because nobody sees a case while it sits in a queue. Check the claim with the 30-case baseline before deciding flow is not a problem.

**CX-X10: Ungoverned automation.** Major steps are automated, but there's little organisational support or governance for automation. Typically that means automations built by individuals, without documentation, owners, or change control. They work until the builder leaves or a system changes. List every automation in this process, assign an owner to each, and document what it does (ACT-AUT-05).

**CX-NONE:** Your answers were internally consistent. No contradictions were detected between related questions.

### 3.9 Item-level lines

Gap line shows when points ≤ 1 (DK included, rendered with the DK variant where one is given). Strength line shows when points = 4.

| Item | Gap line (≤1) | Strength line (=4) | Action |
|---|---|---|---|
| A1 | No single person is accountable for the end-to-end outcome. | Named owner with authority and KPIs in their objectives. | ACT-GOV-01 |
| A2 | Roles and approvals are informal ("everybody knows"). | RACI documented, followed and maintained. | ACT-GOV-02 |
| A3 | Performance is not formally reviewed on a regular cadence. | Weekly/continuous review with actions tracked to closure. | ACT-GOV-03 |
| A4 | Exceptions are resolved through personal networks, not a defined path. | Timed escalation that triggers root-cause analysis. | ACT-GOV-04 |
| B1 | The process is undocumented or exists only in scattered notes. | Current, version-controlled SOP and map at point of use. | ACT-STD-01 |
| B2 | People perform the process in different ways. *DK: You don't know whether people perform it the same way.* | Identical execution enforced by checklist/system. | ACT-STD-02 |
| B3 | New staff need more than a month to work independently. | Independent in under a week with structured training. | ACT-STD-05 |
| B4 | Losing the most experienced person would stop or severely disrupt the process. | Fully cross-trained; no key-person dependency. | ACT-STD-03 |
| C1 | No outcome KPIs, at most activity counts. | Balanced KPIs with targets and leading indicators. | ACT-MEA-01 |
| C2 | End-to-end lead time is unknown or guessed. *DK variant same.* | Lead time measured automatically including variation. | ACT-MEA-02 |
| C3 | Reporting is absent or compiled manually each time. | Fully automated live dashboard. | ACT-MEA-03 |
| C4 | Off-target KPIs rarely lead to action. | Structured deviation response with verification. | ACT-MEA-04 |
| D1 | Work changes hands 7+ times. *DK: You don't know how many handoffs the work goes through.* | 0–1 handoffs. | ACT-FLW-02 |
| D2 | Cases spend over 90% of elapsed time waiting. *DK: You don't know how much of the lead time is waiting.* | Waiting is under 50% of elapsed time. | ACT-FLW-01 |
| D3 | 10% or more of cases are reworked or sent back. *DK: You don't know your rework rate.* | Under 1% rework. | ACT-FLW-04 |
| D4 | Every case needs 2+ approvals regardless of value or risk. | Risk-based approvals with auto-approval of low-risk cases. | ACT-FLW-03 |
| E1 | The error rate is unknown or known only from complaints. | Errors measured continuously and categorised. | ACT-QUA-01 |
| E2 | Error prevention relies on carefulness or after-the-fact checking. | Errors prevented by design (error-proofing). | ACT-QUA-02 |
| E3 | Errors are fixed (or blamed) without root-cause analysis. | Full CAPA loop with verified effectiveness. | ACT-QUA-03 |
| E4 | Customer needs are assumed or known only through complaints. | Agreed SLAs plus structured customer feedback. | ACT-QUA-04 |
| F1 | Inputs arrive verbally, on paper, or as unstructured email. | Inputs arrive system-to-system. | ACT-DAT-01 |
| F2 | Data is often wrong or incomplete and needs chasing. | Reliable data with ownership and validation. | ACT-DAT-02 |
| F3 | Data is frequently re-keyed between systems. | Fully integrated, no re-keying. | ACT-DAT-03 |
| F4 | Side spreadsheets and email chasing are part of how the process runs. | System supports the full flow without workarounds. | ACT-DAT-04 |
| G1 | Most steps require human judgment. *(Shown as context, not as a gap: "Judgment-heavy work: AI assistance fits better than rule-based automation.")* | Almost entirely rule-based. | — |
| G2 | Rules, forms, or systems change quarterly or more often. | Stable for over a year. | ACT-AUT-07 |
| G3 | Over 25% of cases are exceptions. *DK: You don't know the exception rate.* | Under 5% exceptions. | ACT-AUT-07 |
| G4 | The process is fully manual or relies only on personal shortcuts. | End-to-end automated with monitoring. | ACT-AUT-01 |
| G5 | Little or no organisational support for automation/AI. | Automation/AI CoE with governance and track record. | ACT-AUT-05 |
| H1 | Improvement happens only when something breaks or by individual initiative. | Continuous improvement system with PDCA. | ACT-CUL-01 |
| H2 | Frontline ideas are rarely captured or acted on. | Frontline empowered to implement small changes. | ACT-CUL-02 |
| H3 | Little or no improvement-method capability in the team. | Embedded coaching and automation capability. | ACT-CUL-03 |
| H4 | The team has little or no time for improvement. | Protected time and budget for improvement. | ACT-CUL-04 |

### 3.10 Lean waste blocks

**WASTE-W_WAIT: Waiting ({{W_WAIT}}/100).** Cases spend most of their life in queues: in inboxes, waiting for approvals, waiting for missing information. Waiting adds nothing for the customer and is usually the biggest component of lead time. *Countermeasures:* measure working vs. waiting time on 30 cases, set a "definition of ready" at intake, process first-in-first-out, limit work-in-progress, and use risk-based approvals.

**WASTE-W_DEF: Defects ({{W_DEF}}/100).** Errors and rework consume capacity twice: once to do the work and once to fix it. They also show up as complaints. *Countermeasures:* error log with categories, Pareto, error-proofing at the source, structured root-cause analysis, and fixing intake quality.

**WASTE-W_TRA: Transport: handoffs & data movement ({{W_TRA}}/100).** In knowledge work, "transport" means moving work and data between people and systems. Every handoff adds a queue and a chance of information loss, and every re-keying adds effort and errors. *Countermeasures:* fewer handoffs (broader roles, combined steps), integration, and one system of record.

**WASTE-W_OVP: Over-processing ({{W_OVP}}/100).** More work than the customer needs: uniform approvals, duplicate tracking in side spreadsheets, re-checking. *Countermeasures:* risk-based approvals, retire shadow trackers, and remove checks that never find anything.

**WASTE-W_TAL: Non-utilised talent ({{W_TAL}}/100).** Skilled people spend time on repetitive, robot-like work, and their improvement ideas aren't used. *Countermeasures:* an idea channel with a response deadline, empowerment for small changes, and automation of repetitive steps to free capacity for judgment work.

**WASTE-W_MOT: Motion: searching & chasing ({{W_MOT}}/100).** Time lost searching for information, switching between many systems, and chasing missing or wrong data. *Countermeasures:* data ownership and validation, a single workspace or portal, and a knowledge base for frequent questions.

**WASTE-LOW:** No waste type scored as significant (≥ 50). The remaining gains are in fine-tuning flow and automation rather than removing obvious waste.

### 3.11 Readiness gate blocks

**GATE-AUTO-GO:** All eight automation prerequisites are met. You can proceed to an automation pilot with a measured baseline and clear success criteria.
**GATE-AUTO-CONDITIONAL:** The core prerequisites (consistent execution, stable rules, manageable exceptions) are met, but {{8 − gate_auto_passes}} supporting criteria are not. A limited pilot is reasonable if you close these gaps in parallel: {{failed criteria list}}.
**GATE-AUTO-NO-GO:** Not yet. {{gate_auto_passes}} of 8 prerequisites are met. Close these first: {{failed criteria list}}. Starting an automation build before then carries a high risk of rework or abandonment.

**GATE-AI-READY:** You meet the conditions for a GenAI pilot: approved tools, digital inputs, acceptable data, measurable quality, and an accountable owner.
**GATE-AI-PILOT-ONLY:** A tightly scoped GenAI pilot (low-risk task, mandatory human review, no sensitive data unless the tool is approved for it) is reasonable. Close these gaps before scaling: {{failed criteria list}}.
**GATE-AI-NOT-READY:** GenAI use isn't advisable yet. Missing: {{failed criteria list}}. The most common blocker is the lack of an approved tool and usage policy. Resolve that with IT/legal first (ACT-AUT-05).
**GATE-AI-HITL:** Because this process has revenue, regulatory, or safety impact, any AI use must include a human review step before outputs take effect, an audit trail, and a documented fallback to the manual process.

**GATE-DMAIC-READY:** You're ready to run a data-driven (DMAIC) improvement project. Define a measurable problem statement from your KPIs and run it in 8–12 weeks.
**GATE-DMAIC-READY-WITH-SUPPORT:** A DMAIC project is feasible with support. Missing: {{failed criteria list}}. Consider a facilitator or a trained Green Belt to lead it.
**GATE-DMAIC-NOT-READY:** A full DMAIC project would stall on missing data and capacity. Start with the quick Lean actions in your roadmap (baseline, standard work, rework Pareto). They build the data and credibility a later project needs.

**GATE-DASH-READY:** You can build a live dashboard now. Data, KPIs, and a review routine are in place.
**GATE-DASH-PARTIAL:** A dashboard is possible but would be incomplete or poorly used. Missing: {{failed criteria list}}. Start with a manually updated weekly KPI sheet and automate once the gaps are closed.
**GATE-DASH-NOT-READY:** A dashboard now would be a vanity project. Define KPIs and capture inputs in a system first. Begin with a manual weekly tally on a whiteboard or simple sheet.

### 3.11b Strengths

**STRENGTHS** (executive summary):
- If `strengths[]` holds dimensions: "**{{s1.name}}** ({{s1.score}}/100){{#if s2}} and **{{s2.name}}** ({{s2.score}}/100){{/if}} are at an established level or better. Build on them: they're the base the rest of the roadmap stands on."
- If it holds items: "No area is yet at an established level overall, but some practices are already best-in-class: {{strength lines}}. Use these as proof internally that the standard is achievable."
- If empty: "No area yet reaches an established level. That is typical of processes that grew with the business rather than being designed. The upside is that the first 30 days of actions tend to show visible results quickly."

### 3.12 Confidence & respondent notes

**CONF-High:** Your answers were complete and internally consistent. The findings can be treated as a reliable snapshot.
**CONF-Medium:** Some answers were "Don't know" or pointed in different directions (see Consistency Observations). Findings are directionally reliable. Validate the flagged areas before committing budget.
**CONF-Low:** Several "Don't know" answers and/or contradictions reduce the precision of this snapshot. The *unknowns themselves* are the first finding: the process isn't visible enough to manage. Treat the roadmap's measurement actions as top priority, and consider repeating the assessment after the 30-case baseline.

**ROLE-SENIOR:** This assessment was completed from a management perspective. In practice, managers tend to rate standardisation and measurement higher than the people doing the work. We recommend having one hands-on performer complete the same assessment and comparing the two.
**ROLE-FRONTLINE:** This assessment was completed from a hands-on perspective, which is usually the most accurate view of how the work really runs. Governance and organisational readiness answers may be worth validating with the process owner.

**METHOD:** This report was produced by a rule-based model (v{{model_version}}) built on Lean, Six Sigma, CMMI-style maturity levels, ISO 9001 process-approach principles, and current automation/AI readiness practice. Thirty-three scored questions feed seven maturity dimensions (weighted into the maturity score) and a separate automation readiness score. Maturity levels are capped by gates: weakness in a foundational area can't be offset by strength elsewhere. Workload figures are order-of-magnitude estimates derived from banded answers. The snapshot reflects one respondent's view at one point in time. It is not an on-site audit and does not verify evidence. All recommendations follow the sequence *stabilise → standardise → measure → improve → automate*.

**GLOSSARY:** A3 (one-page structured problem solving) · CAPA (corrective and preventive action) · CTQ (critical-to-quality requirement) · DMAIC (Define-Measure-Analyse-Improve-Control) · FPY (first pass yield: % done right first time) · iPaaS (integration platform as a service) · IDP (intelligent document processing) · Kaizen (small continuous improvement) · Lead time (request to completion, elapsed) · Pareto (ranking causes by frequency) · PDCA (Plan-Do-Check-Act) · Poka-yoke (error-proofing) · RACI (Responsible-Accountable-Consulted-Informed) · RPA (robotic process automation) · SIPOC (Suppliers-Inputs-Process-Outputs-Customers) · Standard work (the agreed best-known method) · Touch time (hands-on working time) · VOC (voice of the customer) · VSM (value stream map) · WIP (work in progress).

---

## 4. Action library & roadmap rules

### 4.1 Field definitions

- **Horizon:** `30` = days 0–30 · `60` = days 31–60 · `90` = days 61–90 · `L` = beyond 90 days
- **Effort:** `S` ≤ 1 person-day · `M` 2–5 person-days · `L` > 5 person-days or multi-week
- **Owner:** role, not name

### 4.2 Action library

| ID | Title | Trigger | Dim | Hz | Effort | Owner | Done when | Method / tool |
|---|---|---|---|---|---|---|---|---|
| ACT-GOV-01 | Appoint an end-to-end process owner | A1 ≤ 2 | GOV | 30 | S | Executive sponsor | Owner named in writing with scope, decision rights, and process KPIs in their objectives | Owner charter (1 page) |
| ACT-GOV-02 | Build SIPOC and RACI | A2 ≤ 2 OR RF6 | GOV | 30 | S | Process owner + team (2 h workshop) | One-page SIPOC and RACI agreed and published. Key control points identified | SIPOC, RACI |
| ACT-GOV-03 | Start a monthly process performance review | A3 ≤ 2 | GOV | 60 | S | Process owner | Three consecutive monthly reviews held with fixed agenda and action log | Review agenda: KPIs → deviations → actions → escalations |
| ACT-GOV-04 | Define an escalation matrix | A4 ≤ 2 | GOV | 30 | S | Process owner | Escalation levels, contacts, and response times documented and communicated | Escalation matrix |
| ACT-STD-01 | Map the current state as it really runs | B1 ≤ 2 OR B2 ≤ 2 | STD | 30 | M | Process owner + 2–3 performers | Swimlane map validated by walking 3 real cases end-to-end | Gemba walk, swimlane map |
| ACT-STD-02 | Agree and document one standard method | B2 ≤ 2 OR B1 ≤ 2 OR RF5 | STD | 60 | M | Process owner + performers | 1–2 page visual standard work published, version-controlled, trained to all performers | Standard work / SOP template |
| ACT-STD-03 | Skills matrix and cross-training | B4 ≤ 2 OR B3 ≤ 1 | STD | 60 | M | Team lead | Every critical task has ≥ 2 people at "independent" level | Skills matrix, TWI job instruction |
| ACT-STD-04 | Point-of-use checklist | B2 ≤ 2 AND E2 ≤ 2 | STD | 30 | S | Team lead | Checklist embedded where the work is done, used on 100% of cases for 2 weeks | Checklist |
| ACT-STD-05 | Structured onboarding pack | B3 ≤ 2 | STD | 90 | M | Team lead | New starter independent within the target time, using the pack | Onboarding plan, screen recordings |
| ACT-MEA-01 | Define the KPI set with operational definitions | C1 ≤ 2 | MEA | 30 | S | Process owner | 4–5 KPIs (see Section 10) with definition, formula, data source, target, owner | KPI definition sheet |
| ACT-MEA-02 | Baseline 30 cases by hand | C2 ≤ 2 OR RF3 | MEA | 30 | S | Team lead | Lead time (median and longest), touches, and rework rate known for 30 recent cases | Sampling sheet |
| ACT-MEA-03 | Automate KPI data capture and dashboard | C3 ≤ 2 AND F2 ≥ 2 | MEA | 90 | M | Process owner + BI/IT | Dashboard refreshes automatically and is used in the review | BI tool |
| ACT-MEA-04 | Visual board and weekly 15-minute huddle | C4 ≤ 2 | MEA | 60 | S | Team lead | Weekly huddle running for 4 weeks. Every off-target KPI has an owner and action | Visual management, tiered huddle |
| ACT-MEA-05 | Introduce run/control charts for key KPIs | S_MEA 40–79 AND C1 ≥ 2 | MEA | 90 | S | Process owner | Top 2–3 KPIs plotted with control limits, reacted to only on signals | SPC / run chart |
| ACT-FLW-01 | Value stream map with touch vs. wait time | D2 ≤ 2 OR D1 ≤ 2 | FLW | 60 | M | Process owner + team | Current-state VSM with process cycle efficiency and a future-state design | VSM |
| ACT-FLW-02 | Remove or merge handoffs | D1 ≤ 2 | FLW | 90 | M | Process owner | Handoffs reduced (target −30%) and new flow documented | Future-state VSM |
| ACT-FLW-03 | Risk-based approval policy | D4 ≤ 2 OR RF8 | FLW | 60 | S | Process owner + approvers | Thresholds defined. Low-risk cases auto-approved or delegated | Approval analysis, delegation of authority |
| ACT-FLW-04 | Rework Pareto and fix at source | D3 ≤ 2 OR RF4 | FLW | 30 | S | Team lead | Two weeks of send-back reasons tallied. Top 2 causes have countermeasures in place | Tally sheet, Pareto, 5 Whys |
| ACT-FLW-05 | WIP limits and first-in-first-out | D2 ≤ 1 | FLW | 90 | S | Team lead | WIP limit and FIFO rule in place. Backlog age tracked weekly | Kanban |
| ACT-QUA-01 | Error log with categories | E1 ≤ 2 | QUA | 30 | S | Team lead | 5–8 error categories logged on every error. First monthly Pareto produced | Defect log, Pareto |
| ACT-QUA-02 | Error-proof the top error types | E2 ≤ 2 | QUA | 90 | M | Process owner + IT | Top 2 error types prevented by system rules or design | Poka-yoke, validations |
| ACT-QUA-03 | Structured root-cause analysis for significant errors | E3 ≤ 2 | QUA | 60 | S | Process owner | Threshold defined. Every significant error gets a 5 Whys/A3 with tracked actions | 5 Whys, fishbone, A3 |
| ACT-QUA-04 | Agree requirements/SLAs with the process customer | E4 ≤ 2 | QUA | 60 | S | Process owner | 3–5 CTQ requirements agreed and measurable | VOC interview, CTQ tree |
| ACT-DAT-01 | Standard intake with a "definition of ready" | F1 ≤ 2 | DAT | 60 | M | Process owner + IT | One structured intake channel. Incomplete requests returned at intake | Form/portal |
| ACT-DAT-02 | Data ownership and validation rules | F2 ≤ 2 | DAT | 90 | M | Process owner + data owner | Owners named for key fields. Validations live. Top data errors cleaned | Data dictionary |
| ACT-DAT-03 | Re-keying inventory | F3 ≤ 2 | DAT | 30 | S | Team lead | List of every manual data transfer with frequency and error impact | Simple inventory sheet |
| ACT-DAT-04 | Retire shadow spreadsheets | F4 ≤ 2 | DAT | 90 | M | Process owner | Most-used side tracker replaced by the system of record or workflow tool | Workflow tool |
| ACT-AUT-01 | Step-level automation opportunity assessment | quadrant ∈ {Q1, Q3} OR (quadrant = Q2 AND gate_auto ≠ NO-GO) | AUT | 60 | S | Process owner + automation lead | Each step scored on rules, volume, stability. Shortlist of top 3 candidates | Opportunity matrix |
| ACT-AUT-02 | Automation pilot on the top candidate | quadrant = Q1 AND gate_auto ∈ {GO, CONDITIONAL} | AUT | 90 | L | Automation lead | Pilot live with success criteria met (straight-through rate, errors, lead time) and an exception route | Pathway tools |
| ACT-AUT-03 | GenAI assist pilot with human review | PW-GENAI triggered AND gate_ai ≠ NOT-READY | AUT | 90 | M | Process owner + IT | One task piloted 2–4 weeks. Time saved and correction rate measured | Approved GenAI tool |
| ACT-AUT-04 | Intelligent document processing pilot | PW-IDP triggered AND AOS ≥ 50 AND gate_auto ≠ NO-GO | AUT | 90 | L | Automation lead | Field-level accuracy measured on 100 samples. Validation threshold set | IDP tool |
| ACT-AUT-05 | Automation & AI governance basics | G5 ≤ 2 | AUT | 60 | M | IT / leadership | Approved tool list, AI/data usage policy, bot/agent ownership and change control defined | Governance checklist |
| ACT-AUT-06 | Process mining discovery | PW-PM triggered | AUT | 60 | M | Process owner + IT | Event-log availability confirmed and discovery scoped (or manual VSM chosen instead) | Process mining |
| ACT-AUT-07 | Exception analysis and reduction | G3 ≤ 2 OR G2 ≤ 1 OR RF5 | AUT | 60 | S | Team lead | Exceptions categorised. Top 3 standardised as defined variants or eliminated | Exception log, Pareto |
| ACT-CUL-01 | Monthly improvement routine | H1 ≤ 2 | CUL | 60 | S | Team lead | Monthly 60-minute kaizen held 2× with a visible PDCA board | PDCA board |
| ACT-CUL-02 | Idea channel with response deadline | H2 ≤ 2 | CUL | 60 | S | Team lead | Every idea answered within 2 weeks. Low-risk changes approved by the team | Idea board |
| ACT-CUL-03 | Build improvement capability | H3 ≤ 2 | CUL | L | L | Leadership / HR | Team Lean basics (Yellow Belt level), owner at Green Belt level, 1 citizen developer trained | Training plan |
| ACT-CUL-04 | Protect improvement capacity | H4 ≤ 1 OR RF7 | CUL | 30 | S | Leadership | Fixed weekly slot (e.g. 2 h) protected for 4 weeks, used on the top rework cause | Calendar commitment |

**Advanced actions** (trigger on *high* scores, so strong processes still get a full, stretching roadmap):

| ID | Title | Trigger | Dim | Hz | Effort | Owner | Done when | Method / tool |
|---|---|---|---|---|---|---|---|---|
| ACT-ADV-01 | Straight-through target with a separate exception lane | S_FLW ≥ 60 AND ARI ≥ 55 | FLW | 60 | M | Process owner | Straight-through rate measured with a target. Exceptions routed to their own queue and owner | Flow segmentation |
| ACT-ADV-02 | Leading indicators and capacity forecast | S_MEA ≥ 70 | MEA | 90 | M | Process owner | Incoming volume and backlog forecast 4 weeks ahead. Staffing decisions use it | Demand forecasting |
| ACT-ADV-03 | Continuous flow monitoring from system data | S_DAT ≥ 60 AND P3 ≥ 3 AND P6 ≥ 3 | DAT | 90 | L | Process owner + IT | Lead time, rework loops, and path variants visible from event data, refreshed weekly | Process mining / event dashboard |
| ACT-ADV-04 | Service agreements at external interfaces | P5 = 5 AND S_GOV ≥ 60 | GOV | 60 | M | Process owner | Input quality and response times agreed with key suppliers/customers and measured | Interface SLA |
| ACT-ADV-05 | Zero-repeat-error review | S_QUA ≥ 70 | QUA | 60 | S | Process owner | Every error that reaches the customer is reviewed. Any repeat of a known cause triggers a design change | Escape review |
| ACT-ADV-06 | Supervised AI agent pilot | PW-AGENT triggered | AUT | 90 | L | Automation lead + process owner | One bounded use case live with permissions, action log, human approval step, and rollback | Agent platform |
| ACT-ADV-07 | Replicate the model to an adjacent process | PMI_raw ≥ 65 | CUL | 90 | M | Process owner + sponsor | Adjacent process assessed with this snapshot, owner named, first 30-day actions started | This snapshot |

### 4.3 Roadmap assembly rules

1. **Collect** every action whose trigger is true.
2. **Sequencing overrides**, applied in order:
   - a. If `RF5` is active or `gate_auto = NO-GO`: move ACT-AUT-02 and ACT-AUT-04 to `L`, with the note "after foundations: reassess with this tool in 90 days".
   - b. If both ACT-MEA-01 and ACT-MEA-03 are triggered, ACT-MEA-03 stays at 90. If ACT-MEA-01 has no slot in the 30-day horizon, move ACT-MEA-03 to `L`.
   - c. If ACT-STD-02 is triggered, ACT-STD-01 must be in an earlier horizon. If both land in 60, move ACT-STD-01 to 30.
   - d. If ACT-FLW-02 is triggered without ACT-FLW-01, keep ACT-FLW-02 at 90. If ACT-FLW-01 is triggered, ACT-FLW-02 must follow it.
   - e. ACT-AUT-03 needs ACT-AUT-05 to be completed or not triggered. If ACT-AUT-05 is triggered, ACT-AUT-03 moves to `L`, unless `gate_ai = PILOT-ONLY`, in which case it stays at 90 with "low-risk task only".
3. **Rank within each horizon:** (1) actions linked to active red flags, in red-flag order; (2) gap actions by the dimension's position in `priority_rank`; (3) advanced actions (ACT-ADV-*) last; (4) effort S before M before L.
4. **Cap:** maximum **4 actions per horizon** (30/60/90). Overflow moves to the next horizon. Overflow from 90 goes to `L`.
5. **Minimum:** if a horizon ends up empty, pull the highest-ranked action from the next horizon forward, as long as sequencing rules allow it.
6. **Display** each action with "Why": the trigger in plain language, e.g. "because new staff take 1–3 months to become independent" (use the chosen option label).
7. **Beyond 90 days** (`roadmap_later[]`): list titles only, with a sentence: "Reassess with this snapshot at day 90. Your scores should show where these become relevant."

### 4.4 "One thing" rule

1. If `flags_red[]` is non-empty: `one_thing` = the linked primary action of the first red flag (§5.12 order).
2. Else: `one_thing` = the first action in `roadmap_30[]`.
3. Else: "Repeat this snapshot in 90 days and compare."

### 4.5 Roadmap footer (static)

> **How to run this roadmap:** Name one owner for the whole roadmap. Review progress in the monthly process review (or start one: ACT-GOV-03). Re-take this snapshot at day 90. Score changes of 10+ points in a dimension are a meaningful improvement.

### 4.6 Action playbooks (rendered under each roadmap action)

Every action in `roadmap_30/60/90` is rendered with its **first three steps** and the **KPI it should move**, so the client can start immediately. Actions in `roadmap_later[]` show the title only.

| ID | First three steps | Should move |
|---|---|---|
| ACT-GOV-01 | 1) Sponsor drafts a one-page charter: start and end trigger, outcome, decision rights, spending limit. 2) Choose someone who feels the end-to-end pain and is respected across teams. 3) Announce it to all teams involved and add 2–3 process KPIs to the owner's objectives. | Everything (enabler) |
| ACT-GOV-02 | 1) In a 2-hour session, list Suppliers, Inputs, the 5–7 main steps, Outputs, Customers (template T3). 2) For each step assign R/A/C/I, with exactly one "A" per step (template T4). 3) Mark the steps where a mistake causes financial, legal, or safety harm. Those are your key controls: record who performs them and what evidence is kept. | Audit-readiness, FPY |
| ACT-GOV-03 | 1) Book a fixed 30-minute monthly slot. 2) Use a standing agenda: KPI trends → top deviations → actions due → escalations. 3) Keep one action log (what, who, by when) and open every meeting with it. | KPI attainment |
| ACT-GOV-04 | 1) List the 5 most frequent exception types. 2) For each, define who resolves it at level 1/2/3 and the maximum response time. 3) Publish it on one page where the team works, and review escalation counts monthly. | Exception lead time |
| ACT-STD-01 | 1) Pick 3 recent typical cases and 1 difficult one. 2) Walk each with the person who did it, recording every step, handoff, wait, and system used. 3) Draw a swimlane map (one lane per role) and mark pain points in red. | Baseline for all |
| ACT-STD-02 | 1) Compare how different people do each step (from ACT-STD-01) and pick the best-known method. 2) Write it as 1–2 pages: steps, key points, the reason behind each key point, screenshots. 3) Train everyone, then check adherence on 10 cases after two weeks. | FPY, lead-time spread |
| ACT-STD-03 | 1) Build a matrix of critical tasks × people, rating each 0–3 (template T7). 2) Highlight tasks with fewer than two people at level 2+. 3) Schedule pair-working and have the expert record short screen walkthroughs. | Continuity risk |
| ACT-STD-04 | 1) Pick the 5–10 steps where mistakes actually happen. 2) Build the checklist into the tool (form, ticket template), not onto paper. 3) After two weeks, remove items that never catch anything. | FPY |
| ACT-STD-05 | 1) Turn the standard work into a week-by-week learning path. 2) Add the 10 most common exceptions with worked examples. 3) Assign a buddy and sign off independence with a 5-case check. | Time to competence |
| ACT-MEA-01 | 1) Start with the 4 core KPIs in the KPI section and add 1–3 category KPIs. 2) For each, fill in a KPI card: definition, clock start/stop, data source, owner, target (template T5). 3) Agree targets with the process customer, not only internally. | Visibility |
| ACT-MEA-02 | 1) Pull 30 recently completed cases, mixing normal and difficult ones. 2) For each, record start and completion time, people who touched it, rework yes/no and why (template T1). 3) Calculate median and longest lead time and % rework. This is your baseline. | Baseline for all |
| ACT-MEA-03 | 1) Confirm each KPI can be calculated from system timestamps and fields. 2) Build one page: each KPI with a 13-week trend and target line. 3) Retire the manual report once the dashboard has been used in two reviews. | Reporting effort |
| ACT-MEA-04 | 1) Set up a board (physical or digital): KPI, target, this week's actual, action. 2) Meet for 15 minutes, same time weekly, discussing red KPIs only. 3) Every red KPI leaves with an owner and a date. | Response speed |
| ACT-MEA-05 | 1) Plot at least 20 data points of a KPI over time. 2) Add the median (run chart) or control limits (control chart). 3) React to signals (a point outside the limits, or 7+ points on one side), not to single bad weeks. | Decision quality |
| ACT-FLW-01 | 1) Follow 5–10 cases and record working time vs. waiting time at each step. 2) Calculate process cycle efficiency = working time ÷ total lead time. 3) Design the future state: remove waits, merge steps, set a target lead time. | Lead time |
| ACT-FLW-02 | 1) For each handoff, ask what the next person adds that the previous one couldn't. 2) Merge steps where one role can do both with the right access and training. 3) Pilot on a subset of cases for two weeks and compare lead time. | Lead time, FPY |
| ACT-FLW-03 | 1) Export the last 100 approvals: value, waiting time, approved/rejected/changed (template T6). 2) Find the threshold below which almost nothing is rejected. 3) Auto-approve or delegate below it, and keep a 5% sample check as the control. | Lead time |
| ACT-FLW-04 | 1) For two weeks, tick a reason every time work is sent back or corrected: 5–8 predefined reasons plus "other" (template T2). 2) Sort by frequency. Usually two reasons cause most of the rework. 3) Fix those two at the source (intake field, checklist, agreement with upstream), then re-measure for two weeks. | FPY, effort |
| ACT-FLW-05 | 1) Count open cases per person and per step. 2) Set a work-in-progress limit (start at today's level minus 20%) and an oldest-first rule. 3) Track backlog age weekly. | Lead-time predictability |
| ACT-QUA-01 | 1) Define 5–8 error categories from recent examples. 2) Log every error: category, where it was found, where it was caused (template T2). 3) Review the ranking monthly in the process review. | FPY |
| ACT-QUA-02 | 1) For the top two error types, ask: how could the system make this impossible? 2) Implement mandatory fields, dropdowns, format and duplicate checks, smart defaults. 3) After one month, check that these error types fell by at least half. | FPY |
| ACT-QUA-03 | 1) Define "significant" (e.g. reached the customer, regulatory impact, more than X hours to fix). 2) Run a blame-free 5 Whys with the people involved. 3) Track the preventive action to completion and check 30 days later that it worked. | Repeat errors |
| ACT-QUA-04 | 1) Interview 3–5 customers of the process: what matters, what frustrates them. 2) Turn the answers into 3–5 measurable requirements (e.g. "complete within 3 working days"). 3) Agree them as an SLA and add them to the KPIs. | Customer satisfaction |
| ACT-DAT-01 | 1) List the minimum information needed to complete a case. 2) Build one form or portal that captures exactly that, with validation. 3) Return incomplete requests at intake, immediately and politely. | FPY, waiting |
| ACT-DAT-02 | 1) Identify the 10 fields that cause the most errors. 2) Name an owner and write a definition for each. 3) Add validation rules and clean the existing records. | Errors, report trust |
| ACT-DAT-03 | 1) Walk through one case and note every copy-paste or re-type: from where, to where, which fields. 2) Estimate how often each happens per month. 3) Rank by frequency × error impact. This is the input for integration or automation. | Effort |
| ACT-DAT-04 | 1) List all side spreadsheets and trackers and why each exists. 2) For the most-used one, find which feature is missing in the main system. 3) Add that feature (status field, view, report), then archive the spreadsheet. | Effort, visibility |
| ACT-AUT-01 | 1) List the steps and score each 0–3 on volume, rule-based share, stability, input structure. 2) Drop steps with frequent exceptions. 3) Shortlist the top 3 with their estimated hours per month. | Automation case |
| ACT-AUT-02 | 1) Define success criteria before building: straight-through rate, error rate, lead time. 2) Automate the standard path and route exceptions to a person with full context. 3) Run in parallel for two weeks, then go live with monitoring and a named owner. | Effort, lead time |
| ACT-AUT-03 | 1) Choose one task: drafting, summarising, or classifying. 2) Write instructions plus 3–5 examples of good output, and use approved tools only. 3) Measure for 2–4 weeks: time per case and % of outputs that needed correcting. | Effort |
| ACT-AUT-04 | 1) Collect 50–100 representative documents, including poor scans. 2) Pilot extraction and measure accuracy per field. 3) Set a confidence threshold below which a person validates. | Effort, errors |
| ACT-AUT-05 | 1) List the approved tools and which data may be used in each. 2) Make sure every bot, flow, or agent has a named owner and short documentation. 3) Define who approves new automations and changes to existing ones. | Risk |
| ACT-AUT-06 | 1) Ask IT whether the main system logs case ID, activity, and timestamp. 2) Extract three months of logs as a sample. 3) Run discovery with a tool trial or partner, and compare the result with your own map. | Visibility |
| ACT-AUT-07 | 1) For two weeks, log each exception with its reason (template T2). 2) Rank the exception types by frequency. 3) For the top three, remove the cause or define a standard variant with its own steps. | Straight-through rate |
| ACT-CUL-01 | 1) Hold 60 minutes monthly: review last month's actions, pick 1–2 problems, plan the fix. 2) Keep a visible board: problem, owner, status, result. 3) Close each item with a measured result and update the standard. | Improvement rate |
| ACT-CUL-02 | 1) Open one channel for ideas (board or form). 2) Answer every idea within two weeks: yes, no, or not yet, with the reason. 3) Let the team implement low-risk changes (no cost, no customer impact) without approval. | Engagement |
| ACT-CUL-03 | 1) Lean basics for the team (1–2 days). 2) Green Belt-level training for the process owner. 3) Train one person on the low-code automation tool you already license. | Capability |
| ACT-CUL-04 | 1) Leadership puts a fixed 2-hour weekly slot in everyone's calendar for four weeks. 2) Use it only on the #1 rework cause. 3) Show the time freed up, and agree to keep the slot. | Capacity |
| ACT-ADV-01 | 1) Define "straight-through": no touch beyond the standard steps, no send-back. 2) Measure the current rate weekly. 3) Route exceptions to a dedicated queue so they don't block standard cases, and set a target for the straight-through rate. | Straight-through rate, lead time |
| ACT-ADV-02 | 1) Collect 26+ weeks of incoming volume. 2) Identify seasonality and weekly patterns. 3) Forecast four weeks ahead and compare it with capacity in the weekly huddle. | Backlog age, SLA |
| ACT-ADV-03 | 1) Confirm event logs (case ID, activity, timestamp) from the main systems. 2) Build a weekly view of lead time, rework loops, and the top path variants. 3) Review the variants monthly and standardise or remove the unplanned ones. | Lead time, FPY |
| ACT-ADV-04 | 1) Identify the 3 external parties whose inputs cause the most rework or delay. 2) Agree input quality criteria and response times with each. 3) Measure them and review quarterly with each party. | FPY, lead time |
| ACT-ADV-05 | 1) Log every customer-reached error with its cause. 2) Check each one against previously known causes. 3) For any repeat, change the design (system rule, form, standard), not just the instruction. | Escaped defects |
| ACT-ADV-06 | 1) Pick a bounded task with clear rules and a reversible outcome. 2) Define permissions, an action log, and human approval for consequential steps. 3) Run supervised for 4 weeks, measuring accuracy and interventions. | Effort, lead time |
| ACT-ADV-07 | 1) Choose the upstream or downstream process that most affects this one. 2) Have its owner complete this snapshot. 3) Reuse this process's governance, standard-work, and KPI templates as the starting point. | Organisation-wide maturity |

### 4.7 Templates (Appendix B of the report)

Include only the templates referenced by actions in `roadmap_30/60/90`. Render each as an empty table the client can copy into a spreadsheet.

| ID | Template | Columns / content |
|---|---|---|
| T1 | 30-case baseline sheet | Case ID · Start date/time · End date/time · Lead time (days) · Hands-on minutes · Number of people involved · Rework? (Y/N) · Rework reason · Exception? (Y/N) · Notes. Footer: median lead time, longest lead time, % rework, % exceptions |
| T2 | Tally sheet (rework / errors / exceptions) | Reason (5–8 predefined + Other) · Mon–Fri tick columns per week · Total · % of total · Rank |
| T3 | SIPOC | Suppliers · Inputs · Process (5–7 steps) · Outputs · Customers. Plus a row for start trigger and end point |
| T4 | RACI | Rows: process steps · Columns: roles · Cells: R/A/C/I · Check: exactly one A per row |
| T5 | KPI card | KPI name · Why it matters · Definition · Formula · Clock start/stop · Data source · Frequency · Target · Owner · Action if off target |
| T6 | Approval analysis | Case ID · Value/risk class · Approver · Hours waiting · Outcome (approved / changed / rejected). Summary: rejection rate by value band |
| T7 | Skills matrix | Rows: critical tasks · Columns: people · Cells: 0 = not trained, 1 = learning, 2 = independent, 3 = can train others · Row check: ≥ 2 people at level 2+ |

### 4.8 Projected scores after the roadmap

Shows the client what completing the 90-day roadmap is expected to achieve. Calculated as in file 01 §5.17, and displayed in the executive summary and at the end of the roadmap:

```
**If the 90-day actions are completed as defined**, your maturity score would rise from {{PMI_raw}} to about **{{PMI_proj}}**
(Level {{level_final}} → **Level {{level_proj}} – {{level_proj_name}}**){{#if quadrant_proj != quadrant}} and the automation verdict would move to "[[QUAD-{{quadrant_proj}}-headline]]"{{/if}}.
This projection assumes each action reaches its "done when" criterion. It's a target, not a guarantee.
```

Projection chart: grouped bars per dimension (now vs. projected).

---

## 5. KPI library

### 5.1 Category → KPI family

| P2_category | `kpi_family` |
|---|---|
| 1 | FIN |
| 2 | HR |
| 3 | CS |
| 4 | MFG |
| 5 | LOG |
| 6 | QC |
| 7 | IT |
| 8 | SAL |
| 9 | PRJ |
| 10 | HC |
| 11 | GEN |

### 5.2 Selection rule

The report shows **the 4 core KPIs + 3 family KPIs = 7 KPIs**. Mark each with a priority tag:
- `Start here` for the 4 core KPIs if `S_MEA < 60`. Otherwise for the family KPIs.
- If `P8_goal = 3` (errors), move First Pass Yield to the top. If `P8_goal = 2` (speed), put Lead Time first. If `P8_goal = 4` (scale), put Throughput first.

### 5.3 Core KPIs (every report)

| KPI | Definition | Formula | Why |
|---|---|---|---|
| End-to-end lead time | Elapsed time from trigger/request to completion | Median and 85th percentile of (completion − start) | The customer's experience. Averages hide the painful tail |
| First pass yield (FPY) | Share of cases completed without rework or send-back | Cases with zero rework ÷ total cases | Single best indicator of process quality |
| Throughput | Cases completed per period | Count completed per week | Capacity and demand balance |
| Backlog age | Age of open cases | % of open cases older than the target lead time | Leading indicator of future delays |

### 5.4 Family KPIs

| Family | KPI 1 | KPI 2 | KPI 3 |
|---|---|---|---|
| FIN | Touchless / straight-through rate (% of documents processed with no manual touch) | First-time match rate (% of invoices/orders matched first time) | On-time payment or days-to-close |
| HR | Time-to-hire / time-to-complete request | Day-one readiness (% of new hires with all access and equipment on day one) | Request first-contact resolution |
| CS | First contact resolution | SLA attainment (% answered/resolved within SLA) | Customer satisfaction (CSAT) per resolved case |
| MFG | OEE (availability × performance × quality) | Scrap & rework rate | Changeover time / schedule attainment |
| LOG | OTIF (on time, in full) | Order/pick accuracy | Dock-to-stock or order-to-ship time |
| QC | CAPA on-time closure rate | Repeat findings rate (same root cause recurring) | Time to close a nonconformance |
| IT | Mean time to resolve (MTTR) | Reopen rate / first-time fix | Change failure rate |
| SAL | Lead/quote response time | Quote-to-order conversion rate | Pipeline hygiene (% opportunities with a next step and date) |
| PRJ | On-time milestone rate | Defect escape rate (issues found after delivery) | Lead time for change requests |
| HC | Patient/request wait time | Claim denial or rejection rate | Documentation completeness at first submission |
| GEN | Straight-through rate (% of cases with no exception handling) | SLA attainment | Touch time per case |

### 5.5 Reporting design guidance (static text after the table)

> **Reporting design standard:** one page, 4–7 KPIs, each with a trend (last 13 weeks), a target line, and an owner. Review weekly at team level (15 minutes, deviations only) and monthly at owner level (trends, root causes, escalations). Every KPI needs a written operational definition: what counts, when the clock starts and stops, and the data source. Otherwise two people will report two different numbers.

---

## 6. Personalisation rules (rule-based free-text handling)

### 6.1 Pain point → theme mapping (`P10_pain`)

Matching: lower-case, strip punctuation, match whole words or word stems (prefix match on the listed stems). Count hits per theme. `pain_theme` = theme with the most hits. Tie → the theme whose dimension ranks higher in `priority_rank`. `pain_theme2` = second theme if it has ≥ 1 hit.

| Theme | Dimension | Keywords / stems |
|---|---|---|
| SPEED | FLW | slow, delay, wait, late, backlog, bottleneck, queue, "takes too long", turnaround, "lead time", stuck, approv, chas, pending, overdue |
| QUALITY | QUA | error, mistak, wrong, rework, defect, complain, quality, incorrect, miss, redo, return, fix, inaccura |
| DATA | DAT | manual, excel, spreadsheet, copy, re-ent, retyp, paste, "data entry", email, paper, duplicat, system, tool, integrat |
| OWNERSHIP | GOV | nobody, "no one", owner, responsib, accountab, unclear, blame, silo, "who does", align, escalat, decision |
| STANDARD | STD | different, inconsisten, "depends on", "own way", knowledge, training, onboard, document, sop, "key person", leav, expert, depend |
| VISIBILITY | MEA | visib, report, kpi, metric, "don't know", track, transparen, measur, dashboard, status |
| CAPACITY | CUL | overload, workload, capacity, burnout, firefight, resist, motivat, "no time", staff, turnover, morale |
| COMPLIANCE | GOV + QUA | audit, complian, regulat, risk, control, finding, breach, penalt, fine |

**Block PAIN-MATCH** (when `pain_theme` exists):
```
## Your stated problem
> "{{P10_pain}}"

This relates most directly to **{{pain_theme.dim.name}}**, where your score is **{{dim.score}}/100 ({{dim.band.label}})**.
{{#if dim.score < 60}}Your answers confirm this is a structural weakness, not a one-off.
The underlying drivers in your answers are: {{gap lines of that dimension, max 3}}.{{/if}}
{{#if dim.score ≥ 60}}Interestingly, your answers in this area are relatively solid. The problem you describe is therefore
more likely *caused upstream*, in **{{top3_dims[0].name}}** ({{top3_dims[0].score}}/100), where the gaps are larger.{{/if}}
{{#if pain_theme2}}It also touches **{{pain_theme2.dim.name}}** ({{dim2.score}}/100).{{/if}}

**Actions in your roadmap that address this directly:** {{roadmap actions whose dim = pain dim, with horizon}}
```

**Block PAIN-NOMATCH** (no keyword hits):
```
## Your stated problem
> "{{P10_pain}}"
Based on your answers, the most likely structural drivers are in **{{top3_dims[0].name}}** and **{{top3_dims[1].name}}**.
The roadmap actions for these areas are your most direct route to resolving it.
```

Language note: the keyword lists are English. For other languages, add translated stem lists per form language. Don't machine-translate the client's text in the report.

### 6.2 Prior attempts rules (`P11_tried`)

Evaluate all rules. Show at most 2 blocks, in table order. If P11 is empty, skip the section.

| ID | Keywords / stems | Additional condition | Block text |
|---|---|---|---|
| TA1 Tech-first | software, tool, system, ocr, rpa, bot, ai, automat, platform, erp, crm, implement, app | `S_STD < 50` OR `gate_auto = NO-GO` | "You mention a technology-based attempt. Your answers suggest why it may have underdelivered: technology amplifies the process it runs on, and this process is not yet standardised (Standard Work {{S_STD}}/100, automation Go/No-Go: {{gate_auto}}). Before investing further, close the foundation gaps in your roadmap. The existing tool may well deliver once the process underneath it is stable." |
| TA2 Training-only | train, workshop, coach, educat, retrain | `B2 ≤ 2` | "You mention training. Training without a written, agreed standard to train *to* tends to fade within weeks, because people return to their own methods. Your answers show execution still varies between people. Agree the standard method first (ACT-STD-02), then train to it and audit adherence." |
| TA3 More people | hire, hiring, "more people", temp, overtime, headcount, staff, outsourc | `S_FLW < 60` | "You mention adding capacity. When most of a case's time is spent waiting and in rework, adding people mainly adds work-in-progress, not throughput. Your flow score ({{S_FLW}}/100) suggests that removing waiting and rework will release more capacity than hiring." |
| TA4 Reminders/policy | remind, policy, memo, instruct, told, email, rule, announce | — | "You mention reminders or instructions. Instructions that rely on people remembering decay quickly. Durable fixes change the *system*: a required field, a checklist step, an automatic block, a default. Ask of each instruction: how can we make the right way the easy (or only) way?" |
| TA5 Previous project | consultant, project, lean, "six sigma", kaizen, workshop, initiative, programme, program | `S_CUL < 60` OR `S_GOV < 60` | "You mention a previous improvement project. Gains from one-off projects decay when there's no owner and no routine to hold them. Your governance ({{S_GOV}}/100) and culture ({{S_CUL}}/100) scores suggest that is a risk here. Build the sustaining mechanisms (owner, review, improvement routine) alongside any new initiative." |
| TA6 Nothing tried | nothing, none, "not yet", "no", n/a | P11 length < 15 chars | "Nothing has been tried yet, so there are no failed attempts to unwind and no change fatigue to manage. Start with the 30-day actions. They're low-cost and build credibility for larger changes." |

---

## 7. QA checklist (automated where possible, before the report is sent)

| # | Check | Automated? |
|---|---|---|
| 1 | All 33 scored items present and in range 0–4. Profile codes in range | Yes |
| 2 | Worked example (file 01 §6) reproduces the expected outputs exactly after any change to the logic | Yes (regression test) |
| 3 | No unresolved `{{…}}` or `[[…]]` tokens in the rendered document | Yes |
| 4 | Roadmap has 1–4 actions per horizon, and no automation pilot when `gate_auto = NO-GO` | Yes |
| 5 | Red flag count in the executive summary matches the critical findings section | Yes |
| 6 | Level shown equals `level_final`, and cap reasons are shown if capped | Yes |
| 7 | Client free text is escaped (no HTML/markdown injection), trimmed, and profanity-checked | Yes |
| 8 | If `confidence = Low`, the executive summary includes: "Confidence in this snapshot is low. See Section 12." | Yes |
| 9 | Charts render (radar, waste bars, quadrant), and colours match band codes | Yes |
| 10 | Spot-check 1 in 20 reports manually for tone and coherence during the first 3 months | Manual |

---

## 8. Grismont website implementation

The questionnaire is published at `/advanced-audit` and uses Grismont's existing one-question-per-card flow, shared type scale, colours, spacing, footer, and mobile behaviour. The source question wording and scoring definitions remain in `01-questionnaire-and-scoring.md`; bilingual prompt strings and stable IDs live in `lib/advanced-audit/questions.ts`.

Starting an audit creates an anonymous resume link. Each answer is saved to PostgreSQL as the respondent progresses. A report is frozen on completion and can be resumed through the same private link; drafts are deleted after 30 days and completed reports after 12 months. No email address or IP address is collected for this flow. This replaces the source document's proposed email delivery and 16–20 page PDF with a private web report and downloadable PDF plus lossless JSON. The PDF includes the assessment, scored answers, core recommendations, and the selected 30/60/90-day actions; it is intentionally a compact operational report rather than the proposed long paid diagnostic.

The website currently implements the deterministic scoring and worked-example regression check, answer appendix, readiness gates, selected KPI recommendations, six waste scores, red flags, consistency checks, an action subset, and an illustrative score projection. The source action library, complete playbooks/templates, level-specific diagnostic prose, and every report block in this file are not yet all rendered. Do not describe the website output as the full report specification until those sections have been implemented. Versioned snapshots are stored with each completed report; bump `AUDIT_CONTENT_VERSION` when changing IDs, options, weights, rules, or report semantics.

Run `npm run db:migrate` after pulling schema changes. Verify the unit suite with `npm test`; run the browser suite with `npm run test:e2e` against the local PostgreSQL database. The Advanced Audit regression fixture is in `tests/unit/advanced-audit.test.ts`.
