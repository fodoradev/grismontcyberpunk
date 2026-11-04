# Grismont asset prompts

Everything to generate or shoot for the washi dawn look: a bright, quiet, Japanese-futurist city at first light, warm paper whites, sumi ink, one calm vermilion accent and a deep jade for work that runs clear. Direction and rules are in [design-guideline.md](design-guideline.md). The slots are defined in `data/visuals.ts`.

## How to use this

1. Pick a slot below. Paste its **Prompt**, then the **Style block**, into your generator. Add the **Negative block** where the model has a negative field, or see [Model notes](#model-notes).
2. Generate several, pick the calmest, and grade it so the paper, ink, vermilion and jade are close to the brand colours (`#F6F3EE`, `#14161C`, `#C8242E`, `#0E7C6B`). Generators don't follow hex codes reliably.
3. Export to WebP at the listed size and save it under `public/art/` with the listed name:
   ```sh
   cwebp -q 80 input.png -o public/art/hero-city.webp
   ```
4. Turn it on in `data/visuals.ts` by setting the slot's `src` to its `file` path:
   ```ts
   src: "/art/hero-city.webp",
   ```
   Content slots currently hold a `{{FILL: …}}` marker, which is replaced by the path. Backdrops hold `null`. The portrait is the exception: its `src` comes from `photo` in `data/site.ts`, so set it there.
5. Run `npm run check:launch`. It lists the content slots still missing. Backdrops never block launch, because each section is complete without one.

**File size targets**

| Type | Target |
|---|---|
| 21:9 backdrops | under 350 KB |
| 16:9 backdrops | under 250 KB |
| Samurai, portrait | under 220 KB |
| Offer art | under 160 KB |
| Tiles, marks | under 60 KB |

**Transparency.** Only the samurai (V01) and the optional marks (N01, N02, N04) need it, and they must be WebP (or SVG) with alpha, not a pale box. Most generators can't produce real transparency, so generate on a flat mid-grey background, remove the background, and check the edges on `#F6F3EE` and on white for a dark or grey fringe. Everything else is opaque.

**Light enough to read.** Copy sits on top of the backdrops and is dark sumi ink. In the area marked "copy" in each slot, keep the image close to `#F6F3EE`, with nothing darker than a faint grey-blue haze or a hairline. If in doubt, lighten it and add more empty space (ma). A pale, calm image beats a busy one. Check the exported file by placing the real headline over it at the real size.

**Real people stay real.** V03 and V04 are real photographs that only get graded. Never generate Attila, a team or a client session: the site presents those images as true.

## Style block

Paste this after every generated prompt:

```text
Architectural photograph at dawn, a bright Tokyo-futurist city in soft mist with Japanese minimalism and generous ma (negative space). Warm washi paper whites close to #F6F3EE, sumi ink charcoal close to #14161C, soft grey-blue haze. One single calm vermilion accent, hinomaru red close to #C8242E, used sparingly; a deep jade close to #0E7C6B only where something is clear or resolved. Matte materials, thin precise lines with ukiyo-e and sumi-e line quality blended with clean futurist industrial design, soft diffused light with no glow and no bloom, gentle long shadows, fine paper grain. Calm, light, airy, one clear subject, wide empty areas kept free for copy. No text anywhere.
```

## Negative block

```text
neon, glow, bloom, lens flare, dark moody night scene, black background, cyberpunk, magenta, cyan, purple, violet, teal and orange grade, rainbow lighting, busy signs, crowded street, flying cars, holograms, perspective grid, circuit board patterns, chromatic aberration, glitch effects, rain-wet streets, text, letters, numbers, logos, watermarks, signature, gibberish signage, fake Japanese characters, drawn sword, raised sword, combat, fight, blood, weapons pointed, visible face on the samurai, people, oversaturated, plastic skin, video game render, anime style, illustration of a robot, cherry blossom clichés, geisha, kitsch
```

V01 is a figure, so remove `people` from its negative block. V03 and V04 don't use these blocks at all.

## Model notes

| Model | Differences |
|---|---|
| **Midjourney** | Use each slot's suffix. Put the most important negatives in `--no`, comma-separated; long lists work worse, so the suffixes carry a short one. Paste the style block before the suffix. `--style raw` keeps the look photographic and matte. |
| **Flux** | Usually has no negative field. Leave out the negative block and rely on the style block, adding only each slot's **Flux** line. Long, plain descriptive sentences work best. Say "soft overcast light, no glow" in words. Sizes must be multiples of 16. |
| **SDXL** | Put the negative block in the negative field. Generate at the slot's listed base size, then upscale. Avoid generating directly at the final size, because it repeats subjects. Add `neon, glow, night` to the negative field even if you trim the rest. |
| **GPT-image** | No negative field, so end the prompt with "Avoid:" and the negative block in a sentence. If your model only offers fixed sizes, take the closest shape, then crop and upscale. It tends to add glow and extra colour: say "matte, no glow, only these four colours". It can return a transparent background for V01 if you ask for one. |

---

## Slots

### V01: Flow Samurai

| | |
|---|---|
| **File** | `public/art/flow-samurai.webp` |
| **Size** | 960 × 1200 px, 4:5, transparent background |
| **Slot** | `samurai` (content, needed for launch) |
| **Appears** | Homepage hero, standing at the right. The only prominent appearance of the character |
| **Composition** | Full figure, centred, head near the top edge with a little room. Copy sits to the left of the frame, not on it. The flow line may run behind the figure at hip height, so keep the silhouette clean there |

**Prompt**

```text
A calm samurai standing still, seen full length from the front at a slight angle, on a flat mid-grey studio background for later cut-out. The figure is faceless: a smooth matte sumi-black mask under a plain kabuto-style helmet, with no eyes or features. Matte sumi-black lacquered armour in clean layered plates with a restrained futurist cut, brushed-steel details at the joints, shoulders and cord ties, plain woven charcoal cloth beneath. One single vermilion armour plate on the chest, the only colour on the figure. The katana is sheathed at the left hip, the hand relaxed and well away from the hilt. A patient, unhurried posture, weight even on both feet. Soft diffused light from the left, a gentle shadow side on the right, no rim glow, no reflections of colour. Crisp edges, clean silhouette, nothing else in frame.
```

**Midjourney suffix:** `--ar 4:5 --style raw --s 100 --no drawn sword, combat, face, glow, neon, text, background objects`

- **Flux:** add "The sword stays in its scabbard. The mask has no face on it. There is no glow." Base size 960 × 1200.
- **SDXL:** base size 896 × 1152. Faces tend to appear, so also add `eyes, mouth, nose` to the negative field.
- **GPT-image:** ask for "transparent background" instead of the grey studio.
- **Check:** edges on `#F6F3EE` and on white. A dark halo means the cut-out is too tight; erode the mask by 1 px.

### V02: Dawn city (hero backdrop)

| | |
|---|---|
| **File** | `public/art/hero-city.webp` |
| **Size** | 2520 × 1080 px, 21:9 |
| **Slot** | `heroCity` (backdrop, optional) |
| **Appears** | Full-bleed behind the homepage hero |
| **Composition** | **Copy:** the left 60% holds the huge headline, so keep it almost pure paper white with a whisper of haze. The samurai stands at the right over the street's vanishing point, so the right third can carry the depth. The site draws its own flow line in code, so any line here must stay thin, low and secondary |

**Prompt**

```text
A quiet street in a Tokyo-futurist quarter at dawn, seen at eye level with the vanishing point in the right third of the frame. Pale low buildings of white concrete, pale timber and frosted glass with clean horizontal lines, shoji-like screens in the facades, a few paper lanterns that are simply objects, not glowing. Soft grey-blue mist fills the far end of the street, and a single small vermilion torii stands far away in it. One thin sumi-ink line runs along the ground and recedes into the distance, slightly kinked near the left, then straight. The left 60% of the image dissolves into near-white washi-toned haze and empty pavement. Soft diffused morning light, no glow. No people.
```

**Midjourney suffix:** `--ar 21:9 --style raw --s 120 --no people, text, signs with letters, neon, glow, night, magenta, flying cars`

- **Flux:** add "The left half of the image is almost entirely pale, soft and empty." Base size 2016 × 864, then upscale.
- **SDXL:** base size 1536 × 640, then upscale.
- **GPT-image:** take the widest size, crop to 21:9, and upscale.
- **Alternative:** if the line competes with the one drawn in code, replace its sentence with "The ground is plain, with no line."

### V03: Attila's portrait (real photo)

| | |
|---|---|
| **File** | `public/art/attila-portrait.webp` |
| **Size** | 960 × 1200 px, 4:5 |
| **Slot** | `portrait`, set through `photo` in `data/site.ts` (content, needed for launch) |
| **Appears** | Homepage about section, and small and round beside the name in the hero, so the face must also read at 52 px |
| **Composition** | Head and shoulders plus some of the work setting. Friendly, looking at the camera or at the work. Leave the head clear of the top edge |

**This is a real photograph. Do not generate it.** No style or negative block applies.

**To shoot:** a morning session at a real desk or whiteboard in a bright room, near a window. Use soft, neutral daylight on the face and a pale wall behind. A small touch of vermilion in the scene (a notebook, a sticker) is welcome but not required. Avoid coloured gels and mixed colour light.

**To grade an existing photo:** lift the shadows, warm the whites toward `#F6F3EE`, cool and gently desaturate the background, and keep the skin tones natural.

**Prompt for an image editing tool, if needed.** Use it only to adjust colour, on an actual photo:

```text
Colour grade this photograph only. Do not change the person's face, expression, body, hair, clothing or the objects in the room. Do not add or remove anything. Brighten the image gently, warm the whites towards a soft paper tone, cool and slightly desaturate the background towards grey-blue, keep natural skin tones, and add no glow and no coloured light.
```

### V04: Team training (real photo)

| | |
|---|---|
| **File** | `public/art/team-training.webp` |
| **Size** | 1600 × 900 px, 16:9 |
| **Slot** | `training` (content, needed for launch) |
| **Appears** | Not on the homepage right now, because the offer cards use V05, V06, V07 and V12. `check:launch` still lists the slot |
| **Composition** | People and a visible process map, wide enough to crop. Keep the subject in the vertical centre. Copy sits beside it, not on it |

**This is a real photograph of a real session. Do not generate it.** Get consent from everyone recognisable before publishing. If you don't have a photo yet, leave the slot open.

**To grade:** as V03, gently. Lift the shadows, warm the walls to paper white, and keep skin tones and the whiteboard legible.

**Prompt for an image editing tool, if needed.** Use it only to adjust colour, on an actual photo:

```text
Colour grade this photograph only. Do not change, add or remove any person, face, object or writing. Lift the shadows, warm the walls towards a soft paper white, cool the shadows slightly towards grey-blue, keep natural skin tones, and keep the whiteboard readable. No glow, no coloured light.
```

### V05: Training offer

| | |
|---|---|
| **File** | `public/art/offer-training.webp` |
| **Size** | 1200 × 800 px, 3:2 |
| **Slot** | `offerTraining` (content, needed for launch) |
| **Appears** | Training offer on the homepage |
| **Composition** | Copy sits outside the image. The subject stays central enough to survive a crop to 16:7 |

**Prompt**

```text
An empty training room in soft morning light, seen through an open shoji doorway. Pale tatami floor, low pale timber benches in tidy rows, a large paper screen at the far end on which a process is drawn in fine sumi ink as boxes and arrows with no writing: one tangled path traced in a single vermilion line, and a clean straight path in deep jade. Light enters from the left through paper panels and falls in long, soft, diffused bands. The doorframe in the foreground is crisp and thin, the room behind it slightly softer. Wide quiet floor in the lower half. No people.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 100 --no people, faces, text, letters, logos, glow, neon`

- **Flux:** add "The paper screen holds only shapes and arrows, with no words." Base size 1200 × 800.
- **SDXL:** base size 1216 × 832.
- **GPT-image:** repeat "no words on the screen" at the end, because it tends to add some.

### V06: Workshop offer

| | |
|---|---|
| **File** | `public/art/offer-workshop.webp` |
| **Size** | 1200 × 800 px, 3:2 |
| **Slot** | `offerWorkshop` (content, needed for launch) |
| **Appears** | Workshops offer on the homepage |
| **Composition** | Top-down or steep angle, with threads filling the middle. Copy sits outside the image |

**Prompt**

```text
A process map laid out on a pale washi-paper table, seen from a steep angle above in soft daylight. The map is made of fine sumi-ink threads running between small blank matte paper tiles with thin edges. At the left the threads tangle and cross, one of them in vermilion. Towards the right they are sorted into a single orderly path, the last stretch in deep jade. A brush, an ink stone and a small brushed-steel weight rest at the table's edge as quiet props. Generous empty paper around the map. Two empty low stools at the frame's edge. No people and nothing written on the tiles.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 120 --no people, hands, text, letters, numbers, glow, neon`

- **Flux:** add "The tiles are completely blank." Base size 1200 × 800.
- **SDXL:** base size 1216 × 832. Add `hands` to the negative field.

### V07: Delivery offer

| | |
|---|---|
| **File** | `public/art/offer-delivery.webp` |
| **Size** | 1200 × 800 px, 3:2 |
| **Slot** | `offerDelivery` (content, needed for launch) |
| **Appears** | Delivery offer on the homepage |
| **Composition** | One strong diagonal or a central vanishing line. Copy sits outside the image |

**Prompt**

```text
One clean machine line running through a bright, tidy workshop in morning light: a single conveyor and a row of plain matte white and brushed-steel units with rounded corners, seen in low perspective along its length. Pale timber floor, tall frosted windows on the left throwing soft diffused light. Cables neatly routed, everything in order and nothing out of place. One tiny deep-jade indicator far along the line, and one small vermilion marker at the near end. Quiet, in use, plenty of empty floor. No people.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 100 --no people, text, logos, robots, sparks, glow, neon`

- **Flux:** base size 1200 × 800.
- **SDXL:** base size 1216 × 832.

### V08: Stacked hours (calculator backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-calculator.webp` |
| **Size** | 1920 × 1080 px, 16:9 |
| **Slot** | `calcBackdrop` (backdrop, optional) |
| **Appears** | Behind the hours calculator on the homepage |
| **Composition** | **Copy:** the sliders and text are on the left half and the large figure on the right half, so the whole frame carries copy. It must be the palest image in the set. Keep the detail low and towards the edges |

**Prompt**

```text
Tall stacks of paper ledgers, folders and bound documents in a pale room in morning light, seen from low down. The stacks rise at the far left and far right edges of the frame, softly out of focus, with thin pale-timber shelves. Low sun from the left lays soft long shadows across the floor. The middle of the frame is empty washi-toned wall and floor, almost pure #F6F3EE. A single vermilion ribbon tied round one stack, the only colour. Very low contrast, airy. Blank paper with no writing visible.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 80 --no text, numbers, people, clocks, glow, dark`

- **Flux:** add "Most of the image is pale and empty." Base size 1920 × 1088, then crop.
- **SDXL:** base size 1344 × 768, then upscale.

### V09: Knot to fibre (method backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-method.webp` |
| **Size** | 1920 × 1080 px, 16:9 |
| **Slot** | `methodBackdrop` (backdrop, optional) |
| **Appears** | Behind the method section on the homepage |
| **Composition** | **Copy:** the steps run down the right half, so keep it pale. The knot sits at the lower left, behind the sticky heading and diagram, so it must stay soft and low in contrast. The line runs out of the knot towards the upper right, thin and faint |

**Prompt**

```text
A large knot of thick sumi-black cord resting on pale washi paper in the lower left of the frame, matte and heavy, with a single vermilion strand woven through the tangle. Out of the knot comes one thin cord that straightens into a clean, perfectly straight line of deep jade running towards the upper right until it fades into the paper. The rest of the frame is empty warm white paper with a barely visible fibre texture. Overhead, soft diffused daylight, a gentle shadow under the knot. Very shallow depth of field.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 100 --no text, people, circuit board, multiple coloured lines, glow, neon`

- **Flux:** add "Only one line is jade." Base size 1920 × 1088, then crop.
- **SDXL:** base size 1344 × 768, then upscale.

### V10: One red lantern (contact backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-contact.webp` |
| **Size** | 2520 × 1080 px, 21:9 |
| **Slot** | `contactBackdrop` (backdrop, optional) |
| **Appears** | Behind the contact section, closing the homepage |
| **Composition** | **Copy:** the form and heading fill the left 60%, so keep it near-white haze. The lantern-window sits in the right third, above the contact details, as a quiet end point for the page |

**Prompt**

```text
A pale Tokyo-futurist skyline at dawn, seen from a rooftop, with block after block of white and soft grey-blue buildings fading into low mist. Clean slim towers and low timber-and-concrete houses, thin horizontal lines, a distant ridge in haze. Far in the right third of the frame, one single window holds a small vermilion paper lantern, calm and matte, with no glow. Every other window is plain and unlit. The left 60% is almost pure washi-white mist. Soft, quiet, first light.
```

**Midjourney suffix:** `--ar 21:9 --style raw --s 100 --no text, people, flying cars, neon signs, glow, many red lanterns, night`

- **Flux:** add "Every other window is plain, and the lantern does not glow." Base size 2016 × 864, then upscale.
- **SDXL:** base size 1536 × 640, then upscale.
- **GPT-image:** take the widest size, crop to 21:9, and upscale.

### V11: Dead end (404)

| | |
|---|---|
| **File** | `public/art/not-found.webp` |
| **Size** | 1600 × 900 px, 16:9 |
| **Slot** | `notFound` (backdrop, optional) |
| **Appears** | The 404 page |
| **Composition** | **Copy:** the message and link sit on the left, so keep it pale and empty. The wall and the end of the line are at the right |

**Prompt**

```text
A narrow pale lane at dawn between white plaster walls and pale timber, ending in a plain blank wall on the right side of the frame. A single thin sumi-ink line runs along the ground and stops at the foot of the wall in one small vermilion kink. Soft grey-blue mist, soft diffused light, a faint shadow of the lane's eaves. The left side dissolves into near-white haze. Empty and calm, not threatening. No people.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 100 --no text, numbers, 404, people, graffiti, glow, night`

- **Flux:** base size 1600 × 896.
- **SDXL:** base size 1344 × 768, then upscale.

### V12: Programme offer

| | |
|---|---|
| **File** | `public/art/offer-programme.webp` |
| **Size** | 1200 × 800 px, 3:2 |
| **Slot** | `offerProgramme` (content, needed for launch) |
| **Appears** | Improvement programme offer on the homepage |
| **Composition** | Panels recede from left to right, so the eye follows the sequence. Copy sits outside the image |

**Prompt**

```text
A long pale corridor in morning light seen at a shallow angle, with eight identical tall blank paper panels in slim timber frames set into the wall, receding from left to right like a row of shoji. Each panel is softly backlit by diffused daylight with no glow. A single thin line of colour marks the base of each panel: the first is vermilion, the middle ones fade through warm grey, and the last is deep jade. Pale tatami and timber floor, a window of frosted glass along the opposite side. The panels are completely blank. No people anywhere.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 120 --no people, text, letters, numbers, screens with content, glow, neon`

- **Flux:** add "Every panel is plain paper with nothing on it." Base size 1200 × 800.
- **SDXL:** base size 1216 × 832. Add `text, numbers` to the negative field.

---

## Optional new ideas

These aren't slots in `data/visuals.ts` and nothing references them yet. If one gets used, add a slot with `src: null` (backdrop kind) so nothing breaks, or place the file directly in `public/art/`.

### N01: Hanko seal mark

**File:** `public/art/hanko.webp`, 512 × 512 px, transparent. Or draw it as an SVG, which is sharper at 16 px.

A small red stamp for sign-offs, the end of the report, section markers or the placeholder corner. Generators garble characters, so ask for the blank seal and add a simple mark (a square with a cut corner, or the 流 glyph from the font subset) yourself.

```text
A square vermilion hanko seal impression, #C8242E, slightly imperfect hand-carved edges and soft ink texture, with a blank inner area and one clean cut corner, on a flat mid-grey background for cut-out. Matte, flat, centred, no glow, no characters, no text.
```

**Midjourney suffix:** `--ar 1:1 --style raw --s 50 --no text, characters, letters, glow, shadow`

### N02: Vertical 流れ brush sign

**File:** `public/art/sign-ryu.webp`, 600 × 1600 px, 3:8, transparent. Static, for social posts or a hero variant. It replaces the old dark sign plate.

Generators garble Japanese, so don't ask for the characters. Generate the blank vertical scroll or wooden plaque, then set 流れ yourself in sumi ink using the subset in `public/fonts`, or brush it by hand.

```text
A tall narrow vertical hanging scroll sign on a pale wall, seen straight on. Warm washi paper with soft deckled edges, a thin dark sumi border, brushed-steel top and bottom rods, a single vermilion cord. Soft diffused light from the left, gentle shadow, matte, completely blank in the middle with generous empty space. No characters, letters or symbols, no glow.
```

**Midjourney suffix:** `--ar 3:8 --style raw --s 80 --no text, letters, characters, symbols, glow, neon`

### N03: Paper-texture tile

**File:** `public/art/tile-washi.webp`, 1024 × 1024 px, seamless. Very low strength under a CSS overlay (about 4 to 8% opacity) to give the page a printed feel.

Use Midjourney's `--tile`, or an SDXL tiling option. Check the seams by placing it in a 2 × 2 grid. Keep contrast tiny: the paper must stay near `#F6F3EE`.

```text
Seamless texture of fine warm washi paper, #F6F3EE, with faint long plant fibres and a very subtle uneven tone, no pattern, no marks, no objects, flat even light, extremely low contrast. Seamless repeating texture.
```

**Midjourney suffix:** `--tile --ar 1:1 --style raw --s 30 --no objects, text, colour, shadows, creases`

If you prefer to make it directly:

```sh
magick -size 512x512 xc:'#F6F3EE' -attenuate 0.12 +noise Gaussian -blur 0x0.6 public/art/tile-washi.webp
```

### N04: Sumi-e flow-line brush stroke

**File:** `public/art/flow-stroke.webp`, 2400 × 400 px, 6:1, transparent. A horizontal divider or a hero accent. It should start with a loose, tangled loop at the left and end as one calm, confident straight stroke. Ink in `#14161C`, with at most one small vermilion dot at the tangle.

```text
A single horizontal sumi-e ink brush stroke on a flat mid-grey background for cut-out: at the left a loose tangled loop drawn in dry-brush charcoal ink, which resolves into one smooth, confident, perfectly straight stroke running to the right and tapering to a fine point. Natural ink texture and slight dry-brush edge, matte, soft. One tiny vermilion dot at the knot. No text, no splashes, no glow, no background elements.
```

**Midjourney suffix:** `--ar 6:1 --style raw --s 60 --no text, splashes, glow, landscape, characters`

An SVG redraw is better for the final version, so the stroke stays crisp at any width. Use the generated stroke as a reference.

---

## Brand extras

These aren't slots in `data/visuals.ts`. Use them where noted.

### E01: Social share image

**File:** `public/art/og-image.png`, 1200 × 630 px. PNG or high-quality JPEG, because some social platforms handle WebP badly.

Keep the left 55% pale for a headline, which you add afterwards in a design tool using Big Shoulders Display in sumi ink. Don't let the generator write it. Canonical and social metadata wait until a production domain is chosen, so this file isn't wired in yet.

```text
A pale dawn lane in a Tokyo-futurist quarter, seen from low down, the left half almost pure paper white mist and empty. On the right, a calm faceless figure in matte sumi-black armour with a single vermilion plate stands small in the distance, katana sheathed at the left hip. One thin ink line runs along the ground, kinked at the left, straight towards the figure. Soft diffused light, no glow. No people other than the figure.
```

**Midjourney suffix:** `--ar 40:21 --style raw --s 100 --no text, logos, drawn sword, face, glow, neon, night`

### E02: App icon and social avatar

**File:** `public/art/app-icon.png`, 1024 × 1024 px.

Keep `app/icon.svg` as the browser favicon, because it stays sharp at 16 px. Use this version for social avatars and large icons. Check it at 32 px before using it: if the shape stops reading, simplify it. For this one, leave out the style block's city wording.

```text
A single ink enso circle brushed in matte sumi black on a flat warm washi-white background #F6F3EE, centred, seen straight on. The circle begins as a small vermilion tangle at the lower left, then runs smooth and even in black around the rest of the ring. Simple, geometric, bold, with generous empty space. Nothing else in the frame, no text, no glow.
```

**Midjourney suffix:** `--ar 1:1 --style raw --s 60 --no text, letters, extra shapes, glow`

---

## Checklist

| ID | Asset | File | Size | Method | Needed for launch | Status |
|---|---|---|---|---|---|---|
| V01 | Flow Samurai | `flow-samurai.webp` | 960 × 1200 | Generate, cut out | Yes | Open |
| V02 | Dawn city | `hero-city.webp` | 2520 × 1080 | Generate | No | Open |
| V03 | Attila's portrait | `attila-portrait.webp` | 960 × 1200 | **Real photo**, grade | Yes | Open |
| V04 | Team training | `team-training.webp` | 1600 × 900 | **Real photo**, grade | Yes | Open |
| V05 | Training offer | `offer-training.webp` | 1200 × 800 | Generate | Yes | Open |
| V06 | Workshop offer | `offer-workshop.webp` | 1200 × 800 | Generate | Yes | Open |
| V07 | Delivery offer | `offer-delivery.webp` | 1200 × 800 | Generate | Yes | Open |
| V08 | Stacked hours | `backdrop-calculator.webp` | 1920 × 1080 | Generate | No | Open |
| V09 | Knot to fibre | `backdrop-method.webp` | 1920 × 1080 | Generate | No | Open |
| V10 | One red lantern | `backdrop-contact.webp` | 2520 × 1080 | Generate | No | Open |
| V11 | Dead end | `not-found.webp` | 1600 × 900 | Generate | No | Open |
| V12 | Programme offer | `offer-programme.webp` | 1200 × 800 | Generate | Yes | Open |
| N01 | Hanko seal mark | `hanko.webp` | 512 × 512 | Generate or SVG | No | Idea |
| N02 | Vertical 流れ brush sign | `sign-ryu.webp` | 600 × 1600 | Generate, add type | No | Idea |
| N03 | Paper-texture tile | `tile-washi.webp` | 1024 × 1024 | Generate or command | No | Idea |
| N04 | Sumi-e flow-line stroke | `flow-stroke.webp` | 2400 × 400 | Generate, redraw as SVG | No | Idea |
| E01 | Social share image | `og-image.png` | 1200 × 630 | Generate, add type | No | Open |
| E02 | App icon | `app-icon.png` | 1024 × 1024 | Generate | No | Open |
