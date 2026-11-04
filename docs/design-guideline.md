# Grismont Design Guidelines

Use this document as the starting point for new Grismont web pages, reports, presentations, and other brand materials. When a new design decision is needed, extend these patterns deliberately and update this guide so later work can stay consistent.

## Direction: washi dawn

Grismont at first light: a pale Japanese-futurist morning, warm washi paper, sumi-black ink, one vermilion accent and a single jade line that runs clear. It keeps the cyberpunk heritage of the earlier "night shift" look (city silhouettes, sign blades, vertical type, thin circuit lines) and drops the neon: no glow, no dark city, no rain. The words stay plain. **The world is calm and light, the voice is calm, and every claim is still concrete.**

- **One signature:** the flow line. A single thin stroke, tangled (vermilion) where the work is stuck and straight (jade) where it runs. It is the brand promise drawn, so it is the thing to spend boldness on. Everything around it stays disciplined.
- **Colour has a meaning:** vermilion (crimson) is friction and "act here". Jade (flow) is work that runs clear. They are not decoration and never swap roles.
- **Signage and seals, not a sci-fi movie:** huge condensed type, hard edges, one cut corner, vertical type, red hanko seals. Real signs on a real street at dawn.
- **Readable first:** long reading text sits on calm paper at full contrast. Atmosphere (mist, skyline, hairline circuits) stays behind and below the content, and never under small text at a strength that hurts reading.
- **Avoid the stock kit:** no Orbitron-style type, perspective grid floors, chromatic-aberration text, typing effects, fake terminal copy, invented "system status" readouts, neon or glow, or looping glitch.

"Lean Six Sigma" and "AI automation" stay in plain sight in the copy. The look changes, the offer does not.

## Colour

Token names are **roles**, kept from the earlier palette: `--gm-paper` is the light page, `--gm-white` is a raised surface, `--gm-ink` is dark primary text. Never use `--gm-ink` as a section background (use `--gm-ink-surface`, only for the contact band); text on crimson or jade is `--gm-on-accent` (white).

| Role | Token | Hex | Use |
|---|---|---|---|
| Washi paper | `--gm-paper` | `#F6F3EE` | Page background |
| White | `--gm-white` | `#FFFFFF` | Cards, forms, raised content |
| Mist | `--gm-mist` | `#ECE8E0` | Alternate sections and quiet panels |
| Band | `--gm-band` | `#E6E1D7` | Atmospheric bands (calculator, method) |
| Ink | `--gm-ink` | `#14161C` | Headings and primary text |
| Ink surface | `--gm-ink-surface` | `#14161C` | The one sumi-dark band: the contact band |
| Muted | `--gm-muted` | `#4B4F5B` | Body copy, secondary labels |
| On dark | `--gm-on-dark` | `#D9DBE2` | Text on the sumi-dark contact band |
| Line | `--gm-line` | `#D8D2C6` | Dividers and card borders |
| Steel | `--gm-steel` | `#77746C` | Form control borders (3:1 minimum) |
| Crimson (vermilion) | `--gm-crimson` | `#C8242E` | Primary button, rules, chart points, the tangled part of the line |
| Crimson deep | `--gm-crimson-deep` | `#A81C28` | Vermilion **text** on any light surface |
| Crimson lift | `--gm-crimson-lift` | `#B01F2A` | Button hover |
| Flow (jade) | `--gm-flow` | `#0E7C6B` | The clear part of the line, "after" states, resolved scores, focus rings |
| On accent | `--gm-on-accent` | `#FFFFFF` | Text on crimson or jade |

`--gm-flow-text` (`#0A6B5C`, defined in `app/globals.css`) is the jade for **small text** (section tags, numbers, meta labels, the "after" markers). It is darker than `--gm-flow` so it holds contrast on mist and band as well; fills, lines and rings keep `--gm-flow`. Inside the sumi-dark contact band it is re-pointed to `#4FC3AE` (`.home-contact` in `app/home.css`).

**Measured contrast**, on paper / white / mist / band:

| Pair | Paper | White | Mist | Band |
|---|---:|---:|---:|---:|
| Muted `#4B4F5B` | 7.39 | 8.18 | 6.69 | 6.27 |
| Crimson deep `#A81C28` | 6.63 | 7.34 | 6.01 | 5.63 |
| Flow jade `#0E7C6B` | 4.61 | 5.10 | 4.18 | 3.92 |

So **small jade text uses `--gm-flow-text`**; plain `--gm-flow` on mist and band is for large text, lines, fills and icons. White on crimson is 5.6:1. Steel is for control borders (3:1). Line is 1.3-1.5:1, so decorative dividers only, never the only sign of a control.

**Vermilion budget.** One primary button in view, plus small rules, markers, hanko seals and chart points. Never a section background.

**Jade budget.** Jade means resolved. It marks after-states, focus and the clear end of the line, and it is never a button fill competing with the primary action.

**No glow at all.** Nothing glows, shines or has a coloured shadow, because there is no night for a light to stand out in. Depth comes from surface colour, hairlines and the odd soft paper shadow.

**One sumi-dark band moment.** The contact band is the only dark surface on the site (`--gm-ink-surface` with `--gm-on-dark` text), so the close of the page feels like ink on paper. No other section goes dark.

**Never colour alone.** Errors are a written message beside the field plus a heavier border. Selected tabs add weight as well as a rule, chart points carry labels, and scores use text.

## Typography

| Face | Role |
|---|---|
| **Big Shoulders Display** (700, 800; the display weight is now 700) | Hero, section headings, large figures. Set in capitals, like signage. Condensed, so long Hungarian words fit |
| **Figtree** (400–800) | All reading text, navigation, forms, buttons, card text, prices |
| **IBM Plex Mono** (400, 500) | Small labels only, such as `01 / IMPROVE` and metadata. Never for sentences |

All are self-hosted from `public/fonts`, and every subset includes Hungarian `ő` and `ű`. Figtree has no `↳`, so that glyph falls back to Plex Mono through the font stack. A two-glyph Japanese subset carries the 流れ sign and nothing else (the red hanko seal in the hero, and vertical sign blades).

| Use | Size |
|---|---:|
| Hero headline | 64–168 px (Hungarian 40–128 px), Big Shoulders 700, about .92 line height |
| Section heading | 48–96 px (Hungarian 40–84 px), Big Shoulders 700, about .96 line height |
| Card heading | 22–40 px, Figtree 700 (large feature cards may use Big Shoulders) |
| Lead paragraph | 18–21 px |
| Body | 16–17 px, line height at least 1.5 |
| Label | 12 px mono |

Capitals belong to Big Shoulders display lines and mono labels. Everything else is sentence case. Reading width is at most about 60 characters.

## Shape

- **The katana cut:** primary buttons, raised cards and image frames have one cut corner, top-right or bottom-right, cut at 45°. Size scales with the object: 10 px on a button, 22 px on a card. Other corners stay square.
- One radius does not rule everything: chips and inputs have 2 px, and circles are reserved for the flow mark and method markers.
- **Buttons paint their cut:** `.gm-cta` draws the corner with a background gradient rather than `clip-path`, so its focus ring can sit outside the shape. The ring stays outside because jade on crimson is under 3:1.
- **Cards and frames clip theirs:** they use `clip-path` with `--gm-cut`, which also clips outlines, so anything focusable inside them keeps its ring clear of the edge. New cards join the `:is()` list at the end of `globals.css`, which also redraws the border across the cut.
- No glow and no heavy shadows. Depth comes from surface colour, hairlines and, at most, a faint paper shadow.
- Buttons paint their cut with a gradient, so no glow is involved; the focus ring still sits outside the shape.

## Layout

- One clear focal point per section, with generous margins (`--gm-space`).
- A plain-language heading on every section.
- **The hero is a pale dawn:** an oversized headline over a pale dawn skyline (mist towers in soft blue-grey tints, a pagoda roofline), a thin red sun disc (hinomaru) behind the towers, the samurai standing at the right, and a **red 流れ hanko seal** (a square vermilion stamp) beside them. The flow line leaves the headline's underlined word ("admin", Hungarian "adminisztrációval") and runs out straight: a knotted vermilion SVG stroke under the word, then a straight vermilion-to-jade rule (`.home-tangles::after`) running to the right edge. On phones (up to 860 px) the order is headline, then the samurai and 流れ sign (`.home-hero-stage`), then the lead text and the one button; `.home-hero-copy` becomes `display: contents` so the stage can sit between them. Without `heroCity`, the hero rests on the skyline drawn in code (`NightCity` in `components/NightCity.tsx`, name kept; it also exports `FlowSamurai` and `HankoMark`, used by `app/page.tsx`). Its fills are inline hex so they hold whatever the stylesheet says.
- **Quiet washi frames for empty slots:** an unfilled content slot (`.gm-visual-quiet`, drawn by `VisualSlot`) is one 1 px hairline (ink at 14%) on a paper-to-mist tint, a tiny mono name label at the bottom and one faint sumi-e brush line. No dashed border, no brief or size text on the page; offer cards drop the border entirely. It keeps the ratio of the picture that will replace it.
- **Contact-band skyline:** the sumi band keeps a tone-on-tone skyline, `<NightCity tone="ink" />` (`InkCity` in `components/NightCity.tsx`): three steps just above the ink, pale hairline roof edges and seeded circuit traces (right-angle runs, square pads), no glow, no colour. It fades out upward by a mask; the default `tone="paper"` is the hero skyline.
- **Coordinates tag:** from 1240 px a small vertical mono line (`.home-coords`, "47.50° N · 19.04° E · flow") sits in the left gutter of the hero, `aria-hidden`, muted, 11 px. Hidden below 1240 px.
- **Washi touches:** a hairline above section headings, and small square hanko-style labels (vermilion on paper) for section numbers and tags. Thin circuit lines may join sections; they stay hairline and below the content.
- Hairlines and simple grids do the grouping. Cards only for content that is genuinely raised (offers, forms, the explorer, report findings).
- **Spacing floor:** related text sits at least 8 px apart (label to value, heading to its text at least 10 px), list rows have at least 11 px above and below, boxed text has at least 14 px of padding on small chips and 22 px in cards, and body text has a line height of at least 1.45. Phones shorten structure, never this spacing.
- Numbers only where order is real (method steps, next steps).
- Rhythm: paper hero → paper (problems) → band with backdrop (calculator) → paper with backdrop (method) → mist (scorecard) → paper (offers) → band fading to paper (person) → paper → sumi-dark band with backdrop to close (contact). Sections differ in shape so progress is visible.

## Visuals and placeholders

All generated and supplied art is listed in `data/visuals.ts` (slots V01-V12) and briefed in **[asset-prompts.md](asset-prompts.md)**, which holds a ready-to-paste prompt for each slot in the washi dawn style: light, matte, pale mist, sumi ink, one vermilion accent and, where something runs clear, one jade element.

- **Content slots** (V01 samurai, V03 portrait, V04 training photo, and the offer art V05 training, V06 workshop, V12 programme, V07 delivery) carry a `{{FILL: …}}` marker until the file exists, so `npm run check:launch` lists them and `components/VisualSlot.tsx` draws a labelled frame of the right shape (the quiet washi frame above). V03 uses `site.photo` and V04 is optional with `src: null`; the training photo is not on the homepage unless a file exists.
- **Backdrop slots** (V02 dawn city, V08 calculator, V09 method, V10 contact, V11 404) are optional atmosphere with `src: null`, placed with `VisualBackdrop`. Without a file the CSS atmosphere and the drawn skyline stand alone and the section is complete.
- **Optional new ideas N01-N04** (hanko seal mark, vertical 流れ brush sign, paper-texture tile, sumi-e flow-line brush stroke) are in `asset-prompts.md` only. They are not slots in `data/visuals.ts`; if one is used, add a backdrop slot with `src: null` or place the file in `public/art/`.
- **Real people stay real.** The portrait and team training image are real photographs, only graded to match (warm, light). Never generate a person or a client session and present it as real.

**Flow Samurai rules:** appears prominently once, in the hero. Calm and standing, **sword sheathed, no combat**, faceless. Matte sumi-black armour, brushed steel details and a single vermilion plate, softly lit from the left. A vector draft is kept in `docs/flow-samurai-draft.svg` for reference only (it predates the light look).

Diagrams still explain the work: the tangled-to-clear diagram in the method section is labelled and readable with motion off.

## Engagement

Interaction should let visitors find out something real, never pressure them.

- **Funnel order:** problem, their own number, method, free scorecard, paid offers, person, next steps, FAQ, contact. The free step comes before prices.
- **A primary action stays in reach:** sticky header on the homepage, a bottom bar on phones between the sections that already carry the action.
- **Show the outcome early:** the hours calculator uses only the visitor's inputs; the report preview comes from the real sample report and is labelled as a sample.
- **Show the person early:** name and credential in the hero, not at 60% of the page.
- **Never:** fake urgency, countdowns, invented numbers or social proof, analytics, or browser storage.

## Inner pages and footer

- **Sign blade:** a thin white vertical plate with a vermilion top edge and the 流れ glyphs set vertically, drawn as `::after` on the report header (`.sc-report-head`, top right) and on the 404 art (`.sc-404-art`, aligned to the page column). One per page, hidden under 950 px (report) or 620 px (404).
- **Footer** (`app/inner.css`): wordmark and tagline left, three link columns right behind a thin vertical hairline (dropped under 950 px), one horizontal hairline aligned to the shell. It is hidden on the focused flow pages and in print. Links are quiet muted text (44 px targets); hover and focus add ink colour, a vermilion underline on hover and the jade ring on focus.
- Sample banner content lines up with the page column.

## Interaction and motion

- **Hover:** at most a 1–2 px lift or a colour shift, gated by `(hover: hover) and (pointer: fine)`.
- **Press:** `scale(.97)` on buttons, 160 ms.
- **The one load moment, gentler now:** the headline steps in, the flow line draws from tangle to straight, the samurai frame opens, and the 流れ hanko seal settles once like a stamp. It happens once and rests. No flicker, no glow-up.
- **Answering motion:** the calculator figure glides to its value, explorer steps stagger from before to after, disclosures open smoothly, and opening a scorecard area lights up its score.
- **Scroll motion:** reveals once only, the method rail fills with the step being read, sample bars fill on view, and the nav marks the current section.
- **No endless loops**, no continuous flicker, no animated rain. The flow diagram plays for 12 seconds in view, then rests on a static picture.
- **Reduced motion:** everything is static and complete. Never hide content behind an animation.
- **Curve:** `--gm-ease` (`cubic-bezier(.23, 1, .32, 1)`). Name the properties; never `transition: all`.

## Accessibility and responsive quality

- Body text meets AA, and non-text controls meet 3:1 (use Steel, not Line, for control borders).
- Interactive targets are at least 44 px high. Keyboard focus is always visible, and a jade ring means focus everywhere.
- Small jade text uses `--gm-flow-text`, never plain `--gm-flow` (see the contrast table).
- Test at 320, 390, 768 and 1440 px, in both languages. Hungarian runs longer: the longest headline word must fit at 320 px, and small screens reduce button and header sizes rather than clipping.
- Informative visuals have text alternatives (localized); purely decorative motifs are `aria-hidden`.

## Writing

Use plain, specific language; short paragraphs; informative headings. Separate facts, interpretation and recommendations. No exaggerated AI claims, and no sci-fi role-play in the copy. Bracketed or `{{…}}` values are unresolved business information and are never invented or rendered.

English and Hungarian are equal first-class versions. Keep labels, buttons, charts, emails, PDFs and alt text localized together.

## Reports, PDFs and emails

**Print stays on paper, and the web is now paper too.** PDFs keep the light palette (`COLORS` in `chart-geometry.ts`): paper background, ink text, Figtree, crimson for chart points. Keep charts legible in grayscale print, and include a title, date and page numbers on multi-page files. Emails use system fonts and the same light colours, with a crimson primary button. The web report is light too: `WEB_COLORS` in `chart-geometry.ts` holds the washi dawn values (paper `#F6F3EE`, panel white, ink `#14161C`, crimson `#C8242E`, flow `#0E7C6B`), so web and PDF differ in layout, not palette.

## Design review checklist

- Is there one focal point per section, and is the flow line still the most memorable thing?
- Do vermilion and jade keep their meanings? Is anything glowing, shining or neon? (Nothing should.)
- Is the contact band the only dark surface, and is small jade text set in `--gm-flow-text`?
- Is the hero a pale dawn, with hinomaru disc, samurai and the red 流れ hanko seal, and no flicker on load?
- Does meaning survive without colour and without motion?
- Are "Lean Six Sigma" and "AI automation" easy to find in the copy?
- Is the samurai only in the hero, calm, with the sword sheathed?
- Does every interactive element tell the visitor something true?
- Is there anything decorative to remove before publishing?
- Do both languages work at 320 px?

## Source of truth in this repository

- `app/globals.css`: tokens, type, controls, scorecard styling.
- `app/home.css`: homepage composition, motifs and responsive rules. `app/inner.css`: flow, report, intake and legal layout.
- `data/visuals.ts`, `components/VisualSlot.tsx`, `docs/asset-prompts.md`: images, placeholders and prompts. `components/FlowMark.tsx`, `components/FlowArt.tsx`, `components/NightCity.tsx`: drawn artwork.
- `components/scorecard/ReportView.tsx`, `lib/pdf/ReportDocument.tsx`, `lib/scorecard/chart-geometry.ts`: report patterns and colours.
- `lib/email/templates.ts`: email colours.

If implementation and this document differ, verify which is current, then update this guide when a deliberate system change is made.
