# Grismont Design Guidelines

Use this document as the starting point for new Grismont web pages, reports, presentations, and other brand materials. When a new design decision is needed, extend these patterns deliberately and update this guide so later work can stay consistent.

## Direction: night shift

Grismont after hours: a rain-wet city, signage in the dark, and one live neon line that starts as a tangle and runs clear. The whole site is cyberpunk, and the words stay plain. The contrast is the point: **the world is neon, the voice is calm, and every claim is still concrete.**

- **One signature:** the flow line. A single neon stroke, tangled where the work is stuck and straight where it runs. It is the brand promise drawn, so it is the thing to spend boldness on. Everything around it stays disciplined.
- **Colour has a meaning:** crimson is friction and "act here". Flow mint is work that runs clear. They are not decoration and never swap roles.
- **Signage, not a sci-fi movie:** huge condensed type, hard edges, one cut corner. Real signs in a real street at night.
- **Readable first:** long reading text sits on calm, dark surfaces at full contrast. Atmosphere (rain, haze, scanlines) stays behind and below the content, and never under small text at a strength that hurts reading.
- **Avoid the stock kit:** no Orbitron-style type, perspective grid floors, chromatic-aberration text, typing effects, fake terminal copy, invented "system status" readouts, or looping glitch.

"Lean Six Sigma" and "AI automation" stay in plain sight in the copy. The look changes, the offer does not.

## Colour

Token names are **roles**, kept from the earlier palette: `--gm-paper` is the page, `--gm-white` is a raised surface, `--gm-ink` is primary text. Never use `--gm-ink` as a background or `--gm-white` as text colour on an accent; use the tokens below.

| Role | Token | Hex | Use |
|---|---|---|---|
| Void | `--gm-paper` | `#07060F` | Page background |
| Panel | `--gm-white` | `#100F20` | Cards, forms, raised content |
| Dusk | `--gm-mist` | `#191731` | Alternate sections and quiet panels |
| Band | `--gm-band` | `#0C0B1A` | Atmospheric bands (calculator, contact) |
| Text | `--gm-ink` | `#F3F0FF` | Headings and primary text |
| Muted | `--gm-muted` | `#B6B2D2` | Body copy, secondary labels |
| On dark | `--gm-on-dark` | `#CFCBE6` | Secondary text in bands |
| Line | `--gm-line` | `#34314F` | Dividers and card borders |
| Steel | `--gm-steel` | `#807CA6` | Form control borders (3:1 minimum) |
| Crimson | `--gm-crimson` | `#FF2E54` | Primary button, rules, chart points, the tangled part of the line |
| Crimson deep | `--gm-crimson-deep` | `#FF7A90` | Crimson **text** on any dark surface |
| Crimson lift | `--gm-crimson-lift` | `#FF5C78` | Button hover |
| Flow mint | `--gm-flow` | `#35F0D8` | The clear part of the line, "after" states, resolved scores, focus rings |
| On accent | `--gm-on-accent` | `#07060F` | Text on crimson or mint |

**Measured contrast**, across all four surfaces:

| Pair | Minimum |
|---|---:|
| Text | 15.5:1 |
| Muted | 8.5:1 |
| Crimson deep (crimson text) | 7.0:1 |
| Steel (control borders) | 4.4:1 |
| On accent on crimson | 5.5:1 |
| Line | 1.4–1.6:1, so decorative dividers only, never the only sign of a control |

**Crimson budget.** One primary button in view, plus small rules, markers and chart points. Never a section background.

**Mint budget.** Mint means resolved. It marks after-states, focus and the clear end of the line, and it is never a button fill competing with the primary action.

**Glow budget.** Glow is light from a sign, so only lit things have it: the flow line, the primary button, the calculator figure and the current method step. Body text, headings and cards never glow.

**Never colour alone.** Errors are a written message beside the field plus a heavier border. Selected tabs add weight as well as a rule, chart points carry labels, and scores use text.

## Typography

| Face | Role |
|---|---|
| **Big Shoulders Display** (700, 800) | Hero, section headings, large figures. Set in capitals, like signage. Condensed, so long Hungarian words fit |
| **Figtree** (400–800) | All reading text, navigation, forms, buttons, card text, prices |
| **IBM Plex Mono** (400, 500) | Small labels only, such as `01 / IMPROVE` and metadata. Never for sentences |

All are self-hosted from `public/fonts`, and every subset includes Hungarian `ő` and `ű`. Figtree has no `↳`, so that glyph falls back to Plex Mono through the font stack. A two-glyph Japanese subset carries the 流れ sign and nothing else.

| Use | Size |
|---|---:|
| Hero headline | 64–168 px (Hungarian 40–128 px), Big Shoulders 800, about .92 line height |
| Section heading | 48–96 px (Hungarian 40–84 px), Big Shoulders 800, about .96 line height |
| Card heading | 22–40 px, Figtree 700 (large feature cards may use Big Shoulders) |
| Lead paragraph | 18–21 px |
| Body | 16–17 px, line height at least 1.5 |
| Label | 12 px mono |

Capitals belong to Big Shoulders display lines and mono labels. Everything else is sentence case. Reading width is at most about 60 characters.

## Shape

- **The katana cut:** primary buttons, raised cards and image frames have one cut corner, top-right or bottom-right, cut at 45°. Size scales with the object: 10 px on a button, 22 px on a card. Other corners stay square.
- One radius does not rule everything: chips and inputs have 2 px, and circles are reserved for the flow mark and method markers.
- **Buttons paint their cut:** `.gm-cta` draws the corner with a background gradient rather than `clip-path`, so its glow survives and its focus ring can sit outside the shape. The ring stays outside because mint on crimson is under 3:1.
- **Cards and frames clip theirs:** they use `clip-path` with `--gm-cut`, which also clips outlines, so anything focusable inside them keeps its ring clear of the edge. New cards join the `:is()` list at the end of `globals.css`, which also redraws the border across the cut.
- No soft grey shadows. Depth comes from surface colour, hairlines and light.

## Layout

- One clear focal point per section, with generous margins (`--gm-space`).
- A plain-language heading on every section.
- **The hero is full-bleed and sign-like:** an oversized headline over a city, the samurai standing at the right, the 流れ sign beside them, and the flow line leaving the headline's underlined word ("admin", Hungarian "adminisztrációval") and running out straight. The line is two parts: a knotted crimson SVG stroke under the word, then a straight crimson-to-mint rule (`.home-tangles::after`) running to the right edge. Without `heroCity`, the hero rests on a skyline drawn in code (`NightCity` in `app/page.tsx`), haze and still rain lines.
- Hairlines and simple grids do the grouping. Cards only for content that is genuinely raised (offers, forms, the explorer, report findings).
- **Spacing floor:** related text sits at least 8 px apart (label to value, heading to its text at least 10 px), list rows have at least 11 px above and below, boxed text has at least 14 px of padding on small chips and 22 px in cards, and body text has a line height of at least 1.45. Phones shorten structure, never this spacing.
- Numbers only where order is real (method steps, next steps).
- Rhythm: void hero → void (problems) → band with backdrop (calculator) → void with backdrop (method) → dusk (scorecard) → void (offers) → band fading to void (person) → void → band with backdrop to close (contact). Sections differ in shape so progress is visible.

## Visuals and placeholders

All generated and supplied art is listed in `data/visuals.ts` and briefed in **[asset-prompts.md](asset-prompts.md)**, which holds a ready-to-paste prompt for each slot.

- **Content slots** (samurai, portrait, training, and the training, workshop, programme and delivery offer art) carry a `{{FILL: …}}` marker until the file exists, so `npm run check:launch` lists them and `components/VisualSlot.tsx` draws a labelled frame of the right shape. The `training` photo is not on the homepage right now, because each offer has its own art, but `check:launch` still lists it.
- **Backdrop slots** (city, calculator, method, contact, 404) are optional atmosphere, placed with `VisualBackdrop`. Without a file the CSS atmosphere stands alone and the section is complete.
- **Real people stay real.** The portrait and team training image are real photographs, only graded to match. Never generate a person or a client session and present it as real.

**Flow Samurai rules:** appears prominently once, in the hero. Calm and standing, **sword sheathed, no combat**, faceless. Charcoal cloth, silver mechanical details and a single crimson plate, lit by signage. A vector draft is kept in `docs/flow-samurai-draft.svg` for reference only.

Diagrams still explain the work: the tangled-to-clear diagram in the method section is labelled and readable with motion off.

## Engagement

Interaction should let visitors find out something real, never pressure them.

- **Funnel order:** problem, their own number, method, free scorecard, paid offers, person, next steps, FAQ, contact. The free step comes before prices.
- **A primary action stays in reach:** sticky header on the homepage, a bottom bar on phones between the sections that already carry the action.
- **Show the outcome early:** the hours calculator uses only the visitor's inputs; the report preview comes from the real sample report and is labelled as a sample.
- **Show the person early:** name and credential in the hero, not at 60% of the page.
- **Never:** fake urgency, countdowns, invented numbers or social proof, analytics, or browser storage.

## Interaction and motion

- **Hover:** at most a 1–2 px lift or a colour or light shift, gated by `(hover: hover) and (pointer: fine)`.
- **Press:** `scale(.97)` on buttons, 160 ms.
- **The one load moment:** the sign powers on. The headline steps in, the flow line draws from tangle to straight, the samurai frame opens, and the 流れ sign catches once like a tube starting. It happens once and rests.
- **Answering motion:** the calculator figure glides to its value, explorer steps stagger from before to after, disclosures open smoothly, and opening a scorecard area lights up its score.
- **Scroll motion:** reveals once only, the method rail fills with the step being read, sample bars fill on view, and the nav marks the current section.
- **No endless loops**, no continuous flicker, no animated rain. The flow diagram plays for 12 seconds in view, then rests on a static picture.
- **Reduced motion:** everything is static and complete. Never hide content behind an animation.
- **Curve:** `--gm-ease` (`cubic-bezier(.23, 1, .32, 1)`). Name the properties; never `transition: all`.

## Accessibility and responsive quality

- Body text meets AA, and non-text controls meet 3:1 (use Steel, not Line, for control borders).
- Interactive targets are at least 44 px high. Keyboard focus is always visible, and a mint ring means focus everywhere.
- Test at 320, 390, 768 and 1440 px, in both languages. Hungarian runs longer: the longest headline word must fit at 320 px, and small screens reduce button and header sizes rather than clipping.
- Informative visuals have text alternatives (localized); purely decorative motifs are `aria-hidden`.

## Writing

Use plain, specific language; short paragraphs; informative headings. Separate facts, interpretation and recommendations. No exaggerated AI claims, and no sci-fi role-play in the copy. Bracketed or `{{…}}` values are unresolved business information and are never invented or rendered.

English and Hungarian are equal first-class versions. Keep labels, buttons, charts, emails, PDFs and alt text localized together.

## Reports, PDFs and emails

**Print stays on paper.** PDFs keep the light palette (`COLORS` in `chart-geometry.ts`): paper background, ink text, Figtree, crimson for chart points. Keep charts legible in grayscale print, and include a title, date and page numbers on multi-page files. Emails use system fonts and the same light colours, with a crimson primary button, because dark email renders unpredictably across clients. The web report follows the night palette (`WEB_COLORS`).

## Design review checklist

- Is there one focal point per section, and is the flow line still the most memorable thing?
- Do crimson and mint keep their meanings? Is anything glowing that is not a light source?
- Does meaning survive without colour and without motion?
- Are "Lean Six Sigma" and "AI automation" easy to find in the copy?
- Is the samurai only in the hero, calm, with the sword sheathed?
- Does every interactive element tell the visitor something true?
- Is there anything decorative to remove before publishing?
- Do both languages work at 320 px?

## Source of truth in this repository

- `app/globals.css`: tokens, type, controls, scorecard styling.
- `app/home.css`: homepage composition, motifs and responsive rules. `app/inner.css`: flow, report, intake and legal layout.
- `data/visuals.ts`, `components/VisualSlot.tsx`, `docs/asset-prompts.md`: images, placeholders and prompts. `components/FlowMark.tsx`, `components/FlowArt.tsx`: drawn artwork.
- `components/scorecard/ReportView.tsx`, `lib/pdf/ReportDocument.tsx`, `lib/scorecard/chart-geometry.ts`: report patterns and colours.
- `lib/email/templates.ts`: email colours.

If implementation and this document differ, verify which is current, then update this guide when a deliberate system change is made.
