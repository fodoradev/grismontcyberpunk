/**
 * "Washi dawn" skyline: pale mist towers in soft blue-grey tints, a thin red sun, a torii and a pagoda roofline.
 * Drawn, not generated, so a band has its city before (or without) a backdrop image. Seeded, so server output is stable.
 * Fills are inline styles so they hold whatever the stylesheet says about `.home-city-*`.
 */
type Tower = { x: number; y: number; w: number; kind: number };

const FAR = "#D9DDE3";
const MID = "#C4CAD3";
const NEAR = "#AEB6C2";
const SUMI = "#14161C";
const RED = "#C8242E";
const STEEL = "#77746C";

function towers(seed: number, count: number, min: number, max: number) {
  let s = seed;
  const next = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const list: Tower[] = [];
  let x = -20;
  for (let i = 0; i < count && x < 1620; i++) {
    const w = 40 + next() * 84;
    // The headline sits on the left: keep that side low and quiet, let the skyline rise to the right.
    const rise = x < 620 ? 0.3 : x < 900 ? 0.3 + ((x - 620) / 280) * 0.7 : 1;
    const y = 420 - (min + next() * (max - min)) * rise;
    list.push({ x, y, w, kind: Math.floor(next() * 4) });
    x += w + next() * 5;
  }
  return list;
}

/** Roofline for one tower: plain, stepped crown, slanted roof or antenna mast. */
function outline(t: Tower) {
  const { x, y, w } = t;
  const b = 420;
  if (t.kind === 1) return `M${x} ${b} V${y + 14} H${x + w * 0.2} V${y} H${x + w * 0.8} V${y + 14} H${x + w} V${b} Z`;
  if (t.kind === 2) return `M${x} ${b} V${y + 16} L${x + w} ${y} V${b} Z`;
  return `M${x} ${b} V${y} H${x + w} V${b} Z`;
}

function Layer({ list, fill, masts }: { list: Tower[]; fill: string; masts?: boolean }) {
  return (
    <g style={{ fill }}>
      {list.map(t => <path key={t.x} d={outline(t)} />)}
      {masts ? list.filter(t => t.kind === 3).map(t => <rect key={`m${t.x}`} x={t.x + t.w / 2 - 0.75} y={t.y - 34} width="1.5" height="34" />) : null}
    </g>
  );
}

/** Vertical sign blade: thin outline, no fill glow. */
function Blade({ x, y, h, red }: { x: number; y: number; h: number; red?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width="13" height={h} fill="#F6F3EE" fillOpacity=".7" stroke={STEEL} strokeOpacity=".7" strokeWidth="1" />
      <path d={`M${x + 6.5} ${y + 8} V${y + h - 8}`} stroke={red ? RED : STEEL} strokeOpacity={red ? 0.85 : 0.45} strokeWidth="1" />
    </g>
  );
}

export default function NightCity({ seed = 7, className = "", sun = true }: { seed?: number; className?: string; sun?: boolean }) {
  const far = towers(seed, 34, 100, 250);
  const mid = towers(seed * 5 + 3, 30, 60, 175);
  const near = towers(seed * 3 + 1, 26, 30, 110);
  const rain = `home-city-rain-${seed}`;
  return (
    <svg className={`home-city ${className}`} viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={rain} width="22" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <path d="M3 0 V13" stroke={STEEL} strokeWidth=".6" />
        </pattern>
      </defs>
      {/* hinomaru: a pale disc with a thin ring, low opacity so it sits in the mist */}
      {sun ? <><circle cx="1190" cy="150" r="138" fill={RED} fillOpacity=".11" /><circle cx="1190" cy="150" r="138" fill="none" stroke={RED} strokeOpacity=".5" strokeWidth="1.2" /></> : null}
      <Layer list={far} fill={FAR} masts />
      {/* pagoda roofline fragment: three eaves with upswept tips */}
      <g style={{ fill: MID }}>
        <path d="M1244 420 V330 H1316 V420 Z" />
        <path d="M1214 332 Q1262 328 1280 316 Q1298 328 1346 332 L1334 338 H1226 Z" />
        <path d="M1228 296 Q1268 292 1280 282 Q1292 292 1332 296 L1322 301 H1238 Z" />
        <path d="M1244 266 Q1272 262 1280 252 Q1288 262 1316 266 L1308 270 H1252 Z" />
        <rect x="1279" y="226" width="2" height="28" />
      </g>
      <Layer list={mid} fill={MID} masts />
      {/* torii gate silhouette */}
      <g style={{ fill: NEAR }}>
        <rect x="1404" y="318" width="9" height="102" />
        <rect x="1470" y="318" width="9" height="102" />
        <rect x="1398" y="344" width="87" height="6" />
        <path d="M1384 318 Q1441 328 1498 318 L1504 308 Q1441 318 1378 308 Z" />
      </g>
      <Layer list={near} fill={NEAR} />
      {/* sign blades hang off the edges of a few near towers; one carries the vermilion stroke */}
      <g className="home-city-signs">
        {near.filter((t, i) => t.x > 900 && i % 3 === 0).map((t, i) => <Blade key={t.x} x={t.x + t.w - 4} y={t.y + 10} h={34 + (i % 3) * 14} red={i === 1} />)}
      </g>
      <rect width="1600" height="420" fill={`url(#${rain})`} opacity=".1" />
    </svg>
  );
}

/** The Flow Samurai: faceless, calm, sword sheathed. Sumi ink and warm grey, one vermilion plate, thin steel lines. */
export function FlowSamurai({ title }: { title?: string }) {
  const sumi = SUMI;
  const ink2 = "#2A2D35";
  const grey = "#B9B3A7";
  const grey2 = "#8A857B";
  const paper = "#ECE8E0";
  return (
    <svg className="gm-visual-figure" viewBox="0 0 520 640" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false" preserveAspectRatio="xMidYMin meet" style={{ display: "block", width: "100%", height: "auto" }}>
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id="fs-hakama"><path d="M180 372 H340 L420 640 H100 Z" /></clipPath>
      </defs>
      <circle cx="260" cy="262" r="226" fill="none" stroke={STEEL} strokeOpacity=".5" strokeWidth="1.5" />
      <ellipse cx="260" cy="632" rx="190" ry="7" fill={STEEL} fillOpacity=".18" />
      {/* hakama */}
      <path d="M180 372 H340 L420 640 H100 Z" fill={sumi} />
      <path d="M260 372 L420 640 H260 Z" fill="#0C0D11" fillOpacity=".55" />
      <g clipPath="url(#fs-hakama)" fill="none" stroke={STEEL} strokeWidth="1" strokeOpacity=".7">
        <path d="M222 380 L178 640 M298 380 L342 640 M200 380 L138 640 M320 380 L382 640 M260 380 V640" />
        <path d="M100 598 H420" />
      </g>
      {/* arms and sleeves */}
      <path d="M180 202 L128 220 L102 396 L166 414 L200 306 Z" fill={ink2} />
      <path d="M340 202 L392 220 L418 392 L356 408 L320 306 Z" fill={sumi} />
      <path d="M102 396 L166 414 M418 392 L356 408" stroke={STEEL} strokeWidth="1.25" />
      {/* torso */}
      <path d="M180 196 H340 L330 372 H190 Z" fill={ink2} />
      <path d="M260 196 H340 L330 372 H260 Z" fill={sumi} />
      {/* collar, a calm V of undyed cloth */}
      <path d="M232 182 H288 L260 276 Z" fill={paper} />
      <path d="M226 186 L236 180 L274 296 L262 308 Z" fill={grey2} />
      <path d="M294 186 L284 180 L248 262 L258 280 Z" fill={grey} />
      {/* obi */}
      <path d="M186 346 H334 L332 388 H188 Z" fill="#0C0D11" />
      <path d="M186 346 H334 M188 388 H332" stroke={STEEL} strokeWidth="1.25" />
      <rect x="251" y="356" width="18" height="18" fill="none" stroke={RED} strokeWidth="1.5" />
      {/* sheathed katana through the obi: saya, tsuba, tsuka */}
      <g transform="rotate(-36 260 372)">
        <rect x="40" y="366" width="236" height="11" rx="3" fill={grey2} />
        <rect x="40" y="366" width="22" height="11" rx="3" fill={grey} />
        <path d="M110 366 V377" stroke={sumi} strokeWidth="1.5" />
        <rect x="276" y="360" width="5" height="23" rx="1.5" fill={STEEL} />
        <rect x="281" y="364" width="78" height="15" rx="3" fill={sumi} />
        <path d="M295 364 V379 M311 364 V379 M327 364 V379 M343 364 V379" stroke={grey} strokeWidth="1.5" />
      </g>
      {/* right hand rests on the hilt, left hand hangs; flat warm grey, no detail */}
      <path d="M356 408 L384 400 L388 440 L360 446 Z" fill={grey} />
      <path d="M104 396 L136 404 L132 446 L102 438 Z" fill={grey2} />
      {/* shoulder lames: the one vermilion plate on the left, warm grey on the right */}
      <g transform="rotate(14 150 220)">
        <rect x="104" y="190" width="92" height="22" rx="3" fill={RED} />
        <rect x="104" y="214" width="92" height="20" rx="3" fill={grey} />
        <rect x="104" y="236" width="92" height="20" rx="3" fill={grey2} />
        <rect x="104" y="258" width="92" height="20" rx="3" fill={grey} />
        <path d="M104 213 H196 M104 235 H196 M104 257 H196" stroke={STEEL} strokeWidth="1" />
      </g>
      <g transform="rotate(-14 370 220)">
        <rect x="324" y="190" width="92" height="22" rx="3" fill={grey2} />
        <rect x="324" y="214" width="92" height="20" rx="3" fill={grey} />
        <rect x="324" y="236" width="92" height="20" rx="3" fill={grey2} />
        <rect x="324" y="258" width="92" height="20" rx="3" fill={grey} />
        <path d="M324 213 H416 M324 235 H416 M324 257 H416" stroke={STEEL} strokeWidth="1" />
      </g>
      {/* head: a blank, softly lit oval in deep hat shade; neck */}
      <rect x="244" y="150" width="32" height="40" fill={grey2} />
      <ellipse cx="260" cy="150" rx="30" ry="34" fill={grey} />
      <path d="M230 138 Q260 160 290 138 V128 H230 Z" fill={grey2} />
      {/* kasa */}
      <path d="M80 124 L260 30 V124 Q170 138 80 124 Z" fill={ink2} />
      <path d="M440 124 L260 30 V124 Q350 138 440 124 Z" fill={sumi} />
      <path d="M260 30 L136 126 M260 30 L198 132 M260 30 V132 M260 30 L322 132 M260 30 L384 126" stroke={STEEL} strokeWidth="1" strokeOpacity=".7" />
      <path d="M80 124 Q260 152 440 124" fill="none" stroke={STEEL} strokeWidth="1.5" />
      <path d="M232 136 L240 190 M288 136 L280 190" stroke={RED} strokeWidth="1.25" strokeOpacity=".8" />
    </svg>
  );
}

/** A small hanko (name seal): vermilion square with one carved stroke. */
export function HankoMark({ className, size = "1em" }: { className?: string; size?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="22" height="22" rx="2" fill={RED} />
      <path d="M7 6 H17 M12 6 V18 M7 12 H17 M8 18 H16" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}
