import { getBackdrop, getVisual, visuals, type BackdropId, type VisualId } from "../data/visuals";
import type { Locale } from "../lib/i18n";

const isDev = process.env.NODE_ENV !== "production";

/** The real image once data/visuals.ts has a path; until then a labelled frame of the same shape. */
export default function VisualSlot({ id, locale, className = "", priority = false }: { id: VisualId; locale: Locale; className?: string; priority?: boolean }) {
  const v = getVisual(id, locale);
  const ratio = `${v.width} / ${v.height}`;
  if (v.src) return <img className={`gm-visual ${className}`} src={v.src} alt={v.alt} width={v.width} height={v.height} loading={priority ? "eager" : "lazy"} style={{ aspectRatio: ratio }} />;
  if (id === "samurai") {
    return (
      <div className={`gm-visual gm-visual-empty ${className}`} style={{ aspectRatio: ratio, ...washiFrame }} data-visual={id} aria-hidden="true">
        <SamuraiGuide />
        <span className="gm-visual-name" style={{ color: "var(--gm-ink, #14161C)" }}>{v.name}</span>
        <span className="gm-visual-brief" style={{ color: "var(--gm-muted, #5B5F69)" }}>{v.brief}</span>
        {isDev ? <span className="gm-visual-meta" style={{ color: "var(--gm-muted, #5B5F69)", letterSpacing: ".04em" }}><span>{v.file} · {v.ratio}</span><span>PROMPT {v.promptId} · docs/asset-prompts.md</span></span> : null}
      </div>
    );
  }
  // Any other empty slot: a quiet washi frame. One hairline, a tiny label, and one faint sumi-e line that starts tangled and runs straight.
  return (
    <div className={`gm-visual gm-visual-empty gm-visual-quiet ${className}`} style={{ aspectRatio: ratio, ...washiFrame }} data-visual={id} aria-hidden="true">
      <svg className="gm-visual-motif" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path d="M0 62 H100" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--gm-ink, #14161C)", strokeWidth: 1, opacity: 0.07 }} />
        <path d="M6 54 C14 38 22 70 30 52 S42 36 48 54 S58 66 62 58 C66 54 68 58 72 58 H94" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--gm-ink, #14161C)", strokeWidth: 1, opacity: 0.2, fill: "none", strokeLinecap: "round" }} />
      </svg>
      <span className="gm-visual-name" style={{ color: "var(--gm-muted, #5B5F69)" }}>{v.name}</span>
      {isDev ? <span className="gm-visual-meta" style={{ color: "var(--gm-muted, #5B5F69)" }}><span>{v.promptId}</span></span> : null}
    </div>
  );
}

/** Washi tone with a thin hairline frame. Inline so it holds whatever the stylesheet draws around it. */
const washiFrame = {
  background: "color-mix(in srgb, var(--gm-paper, #F6F3EE) 55%, var(--gm-mist, #ECE8E0))",
  border: "1px solid color-mix(in srgb, var(--gm-ink, #14161C) 14%, transparent)",
  color: "var(--gm-ink, #14161C)",
} as const;

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
