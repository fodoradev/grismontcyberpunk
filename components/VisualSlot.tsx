import { getBackdrop, getVisual, visuals, type BackdropId, type VisualId } from "../data/visuals";
import type { Locale } from "../lib/i18n";

const isDev = process.env.NODE_ENV !== "production";

/** The real image once data/visuals.ts has a path; until then a labelled frame of the same shape. */
export default function VisualSlot({ id, locale, className = "", priority = false }: { id: VisualId; locale: Locale; className?: string; priority?: boolean }) {
  const v = getVisual(id, locale);
  const ratio = `${v.width} / ${v.height}`;
  if (v.src) return <img className={`gm-visual ${className}`} src={v.src} alt={v.alt} width={v.width} height={v.height} loading={priority ? "eager" : "lazy"} style={{ aspectRatio: ratio }} />;
  return (
    <div className={`gm-visual gm-visual-empty ${className}`} style={{ aspectRatio: ratio, ...washiFrame }} data-visual={id} aria-hidden="true">
      {id === "samurai" ? <SamuraiGuide /> : <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="gm-visual-tangle" d="M0 34 C8 20 16 48 24 32 S34 16 40 34 S48 46 52 32" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--gm-crimson, #C8242E)", strokeWidth: 1, opacity: 0.8 }} />
        <path className="gm-visual-clear" d="M52 32 H100" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--gm-flow, #0E7C6B)", strokeWidth: 1 }} />
      </svg>}
      <Marks />
      <span className="gm-visual-name" style={{ color: "var(--gm-ink, #14161C)" }}>{v.name}</span>
      <span className="gm-visual-brief" style={{ color: "var(--gm-muted, #5B5F69)" }}>{v.brief}</span>
      {isDev ? <span className="gm-visual-meta" style={{ color: "var(--gm-muted, #5B5F69)", letterSpacing: ".04em" }}><span>{v.file} · {v.ratio}</span><span>PROMPT {v.promptId} · docs/asset-prompts.md</span></span> : null}
    </div>
  );
}

/** Washi tone with a thin dashed sumi hairline frame. Inline so it holds whatever the stylesheet draws around it. */
const washiFrame = {
  background: "var(--gm-paper, #F6F3EE)",
  border: "1px dashed color-mix(in srgb, var(--gm-ink, #14161C) 38%, transparent)",
  color: "var(--gm-ink, #14161C)",
} as const;

/** A registration tick at the top left and a small vermilion hanko square at the top right: quiet, and the only red. */
function Marks() {
  return (
    <svg className="gm-visual-marks" viewBox="0 0 60 16" aria-hidden="true" style={{ position: "absolute", inset: "auto", top: 10, left: 10, width: 60, height: 16, opacity: 1 }}>
      <path d="M0.5 15.5 V0.5 H15.5" fill="none" stroke="var(--gm-ink, #14161C)" strokeWidth="1" opacity="0.55" vectorEffect="non-scaling-stroke" />
      <rect x="44" y="0" width="16" height="16" fill="var(--gm-crimson, #C8242E)" opacity="0.9" />
      <rect x="48" y="4" width="8" height="8" fill="none" stroke="var(--gm-paper, #F6F3EE)" strokeWidth="1" />
    </svg>
  );
}

/** Where the figure stands in the V01 art: calm, faceless under the hat, sword sheathed, one vermilion plate. */
function SamuraiGuide() {
  const ink = { fill: "#14161C", stroke: "var(--gm-steel, #8A93A0)", strokeLinejoin: "round" } as const;
  return (
    <svg className="gm-visual-figure" viewBox="0 0 400 500" preserveAspectRatio="xMidYMin meet">
      <path className="gm-figure-axis" d="M200 20 V480" style={{ stroke: "color-mix(in srgb, #14161C 30%, transparent)" }} />
      <path className="gm-figure-body" d="M128 196 L172 160 H228 L272 196 L290 268 L268 304 L294 482 H106 L132 304 L110 268 Z" style={ink} />
      <path className="gm-figure-body" d="M108 124 L200 62 L292 124 Q200 142 108 124 Z M170 132 H230 L224 162 H176 Z" style={ink} />
      <path className="gm-figure-sword" d="M112 340 L318 276" style={{ stroke: "var(--gm-steel, #8A93A0)" }} />
      <path className="gm-figure-plate" d="M180 192 H220 L216 240 L200 256 L184 240 Z" style={{ fill: "var(--gm-crimson, #C8242E)" }} />
    </svg>
  );
}

/**
 * Decorative section art. Place it first inside a `position: relative` band. Without a file it renders nothing in
 * production, so the band rests on its CSS atmosphere; in development a small tag names the missing file.
 */
export function VisualBackdrop({ id, className = "", priority = false }: { id: BackdropId; className?: string; priority?: boolean }) {
  const src = getBackdrop(id);
  const v = visuals[id];
  if (src) return <img className={`gm-backdrop ${className}`} src={src} alt="" aria-hidden="true" width={v.width} height={v.height} loading={priority ? "eager" : "lazy"} />;
  // No file: render nothing. The band rests on its CSS atmosphere; data/visuals.ts lists the missing slot.
  void v;
  return null;
}
