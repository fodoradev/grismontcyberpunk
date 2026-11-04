import { getBackdrop, getVisual, visuals, type BackdropId, type VisualId } from "../data/visuals";
import type { Locale } from "../lib/i18n";

const isDev = process.env.NODE_ENV !== "production";

/** The real image once data/visuals.ts has a path; until then a labelled frame of the same shape. */
export default function VisualSlot({ id, locale, className = "", priority = false }: { id: VisualId; locale: Locale; className?: string; priority?: boolean }) {
  const v = getVisual(id, locale);
  const ratio = `${v.width} / ${v.height}`;
  if (v.src) return <img className={`gm-visual ${className}`} src={v.src} alt={v.alt} width={v.width} height={v.height} loading={priority ? "eager" : "lazy"} style={{ aspectRatio: ratio }} />;
  return (
    <div className={`gm-visual gm-visual-empty ${className}`} style={{ aspectRatio: ratio }} data-visual={id} aria-hidden="true">
      {id === "samurai" ? <SamuraiGuide /> : <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="gm-visual-tangle" d="M0 34 C8 20 16 48 24 32 S34 16 40 34 S48 46 52 32" vectorEffect="non-scaling-stroke" />
        <path className="gm-visual-clear" d="M52 32 H100" vectorEffect="non-scaling-stroke" />
      </svg>}
      <span className="gm-visual-name">{v.name}</span>
      <span className="gm-visual-brief">{v.brief}</span>
      {isDev ? <span className="gm-visual-meta"><span>{v.file} · {v.ratio}</span><span>PROMPT {v.promptId} · docs/asset-prompts.md</span></span> : null}
    </div>
  );
}

/** Where the figure stands in the V01 art: calm, faceless under the hat, sword sheathed, one crimson plate. */
function SamuraiGuide() {
  return (
    <svg className="gm-visual-figure" viewBox="0 0 400 500" preserveAspectRatio="xMidYMin meet">
      <path className="gm-figure-axis" d="M200 20 V480" />
      <path className="gm-figure-body" d="M128 196 L172 160 H228 L272 196 L290 268 L268 304 L294 482 H106 L132 304 L110 268 Z" />
      <path className="gm-figure-body" d="M108 124 L200 62 L292 124 Q200 142 108 124 Z M170 132 H230 L224 162 H176 Z" />
      <path className="gm-figure-sword" d="M112 340 L318 276" />
      <path className="gm-figure-plate" d="M180 192 H220 L216 240 L200 256 L184 240 Z" />
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
  return isDev ? <span className="gm-backdrop-tag" data-visual={id} aria-hidden="true">BACKDROP {v.promptId} · {v.file}</span> : null;
}
