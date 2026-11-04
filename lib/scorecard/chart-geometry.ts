import { QUADRANT_SPLIT } from "./scoring";
import { AREAS, type AreaId, type Level, type Quadrant, type ReportModel } from "./types";

/** Pure layout math shared by the web (DOM SVG) and PDF (@react-pdf Svg) charts. */

export const COLORS = { paper: "#F7F5F0", ink: "#20232B", crimson: "#D9273D", mist: "#EEF0F1", line: "#D9DEE2", muted: "#59616B", ghost: "#C5CBD0" };

/** The night palette for the web report. PDFs and print keep COLORS above. */
export const WEB_COLORS = { paper: "#07060F", panel: "#100F20", mist: "#191731", ink: "#F3F0FF", line: "#34314F", steel: "#807CA6", onDark: "#CFCBE6", crimson: "#FF2E54", flow: "#35F0D8" };

/** Colour role of a score on the web: crimson is friction, mint is resolved. The number and level label always carry it too. */
export function levelTone(level: Level) { return level === "Ad hoc" || level === "Person-dependent" ? "weak" : level === "Documented" ? "mid" : "strong"; }

export type BarGeometry = { area: AreaId; width: number; ghostWidth: number };

/** One horizontal bar per area. `ghostWidth` > 0 only for a capped AI score, showing the uncapped value. */
export function profileBars(r: ReportModel, track: number): BarGeometry[] {
  return AREAS.map(area => ({
    area,
    width: Math.max((r.areas[area].score / 4) * track, 2),
    ghostWidth: area === "AI" && r.ai.capped ? (r.ai.raw / 4) * track : 0,
  }));
}

/** Distance from the low end of an axis to the quadrant split. */
const splitAt = (size: number) => (QUADRANT_SPLIT / 4) * size;

export type Cell = { x: number; y: number; w: number; h: number; top: boolean };

/** Where each quadrant sits in a square of side `size`: opportunity rises upwards, readiness to the right. */
export function quadrantCells(size: number): Record<Quadrant, Cell> {
  const m = splitAt(size), top = size - m; // y of the horizontal line: opportunity runs bottom → top
  return {
    "fix-first": { x: 0, y: 0, w: m, h: top, top: true },
    "automate-now": { x: m, y: 0, w: size - m, h: top, top: true },
    "low-priority": { x: 0, y: top, w: m, h: m, top: false },
    "ready-low-volume": { x: m, y: top, w: size - m, h: m, top: false },
  };
}

/**
 * Dot centre for opportunity (vertical) × readiness (horizontal), both 0–4. The split value maps to the midline;
 * each coordinate is kept inside the half its score belongs to (with room for the dot's radius), so the dot never
 * sits on the dividing line or pokes out of the chart, and always lands in the quadrant quadrantFor() names.
 */
export function quadrantPoint(opportunity: number, readiness: number, size: number, radius: number) {
  const mid = splitAt(size), pad = radius + 3;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const along = (score: number) => {
    const p = (score / 4) * size;
    return score >= QUADRANT_SPLIT ? clamp(p, mid + pad, size - pad) : clamp(p, pad, mid - pad);
  };
  return { x: along(readiness), y: size - along(opportunity) };
}
