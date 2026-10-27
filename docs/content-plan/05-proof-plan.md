# 05 — Proof plan: show skill without client projects

Goal: a visitor must see evidence they can examine, not only claims.
Rule: **every number on the site is real and measured.** If a number is an estimate, label it "estimate".
If a past employer is confidential, anonymise it ("a 400-person logistics company"), but keep the numbers true.

---

## 1. Proof assets, in order of priority

| # | Asset | Where it appears | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | 3 case studies from your past jobs | `#proof`, `/work/case-studies` | 1–2 days | `{{FILL}}` |
| 2 | Green Belt project as a case study | `/work/case-studies` | ½ day | `{{FILL}}` |
| 3 | Sample scorecard report | `/scorecard/sample` | ½ day | `{{FILL}}` |
| 4 | Career timeline with one result per role | `#about` | 2 hours | `{{FILL}}` |
| 5 | Real photo + full name + LinkedIn | `#about` | 1 hour | `{{FILL}}` |
| 6 | 2 small free tools | `/work/apps` | 2–4 days | `{{FILL}}` |
| 7 | 4 free templates | `/downloads` | 1 day | `{{FILL}}` |
| 8 | Results from the first 5 launch partners | `#proof`, case studies, testimonials | ongoing | `{{FILL}}` |
| 9 | Own automations, shown as short videos | `/work/apps` or case studies | 1 day | `{{FILL}}` |
| 10 | 4–6 articles | `/insights` (new) + LinkedIn | ongoing | `{{FILL}}` |

Publish a footer link or section only when its asset exists.

---

## 2. Interview: questions for Attila (answer these first)

Answer in short notes. Claude can turn the notes into case studies.

### Career
1. List your jobs: years, company type (anonymised if needed), role, team size.
2. For each job: which processes did you own or improve?
3. For each job: one result with a number. (Time saved, errors reduced, cost, lead time, backlog, staff hours.)
4. Which tools did you use? (Excel/Power Query, Power BI, Power Automate, SAP, Make, n8n, Python, AI tools…)
5. Did you train or coach people? How many? On what?

### Green Belt
6. Which organisation issued it, and when? Is there a certificate link?
7. What was your Green Belt project? Problem, baseline, root cause, solution, result.

### Building
8. Which automations or tools have you built? For whom? What did each one save?
9. What can you show on screen (anonymised)?

### Opinions (for articles and the "About" text)
10. What do companies get wrong about automation and AI?
11. What is the first thing you look at in a process?
12. What is one myth about Lean in offices?

---

## 3. Case study template

Use the same structure for every case. Keep it to one screen. Path: `/work/case-studies/{{slug}}`.

```markdown
---
title: {{short title, e.g. "Month-end reporting: 3 days to 4 hours"}}
title_hu: {{magyar cím}}
industry: {{e.g. logistics / manufacturing / shared services}}
company: {{name or "a 400-person logistics company"}}
type: past-role | partner-project | own-business
year: {{YYYY}}
result_headline: {{e.g. "-85% time"}}
---

## The situation
{{2–3 sentences. Who, which process, why it hurt. One number for the baseline.}}

## What we found
{{2–3 sentences. Root cause. Mention the method: process map, data check, 5 Whys, Pareto.}}

## What we changed
- {{change 1}}
- {{change 2}}
- {{change 3, e.g. automation built with ...}}

## The result
| Measure | Before | After |
| --- | --- | --- |
| {{e.g. hours per month}} | {{X}} | {{Y}} |
| {{e.g. errors per month}} | {{X}} | {{Y}} |

## What this means for you
{{1–2 sentences that connect the case to the reader's own process.}}

**Image:** {{process map before/after, or a screenshot, anonymised}}
**Quote:** {{optional testimonial}}
```

---

## 4. Free tools (`/work/apps`) — suggestions

Each tool: one page, works in the browser, no login, optional email to get the result as PDF.

1. **Cost of manual work calculator / Kézi munka költségkalkulátor**
   Inputs: task, minutes per run, runs per week, number of people, hourly cost (Ft), error rate.
   Output: hours and Ft per year; "automation break-even" for a given build cost.
   Strong for training sales too: "This report costs you 2.1 million Ft a year."
2. **Automate or not? checker / Automatizáljuk vagy ne?**
   10 yes/no questions (stable steps? digital input? clear rules? volume?).
   Output: "Standardise first" / "Good candidate" / "Good AI candidate" with reasons.
3. Later: **SIPOC builder**, **meeting cost timer**, **AI use-case canvas (interactive)**.

---

## 5. Templates (`/downloads`) — suggestions
Each download: PDF + editable version (Excel/Word/Google), email required.
1. Process map template (swimlane) with an example
2. SIPOC template with an example
3. Waste walk checklist for office work (8 wastes, office examples)
4. AI use-case canvas: task, volume, data, risk, owner, test plan

---

## 6. Launch partner process (turns training into proof)
1. Before the training: measure the baseline of the chosen process (time, errors, waiting time).
2. In the training: each team picks one improvement with an owner and a date.
3. Day 30: online review. Measure the same numbers again.
4. Write the case study with the template above. Send it to the client for approval.
5. Ask for a testimonial (3 questions: What was the problem? What changed? Would you recommend it?).
6. Ask for permission: company name + logo, or anonymised.

Put this in the contract or the order confirmation as "reference permission" (see `07-legal-checklist.md`).

---

## 7. Articles (`/insights`, new) — first 6 titles

| # | EN title | HU title |
| --- | --- | --- |
| 1 | Why automation fails on unstable processes | Miért bukik el az automatizálás instabil folyamatokon? |
| 2 | How to calculate the true cost of one manual report | Mennyibe kerül valójában egy kézzel készített riport? |
| 3 | The 8 wastes of Lean, in office examples | A Lean 8 vesztesége irodai példákon |
| 4 | Before you buy an AI tool: 5 questions | Mielőtt AI-eszközt veszel: 5 kérdés |
| 5 | Approval loops: why orders wait, and how to fix it | Jóváhagyási körök: miért várnak a rendelések, és hogyan javítsd? |
| 6 | Shift handover in manufacturing: a checklist that works | Műszakátadás a gyártásban: egy ellenőrzőlista, ami működik |

Format per article: 800–1,200 words, one diagram, one worked example with numbers, one CTA to the scorecard.
