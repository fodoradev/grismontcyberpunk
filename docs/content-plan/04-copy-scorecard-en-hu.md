# 04 — Scorecard and audit pages: copy and form changes (EN + HU)

Pages: `/scorecard`, `/hu/scorecard`, `/advanced-audit`, `/hu/advanced-audit`, new `/scorecard/sample`.
Goal: more people start the scorecard, more people finish it, and the report leads to a call.

---

## 1. Scorecard start page

### EN
**Meta title:** Free Discovery Scorecard: score one process in 8 minutes | Grismont
**Meta description:** Answer 30 questions about one process. Get six scores, three quick wins, the main risk and a 90-day roadmap. Free, on screen and as PDF.

**H1:** One process. A clearer next step.
**Intro:** Pick a process you know well, for example the weekly report, order handling or month-end
closing. Answer 30 short questions. A best estimate is fine.

**You get:**
- six scores with short explanations
- three quick wins
- the main risk to fix before automation or AI
- a 90-day roadmap

**Reassurance line:** Free · about 8 minutes · answers save after each question · no obligation to book
**Link:** See a sample report first → `/scorecard/sample` `[PROOF]`

### HU
**Meta title:** Ingyenes Folyamat-pontozó: értékelj egy folyamatot 8 perc alatt | Grismont
**Meta description:** Válaszolj 30 kérdésre egy folyamatról. Hat pontszámot, három gyors javítást, a fő kockázatot és 90 napos ütemtervet kapsz. Ingyenes, azonnal és PDF-ben.

**H1:** Egy folyamat. Egy tisztább következő lépés.
**Bevezető:** Válassz egy folyamatot, amit jól ismersz, például a heti riportot, a rendeléskezelést vagy
a havi zárást. Válaszolj 30 rövid kérdésre. A legjobb becslésed is elég.

**Ezt kapod:**
- hat pontszám rövid magyarázattal
- három gyors javítás
- a fő kockázat, amit az automatizálás vagy az AI előtt rendezni kell
- 90 napos ütemterv

**Megnyugtató sor:** Ingyenes · kb. 8 perc · minden válasz után mentünk · semmire nem kötelez
**Link:** Előbb megnézem a mintajelentést → `/hu/scorecard/sample` `[PROOF]`

---

## 2. Form changes (before the questions)

**Rule:** ask for the minimum at the start. Ask the rest at the end, before the report is shown.

### Step 1 — before question 1 (only 2 fields)
| Field | EN label | HU label | Required |
| --- | --- | --- | --- |
| first_name | First name | Keresztnév | yes |
| email | Work email | Munkahelyi e-mail | yes |

Checkboxes (two separate boxes, never joined):
1. **Required.** EN: I have read the [privacy notice](/privacy). · HU: Elolvastam az [adatkezelési tájékoztatót](/hu/privacy).
2. **Optional, not pre-ticked.** EN: Send me up to 3 reminders if I do not finish. · HU: Küldj legfeljebb 3 emlékeztetőt, ha nem fejezem be.

Button: EN **Start the questions →** · HU **Kezdjük a kérdéseket →**

Remove the "Website" field from the start form. If you need it, ask it in step 3 as optional.

### Step 2 — the 30 questions
- Show a progress bar: EN "Question 7 of 30" · HU "7. kérdés / 30".
- Show the six area names as the progress sections.
- Keep "answers save after each question".

### Step 3 — after question 30, before the report (all optional)
| Field | EN label | HU label |
| --- | --- | --- |
| company_size | Company size | Cégméret |
| work_type | Type of work: Manufacturing or logistics · Customer service · Office and admin · Other | Munka jellege: Gyártás vagy logisztika · Ügyfélszolgálat · Iroda és adminisztráció · Egyéb |
| role | Your role | Beosztásod |
| company | Company (optional) | Cég (opcionális) |

Intro text: EN "Three optional questions help me make your report more useful." · HU "Három opcionális
kérdés, hogy a jelentésed hasznosabb legyen."
Button: EN **Show my report** · HU **Mutasd az eredményt**
Link: EN "Skip" · HU "Kihagyom"

---

## 3. Report page and email: the next step

### On-screen report, end block
**EN**
**H2:** Want help with the first quick win?
**Text:** In a free 20-minute call we go through your scores and agree the first step. No sales pitch.
**Button:** Book a 20-minute review → `{{FILL: booking link}}`
**Secondary:** Want a deeper look? Take the Advanced audit (44 questions, about 8 minutes) → `/advanced-audit`

**HU**
**H2:** Segítsek az első gyors javításban?
**Szöveg:** Egy ingyenes, 20 perces beszélgetésben átnézzük a pontszámaidat, és megbeszéljük az első lépést. Nincs értékesítési rizsa.
**Gomb:** Foglalok egy 20 perces átnézést → `{{FILL: foglalási link}}`
**Másodlagos:** Részletesebb képet szeretnél? Töltsd ki a Részletes folyamat-auditot (44 kérdés, kb. 8 perc) → `/hu/advanced-audit`

### Email series after the report (only to people who did not opt out)
Note: the report email itself is transactional. The follow-up emails below are marketing. They need a
separate, optional consent checkbox (add to step 3: EN "Send me a few useful follow-up emails about my
results." · HU "Küldj néhány hasznos e-mailt az eredményeimmel kapcsolatban."). Every email needs an
unsubscribe link.

| Day | Subject (EN) | Subject (HU) | Content |
| --- | --- | --- | --- |
| 0 | Your scorecard report (PDF) | A Folyamat-pontozó eredményed (PDF) | Report + booking link |
| 2 | Your first quick win, step by step | Az első gyors javításod, lépésről lépésre | Detail of quick win 1 for their lowest area |
| 5 | How one team got a day back every week | Hogyan nyert vissza egy csapat heti egy napot | One case study `[PROOF]` |
| 9 | Shall we look at it together? | Átnézzük együtt? | Short, personal; booking link; reply option |

---

## 4. Advanced audit page
- Remove the audit link from the main footer and navigation.
- Link to it only from the scorecard report and email 0.
- Add one line at the top: EN "Already did the scorecard? This is the deeper version." · HU "Már
  kitöltötted a Folyamat-pontozót? Ez a részletesebb változat."
- Make the two checkboxes separate (privacy = required; resume link email = optional), the same as the scorecard.

---

## 5. New page: sample report `[PROOF]`
Path: `/scorecard/sample` and `/hu/scorecard/sample`.
- Fictional company, clearly labelled: EN "Sample report — fictional company" · HU "Mintajelentés — kitalált cég".
- Company: "Példa Kft.", 85 people, metal parts manufacturer. Process: "Customer order to production order".
- Show all six scores, the three quick wins, the main risk and the 90-day roadmap, exactly as the real
  report looks.
- Content for the sample: `{{FILL: Attila writes the sample answers, or Claude Code generates them from
  the scoring rules with realistic inputs}}`.
- CTA at the bottom: "Get your own report → /scorecard".
