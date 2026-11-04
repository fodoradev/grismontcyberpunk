# Grismont asset prompts

Everything to generate or shoot for the night shift look. Direction and rules are in [design-guideline.md](design-guideline.md). The slots are defined in `data/visuals.ts`.

## How to use this

1. Pick a slot below. Paste its **Prompt**, then the **Style block**, into your generator. Add the **Negative block** where the model has a negative field, or see [Model notes](#model-notes).
2. Generate several, pick the calmest, and grade it so the crimson and mint are close to the brand colours. Generators don't follow hex codes reliably.
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

**Transparency.** Only the samurai (V01) needs it, and it must be WebP with alpha, not a dark box. Most generators can't produce real transparency, so generate on a flat mid-grey background, remove the background, and check the edges on `#07060F` for a light fringe. Everything else is opaque.

**Dark enough to read.** Copy sits on top of the backdrops. In the area marked "copy" in each slot, keep the image close to `#07060F`, with nothing brighter than a dim haze. If in doubt, darken it. A dull image in a calm section beats unreadable copy.

**Real people stay real.** V03 and V04 are real photographs that only get graded. Never generate Attila, a team or a client session: the site presents those images as true.

## Style block

Paste this after every generated prompt:

```text
Cinematic night photograph, rain-wet city, faint sodium haze in the distance, deep indigo-black shadows close to #07060F. The only saturated light comes from two neon colours: hot crimson red #FF2E54 and cold mint green #35F0D8. Everything else is desaturated charcoal, silver and wet concrete. Restrained, quiet, mostly dark, large areas of empty shadow, one clear subject, realistic materials, shallow fog, fine film grain, anamorphic lens. No text anywhere.
```

## Negative block

```text
magenta and cyan colour scheme, purple neon, rainbow lighting, busy neon signs, crowded street, flying cars, holograms, perspective grid, circuit board patterns, chromatic aberration, glitch effects, text, letters, numbers, logos, watermarks, signature, gibberish signage, fake Japanese characters, drawn sword, raised sword, combat, fight, blood, weapons pointed, visible face on the samurai, people, oversaturated, plastic skin, video game render, illustration of a robot
```

V01 is a figure, so remove `people` from its negative block. V03 and V04 don't use these blocks at all.

## Model notes

| Model | Differences |
|---|---|
| **Midjourney** | Use each slot's suffix. Put the most important negatives in `--no`, comma-separated; long lists work worse, so the suffixes carry a short one. Paste the style block before the suffix. |
| **Flux** | Usually has no negative field. Leave out the negative block and rely on the style block, adding only each slot's **Flux** line. Long, plain descriptive sentences work best. Sizes must be multiples of 16. |
| **SDXL** | Put the negative block in the negative field. Generate at the slot's listed base size, then upscale. Avoid generating directly at the final size, because it repeats subjects. |
| **GPT-image** | No negative field, so end the prompt with "Avoid:" and the negative block in a sentence. If your model only offers fixed sizes, take the closest shape, then crop and upscale. It can return a transparent background for V01 if you ask for one. |

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
A calm samurai standing still, seen full length from the front at a slight angle, on a flat mid-grey studio background. The figure is faceless: a smooth dark charcoal mask under a deep hood, with no eyes or features. Layered charcoal cloth with subtle wave embroidery, fine silver mechanical details at the joints and shoulders, one single crimson armour plate on the chest that catches the light. The sword is sheathed at the hip, the hand relaxed and away from the hilt. A patient, unhurried posture, weight even on both feet. Rain beads on the cloth. Rim light in cold mint from the left and hot crimson from the right. Crisp edges, clean silhouette, nothing else in frame.
```

**Midjourney suffix:** `--ar 4:5 --style raw --s 100 --no drawn sword, combat, face, text, background objects`

- **Flux:** add "The sword stays in its scabbard. The mask has no face on it." Base size 960 × 1200.
- **SDXL:** base size 896 × 1152. Faces tend to appear, so also add `eyes, mouth, nose` to the negative field.
- **GPT-image:** ask for "transparent background" instead of the grey studio.

### V02: Night city (hero backdrop)

| | |
|---|---|
| **File** | `public/art/hero-city.webp` |
| **Size** | 2520 × 1080 px, 21:9 |
| **Slot** | `heroCity` (backdrop, optional) |
| **Appears** | Full-bleed behind the homepage hero |
| **Composition** | **Copy:** the left 60% holds the huge headline, so keep it almost black. The samurai stands at the right over the alley's vanishing point, so the right third can carry the depth. The site draws its own flow line in code, so the line here must stay thin, low and secondary |

**Prompt**

```text
A narrow rain-wet alley at night in an old industrial quarter, seen from low down, with the vanishing point in the right third of the frame. The left side of the image falls away into near-black brick and empty shadow. One single thin neon line runs along the wet ground and threads into the distance, hot crimson and kinked where it starts at the left, then straight and cold mint as it recedes. Its reflection lies in the puddles. Blank unlit sign panels on the walls, pipes and cables overhead, faint sodium haze at the far end. No people.
```

**Midjourney suffix:** `--ar 21:9 --style raw --s 120 --no people, text, signs with letters, magenta, flying cars`

- **Flux:** add "The left half of the image is almost entirely dark and empty." Base size 2016 × 864, then upscale.
- **SDXL:** base size 1536 × 640, then upscale.
- **GPT-image:** take the widest size, crop to 21:9, and upscale.
- **Alternative:** if the line competes with the one drawn in code, replace its sentence with "The wet ground reflects a faint glow, with no visible line."

### V03: Attila's portrait (real photo)

| | |
|---|---|
| **File** | `public/art/attila-portrait.webp` |
| **Size** | 960 × 1200 px, 4:5 |
| **Slot** | `portrait`, set through `photo` in `data/site.ts` (content, needed for launch) |
| **Appears** | Homepage about section, and small and round beside the name in the hero, so the face must also read at 52 px |
| **Composition** | Head and shoulders plus some of the work setting. Friendly, looking at the camera or at the work. Leave the head clear of the top edge |

**This is a real photograph. Do not generate it.** No style or negative block applies.

**To shoot:** an evening session at a real desk or whiteboard, with the room mostly dark. Use one soft, neutral key light on the face, a small crimson practical light on one side, and a small mint light behind. A strip light with a coloured gel or a phone screen is enough.

**To grade an existing photo:** lift the blacks toward indigo, cool and desaturate the background, and keep the skin tones natural.

**Prompt for an image editing tool, if needed.** Use it only to adjust colour, on an actual photo:

```text
Colour grade this photograph only. Do not change the person's face, expression, body, hair, clothing or the objects in the room. Do not add or remove anything. Darken and cool the background towards indigo-black, keep natural skin tones, and add a faint crimson light on one side and a faint mint light on the other.
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

**To grade:** as V03, gently. Deepen the shadows, cool the walls, and keep skin tones and the whiteboard legible.

**Prompt for an image editing tool, if needed.** Use it only to adjust colour, on an actual photo:

```text
Colour grade this photograph only. Do not change, add or remove any person, face, object or writing. Deepen the shadows towards indigo-black, cool and desaturate the walls, keep natural skin tones, and keep the whiteboard readable.
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
An empty training room at night seen from outside through a tall window streaked with rain. Inside, a large whiteboard holds a hand-drawn process sketched as boxes and arrows with no writing, one path traced in crimson marker and a cleaner path in mint. Rows of empty chairs in silhouette, a single low light over the board. Raindrops on the glass in sharp focus, the room softly out of focus behind them. No people.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 100 --no people, faces, text, letters, logos`

- **Flux:** add "The whiteboard holds only shapes and arrows, with no words." Base size 1200 × 800.
- **SDXL:** base size 1216 × 832.
- **GPT-image:** repeat "no words on the whiteboard" at the end, because it tends to add some.

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
A process map laid out on a dark wet stone table, seen from a steep angle above. The map is made of thin glowing threads running between small blank matte tiles. At the left the threads tangle and cross in hot crimson. Towards the right they are sorted into a single orderly path in cold mint. The threads light the table around them. Two empty chairs at the edge of the frame, in shadow. No people and nothing written on the tiles.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 120 --no people, hands, text, letters, numbers`

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
One clean machine line running through a dark, tidy workshop at night: a single conveyor and a row of plain brushed-steel units, seen in low perspective along its length. A thin strip of cold mint light runs the whole length of the line, reflected in the polished wet floor. Everything is in order, with cables neatly routed and nothing out of place. One small crimson indicator far along the line. Quiet and in use. No people.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 100 --no people, text, logos, robots, sparks`

- **Flux:** base size 1200 × 800.
- **SDXL:** base size 1216 × 832.

### V08: Stacked hours (calculator backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-calculator.webp` |
| **Size** | 1920 × 1080 px, 16:9 |
| **Slot** | `calcBackdrop` (backdrop, optional) |
| **Appears** | Behind the hours calculator on the homepage |
| **Composition** | **Copy:** the sliders and text are on the left half and the large figure on the right half, so the whole frame carries copy. It must be the darkest image in the set. Keep the detail low and towards the edges |

**Prompt**

```text
Tall stacks of old paper ledgers and folders in a dark storeroom, damp and slightly curled, seen from low down. Water drips on them from above. The stacks rise out of shadow at the far left and far right edges of the frame, leaving the middle almost black and empty. A faint hot crimson light grazes one side of the paper edges from out of frame. Very low contrast, heavy shadow. Blank paper with no writing visible.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 80 --no text, numbers, people, clocks`

- **Flux:** add "Most of the image is black." Base size 1920 × 1088, then crop.
- **SDXL:** base size 1344 × 768, then upscale.

### V09: Knot to fibre (method backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-method.webp` |
| **Size** | 1920 × 1080 px, 16:9 |
| **Slot** | `methodBackdrop` (backdrop, optional) |
| **Appears** | Behind the method section on the homepage |
| **Composition** | **Copy:** the steps run down the right half, so keep it dark. The knot sits at the lower left, behind the sticky heading and diagram, so it must stay dim. The fibre runs out of the knot towards the upper right, thin and faint |

**Prompt**

```text
A large knot of dark rubber cables on a wet concrete floor in the lower left of the frame, thick, heavy and matted, with a little hot crimson light caught inside the tangle. Out of the knot comes one single thin optical fibre, glowing cold mint, running in a clean straight line towards the upper right until it fades into darkness. The rest of the frame is empty black shadow. Low angle, very shallow depth of field.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 100 --no text, people, circuit board, multiple glowing lines`

- **Flux:** add "Only one line glows." Base size 1920 × 1088, then crop.
- **SDXL:** base size 1344 × 768, then upscale.

### V10: One lit window (contact backdrop)

| | |
|---|---|
| **File** | `public/art/backdrop-contact.webp` |
| **Size** | 2520 × 1080 px, 21:9 |
| **Slot** | `contactBackdrop` (backdrop, optional) |
| **Appears** | Behind the contact section, closing the homepage |
| **Composition** | **Copy:** the form and heading fill the left 60%, so keep it near-black. The lit window sits in the right third, above the contact details, as a quiet end point for the page |

**Prompt**

```text
A dark city skyline at night in steady rain, seen from a rooftop, with block after block of unlit buildings fading into low cloud. Far in the right third of the frame, one single window is lit in warm white with a faint mint edge, the only light in the city. A thin line of crimson far below on one street. The left side is almost black. Calm, late, quiet.
```

**Midjourney suffix:** `--ar 21:9 --style raw --s 100 --no text, people, flying cars, neon signs, many lit windows`

- **Flux:** add "Every other window is dark." Base size 2016 × 864, then upscale.
- **SDXL:** base size 1536 × 640, then upscale.
- **GPT-image:** take the widest size, crop to 21:9, and upscale.

### V11: Dead end (404)

| | |
|---|---|
| **File** | `public/art/not-found.webp` |
| **Size** | 1600 × 900 px, 16:9 |
| **Slot** | `notFound` (backdrop, optional) |
| **Appears** | The 404 page |
| **Composition** | **Copy:** the message and link sit on the left, so keep it dark. The wall and the end of the line are at the right |

**Prompt**

```text
A narrow rain-wet alley at night ending in a blank concrete wall on the right side of the frame. A single thin neon line runs along the wet ground in cold mint, then stops at the foot of the wall in a small crimson kink. Its reflection lies in a puddle. The left side falls into near-black. Empty and calm, not threatening. No people.
```

**Midjourney suffix:** `--ar 16:9 --style raw --s 100 --no text, numbers, 404, people, graffiti`

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
A long dark concrete corridor at night seen at a shallow angle, with eight identical blank rectangular light panels set into the wall, receding from left to right. The first panels glow hot crimson, the middle ones cool down, and the last panels glow cold mint. The light pools on a wet floor below them. Rain-streaked glass runs along the opposite side. The panels are completely blank. No people anywhere.
```

**Midjourney suffix:** `--ar 3:2 --style raw --s 120 --no people, text, letters, numbers, screens with content`

- **Flux:** add "Every panel is plain light with nothing on it." Base size 1200 × 800.
- **SDXL:** base size 1216 × 832. Add `text, numbers` to the negative field.

---

## Brand extras

These aren't slots in `data/visuals.ts`. Use them where noted.

### E01: Social share image

**File:** `public/art/og-image.png`, 1200 × 630 px. PNG or high-quality JPEG, because some social platforms handle WebP badly.

Keep the left 55% dark for a headline, which you add afterwards in a design tool using Big Shoulders Display. Don't let the generator write it. Canonical and social metadata wait until a production domain is chosen, so this file isn't wired in yet.

```text
A rain-wet alley at night from low down, the left half almost black and empty. On the right, a calm faceless figure in charcoal cloth stands small in the distance with a single crimson plate, sword sheathed at the hip. One thin neon line runs along the wet ground, kinked and crimson at the left, straight and cold mint towards the figure. No people other than the figure.
```

**Midjourney suffix:** `--ar 40:21 --style raw --s 100 --no text, logos, drawn sword, face`

### E02: App icon and social avatar

**File:** `public/art/app-icon.png`, 1024 × 1024 px.

Keep `app/icon.svg` as the browser favicon, because it stays sharp at 16 px. Use this version for social avatars and large icons. Check it at 32 px before using it: if the shape stops reading, simplify it. For this one, leave out the style block's rain and city wording.

```text
A single circular neon tube on a flat matte near-black background #07060F, centred, seen straight on. The circle begins hot crimson and kinked into a small tangle at the lower left, then runs smooth and cold mint around the rest of the ring. Soft light on the wall behind it. Simple, geometric, bold. Nothing else in the frame, no text.
```

**Midjourney suffix:** `--ar 1:1 --style raw --s 60 --no text, letters, extra shapes`

### E03: Rain tile

**File:** `public/art/tile-rain.webp`, 1024 × 1024 px, seamless. For a CSS overlay, use at low strength.

Use Midjourney's `--tile`, or an SDXL tiling option. Check the seams by placing it in a 2 × 2 grid. The guide bans animated rain, so this stays still.

```text
Fine diagonal rain streaks on a pure black background, thin soft silver-grey lines of varied length, sparse and even, no focal point, no objects. Seamless repeating texture.
```

**Midjourney suffix:** `--tile --ar 1:1 --style raw --s 50 --no objects, text, colour`

### E04: Grain tile

**File:** `public/art/tile-grain.webp`, 512 × 512 px, seamless.

This is more reliable made directly than generated:

```sh
magick -size 512x512 xc:gray50 -attenuate 0.35 +noise Gaussian -colorspace Gray public/art/tile-grain.webp
```

If you do generate it:

```text
Fine monochrome film grain, even mid-grey, no pattern, no objects. Seamless repeating texture.
```

**Midjourney suffix:** `--tile --ar 1:1 --style raw --s 0 --no objects, text, colour`

### E05: 流れ sign plate

**File:** `public/art/sign-plate.webp`, 600 × 1600 px, 3:8. Static, for social posts or a hero variant.

Generators garble Japanese, so don't ask for the characters. Generate the blank plate, then add 流れ yourself in a design tool using the subset in `public/fonts`, with a crimson glow. The site's own hero sign is drawn in code, so this file is optional.

```text
A vertical wall-mounted sign plate on a wet dark brick wall at night, seen straight on, tall and narrow. Brushed dark steel with bare unlit glass tube mounts and visible brackets, rain running down it, completely blank. A faint crimson glow on the bricks around its edges, as if the sign had just been lit. No characters, letters or symbols.
```

**Midjourney suffix:** `--ar 3:8 --style raw --s 80 --no text, letters, characters, symbols`

---

## Checklist

| ID | Asset | File | Size | Method | Needed for launch | Status |
|---|---|---|---|---|---|---|
| V01 | Flow Samurai | `flow-samurai.webp` | 960 × 1200 | Generate, cut out | Yes | Open |
| V02 | Night city | `hero-city.webp` | 2520 × 1080 | Generate | No | Open |
| V03 | Attila's portrait | `attila-portrait.webp` | 960 × 1200 | **Real photo**, grade | Yes | Open |
| V04 | Team training | `team-training.webp` | 1600 × 900 | **Real photo**, grade | Yes | Open |
| V05 | Training offer | `offer-training.webp` | 1200 × 800 | Generate | Yes | Open |
| V06 | Workshop offer | `offer-workshop.webp` | 1200 × 800 | Generate | Yes | Open |
| V07 | Delivery offer | `offer-delivery.webp` | 1200 × 800 | Generate | Yes | Open |
| V08 | Stacked hours | `backdrop-calculator.webp` | 1920 × 1080 | Generate | No | Open |
| V09 | Knot to fibre | `backdrop-method.webp` | 1920 × 1080 | Generate | No | Open |
| V10 | One lit window | `backdrop-contact.webp` | 2520 × 1080 | Generate | No | Open |
| V11 | Dead end | `not-found.webp` | 1600 × 900 | Generate | No | Open |
| V12 | Programme offer | `offer-programme.webp` | 1200 × 800 | Generate | Yes | Open |
| E01 | Social share image | `og-image.png` | 1200 × 630 | Generate, add type | No | Open |
| E02 | App icon | `app-icon.png` | 1024 × 1024 | Generate | No | Open |
| E03 | Rain tile | `tile-rain.webp` | 1024 × 1024 | Generate | No | Open |
| E04 | Grain tile | `tile-grain.webp` | 512 × 512 | Command | No | Open |
| E05 | 流れ sign plate | `sign-plate.webp` | 600 × 1600 | Generate, add type | No | Open |
