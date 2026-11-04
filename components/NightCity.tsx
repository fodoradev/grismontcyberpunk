/** A drawn skyline, so a band has its city before (or without) a generated backdrop. Seeded, so server output is stable. */
type Tower = { x: number; y: number; w: number };

function towers(seed: number, count: number, min: number, max: number) {
  let s = seed;
  const next = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const list: (Tower & { lit: { x: number; y: number; flow: boolean }[] })[] = [];
  let x = -20;
  for (let i = 0; i < count && x < 1620; i++) {
    const w = 46 + next() * 92;
    const y = 420 - (min + next() * (max - min));
    const lit = Array.from({ length: 2 + Math.floor(next() * 5) }, () => ({ x: x + 6 + Math.floor(next() * (w - 14)), y: y + 12 + Math.floor(next() * (400 - y)), flow: next() > .72 }));
    list.push({ x, y, w, lit });
    x += w + next() * 6;
  }
  return list;
}

export default function NightCity({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  const far = towers(seed, 34, 90, 250);
  const near = towers(seed * 3 + 1, 30, 40, 160);
  return (
    <svg className={`home-city ${className}`} viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {far.map(t => <rect key={t.x} className="home-city-far" x={t.x} y={t.y} width={t.w} height={420 - t.y} />)}
      {far.flatMap(t => t.lit).map((w, i) => <rect key={i} className={w.flow ? "home-city-flow" : "home-city-warm"} x={w.x} y={w.y} width="3" height="5" />)}
      {near.map(t => <rect key={t.x} className="home-city-near" x={t.x} y={t.y} width={t.w} height={420 - t.y} />)}
      {near.flatMap(t => t.lit).map((w, i) => <rect key={i} className={w.flow ? "home-city-flow" : "home-city-warm"} x={w.x} y={w.y} width="3" height="5" opacity=".7" />)}
    </svg>
  );
}
