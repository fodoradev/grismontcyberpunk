# Design assessment

Assessment of the site before the engagement rebuild, measured with Playwright at 1440, 820 and 390 px in English and Hungarian. It is the reasoning behind the current homepage order and interactions. Figures describe the version assessed, not the current one, and the look has since moved to the night shift system in [design-guideline.md](design-guideline.md).

## Homepage

Measured with Playwright, reduced motion. Page height: EN 8,540 / 9,165 / 12,572 px; HU 8,998 / 9,558 / 13,081 px. 1,084 words EN.

### Critical

1. **Primary CTA disappears after the hero.** Crimson scorecard buttons sit at y 647 and 4,829 (1440), and y 569 and 7,946 (390): a 7,377 px gap on mobile. The header is `position: static`, so its CTA also scrolls away. Interest peaks with nothing to click. Fix: sticky header on the homepage; a mobile bottom CTA bar after the hero, hidden near #scorecard and #contact; a contextual CTA after #problems.

2. **Free offer comes after paid offers.** #scorecard starts at 49% of page depth (54% on mobile), behind 1,320 px of prices (2,499 px on mobile). A cold visitor sees 320 000 Ft before the free step. Fix: order Problems → Method → Scorecard → Services → About → Next → FAQ → Contact.

3. **HU hero fails the first screen.** At 1440×900 the H1 runs six lines and 465 px, and the CTA is at y 931, below the fold. Hero is 1,068 px versus 743 px in EN. Fix: lower the H1 maximum, widen the copy column, and test with the longest word "adminisztrációval".

### High

4. **Nothing lets the visitor do anything until they commit.** The only homepage interaction before the form is three tabs plus accordions. The headline promises hours back, but visitors never meet their own number. Fix: a calculator (people × hours per week = hours per year), using arithmetic on their inputs, no invented claims, no storage, leading into the scorecard.

5. **Scorecard section hides its value.** Six areas are closed accordions (446 px of labels), and the outcome is a plain list. Nobody sees what the report looks like; "See a sample report" is a small link. Fix: a live report preview, labelled as a sample, with bars animating on view; opening an area highlights its bar. Make the sample link prominent.

6. **Mobile is too long and repetitive.** 12,572 px is about 15 screens. Services alone are 2,499 px, four near-identical stacked cards. The samurai occupies 431 px after the CTA, pushing credentials to y 1,178. Fix: compact offer rows that expand; condense the strip into two lines; shrink the visual or move it above the fold in a shorter crop.

7. **Monotonous section template.** Label, H2 and right-hand note repeat in #problems, #services, #method and #scorecard; About, Next and FAQ all use the same two-column split. FAQ, Next and About differ little in shape, so nothing signals progress. Fix: vary the structure: a pinned, scroll-tracked method; a full-bleed scorecard band; a large statement in About.

8. **Small, flat type.** Of 132 visible text elements on the page, 102 are 12–15 px, 26 are 16 px, and only 4 are larger. 22 are 12 px mono labels. Body feels like interface text, not persuasion. At 820 px the H1 is only 46 px (44 px at 390), so tablets get a phone headline. Fix: body 17–18 px, key statements 22–32 px; H1 with a higher floor at tablet widths.

9. **The person is invisible.** "Attila" first appears at 60% of page depth (y 5,121). No portrait exists, leaving about 400 px of empty left column in About. For a solo consultancy with proof hidden, the human is the main trust signal. Fix: a portrait placeholder, a name near the hero, and the Green Belt beside it.

### Medium

10. **Trust strip is weak and misplaced.** Three small facts in 104 px; "Lean Six Sigma / Green Belt" splits the credential across two lines. Fix: one line of honest reassurance beside the CTA: free, 8 minutes, no obligation, works in HU/EN, then the credential.

11. **Header wastes mobile space.** Menu sits on its own row: 133 px at 390, 147 px at 820, 16–18% of the first screen. Fix: one 60 px row with a menu icon button.

12. **Motion only decorates.** Reveals, one load moment, and a 12 s diagram in #method. Tab changes swap instantly, so before/after does not feel like a transformation. Accordions snap open. Fix: stagger the before→after steps, animate accordion height, add scrollspy and a method progress line; all reduced-motion safe.

13. **Dead ends.** #next (511 px) and #faq (804 px) have no primary action. Explorer's right panel is half empty. Fix: a closing CTA after FAQ; put a "score this process" link in the panel.

### Check with the owner

"Most popular first step", "Most clients start with…" and "almost every company I see" imply a track record while proof is hidden, and struck-through regular prices have no sales history behind them. Confirm they are true, or soften them. I did not change or verify these.

### Not worth changing

Palette and crimson restraint work; the hero CTA stands out clearly. Overflow is clean at all widths. Preselecting the interest from a service link is a good detail, so keep it.

## Inner pages and interface guidelines


### A. Visual and flow findings, by severity

##### High
1. **Question count contradicts the promise.** Page copy says "Answer 30 short questions" (`app/scorecard/page.tsx:15`), the flow shows "Question 1 of 32" (`flow0-1440`). Trust drops on the first screen. Fix: count only scored questions in the counter, or say "about 30"; show time left instead.
2. **Mobile intake form is 2 screens down.** Form top is at 985 px on a 390x844 viewport (`scorecard-390`). Fix: on mobile put the form directly after a 2-line intro, with the areas and "you get" list below it.
3. **Marketing chrome stays during the questionnaire.** Full nav, CTA and footer sit around the flow, and the desktop scroll positioning clips the header at the top (`flow2-1440`). At 390 the footer appears directly under the question (`flow2-390`). Every link is an exit, and "Free scorecard" points at the page they are already in. Fix: focused flow shell with wordmark, language switch, save status only.
4. **No momentum feedback across 30+ questions.** Progress shows segments and a count only. No section-complete moment, no time left, no reminder of the reward. Fix: brief section transition ("Flow and waste done, 5 areas left"), "about 6 minutes left", and "saved" status (the scorecard saves silently; the audit shows status).
5. **Report opens without a verdict.** At 390 the first screen is banner, greeting and intro; scores begin at the fold (`sample-390-top`). Biggest risk starts well below. Fix: lead with a summary card: weakest area, biggest risk, first action. Sticky or repeated next-step CTA; 8,560 px on mobile has one conversion point at the end.

##### Medium
6. **Validation can undo a consent tick.** In a scripted run, ticking the box while the failed submit was still returning left the form stuck, and the run timed out; with a wait it passed. Likely the action result resets the uncontrolled checkbox. Fix: control the checkbox state, or validate required consent client-side first.
7. **Intake asks consent before value is visible, with no preview.** "See a sample report" is a low-weight link under fine print (`scorecard-1440`). Fix: real report thumbnail or scores preview beside the form.
8. **Hierarchy on intake is flat.** Lists, numbered areas and fine print compete; `01 /` numbers on areas imply a sequence that doesn't exist (also audit, `audit-1440`). The right column ends halfway, leaving a void. Fix: sticky form, unnumbered areas, one list.
9. **Long report cards are uniform.** Quick wins are equal-weight text walls (`sample-1440`). Fix: surface "Do this" first, collapse "why"; make "Done when" a checkbox-like line (visual only).
10. **Quadrant is small and labels are tiny.** 10 px SVG labels, 11 px caption (`globals.css` `.sc-q-label`). Fix: larger chart, at least 12 px.

##### Low
11. **Legal pages are one undifferentiated column** of 4,905 px, with "[To be provided]" in body (expected until launch) and a draft banner. Fix: sticky section index on desktop; the right third is unused.
12. **404 is a dead end with one option** (`404-1440`). Fix: add scorecard and contact routes.
13. **Inconsistent with the homepage:** inner page h1 sizes differ, audit uses `01/44` inside the h1, the scorecard uses a superscript number. Pick one.
14. **Mobile keyhints wrap badly** at non-touch narrow widths (`flow2-390`). Fix: hide below 620 px.

### B. Web Interface Guidelines audit

```text
components/scorecard/IntakeForm.tsx:44 - email input missing spellCheck={false}
components/ContactForm.tsx:69 - email input missing spellCheck={false}
components/advanced-audit/AdvancedAuditIntake.tsx:26 - email input missing spellCheck={false}
components/ContactForm.tsx:10 - placeholder should end with …
components/scorecard/CardFlow.tsx:328 - textarea missing name
components/scorecard/CardFlow.tsx:331 - input missing name
components/scorecard/CardFlow.tsx:344 - role=radio buttons are all tab stops; needs roving tabindex
components/scorecard/CardFlow.tsx:50 - progressbar lacks aria-valuetext
components/advanced-audit/AdvancedAuditFlow.tsx:147 - kbd missing aria-hidden (CardFlow has it)
components/advanced-audit/AdvancedAuditFlow.tsx:145 - question number mixed into h1 text
components/advanced-audit/AdvancedAuditFlow.tsx:137 - progress label says "Scorecard" on the audit
components/scorecard/ReportView.tsx:14 - decorative ↓ inside label string
components/scorecard/ReportView.tsx:55 - score column needs tabular-nums
components/scorecard/ReportView.tsx:90 - arrows in figcaption not hidden from AT
components/SiteFooter.tsx:36 - ↑ not aria-hidden
app/page.tsx:102 - below-fold img missing loading="lazy"
app/page.tsx:117 - ↗ not aria-hidden
app/page.tsx:126 - ↗ not aria-hidden
app/globals.css:1 - touch-action only on links, not buttons; tap highlight unset
app/globals.css:419 - outline:none on flow fields; focus only shifts the border colour (steel to ink), and uses :focus
app/globals.css:472 - metrics need tabular-nums
app/home.css:94 - price needs tabular-nums
components/ProcessExplorer.tsx:9 - selected tab not in URL (low, optional)
```

Outside the listed files: `app/layout.tsx` has no `theme-color`. Fonts are not preloaded (`globals.css` @font-face only).

Pass: no `transition: all`, reduced motion honoured, focus-first-error on forms, labels present, icon buttons labelled, destructive delete confirmed, no zoom blocking.

Not applied by decision: Title Case and "avoid first person" rules, because the guide specifies sentence case and a first-person voice.

### C. What would raise scorecard completion most

1. Consistent count plus time left.
2. Distraction-free flow shell.
3. Form above the fold on mobile.
4. Section-complete moments.
5. A visible report preview before starting.
