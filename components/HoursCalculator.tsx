"use client";

import { useEffect, useRef, useState } from "react";

type Copy = { title: string; intro: string; people: string; hours: string; result: string; weeks: string; block: string; note: string; cta: string };

const WORK_WEEKS = 46;
const HOURS_PER_WEEK = 40;
const BLOCKS = 52;

export default function HoursCalculator({ copy, href, locale }: { copy: Copy; href: string; locale: string }) {
  const [people, setPeople] = useState(4);
  const [hours, setHours] = useState(3);
  const total = people * hours * WORK_WEEKS;
  const weeks = total / HOURS_PER_WEEK;
  const format = (n: number) => new Intl.NumberFormat(locale === "hu" ? "hu-HU" : "en-GB", { maximumFractionDigits: 0 }).format(n);

  // The figure glides to its new value; with reduced motion it simply changes.
  const figure = useRef<HTMLSpanElement>(null);
  const shown = useRef(total);
  useEffect(() => {
    const el = figure.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { shown.current = total; el.textContent = format(total); return; }
    const from = shown.current, start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / 220), eased = 1 - (1 - t) ** 3;
      shown.current = from + (total - from) * eased;
      el.textContent = format(shown.current);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
    // format depends only on locale, which does not change on this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const filled = Math.min(BLOCKS, Math.round(weeks));
  return (
    <div className="home-calc">
      <div className="home-calc-inputs">
        <h2 id="calculator-title">{copy.title}</h2>
        <p className="home-calc-intro">{copy.intro}</p>
        <label className="home-calc-field"><span>{copy.people}<b>{people}</b></span><input type="range" name="people" min={1} max={50} value={people} onChange={e => setPeople(Number(e.target.value))} style={{ "--fill": `${(people - 1) / 49 * 100}%` } as React.CSSProperties} /></label>
        <label className="home-calc-field"><span>{copy.hours}<b>{hours}</b></span><input type="range" name="hours" min={1} max={20} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ "--fill": `${(hours - 1) / 19 * 100}%` } as React.CSSProperties} /></label>
      </div>
      <div className="home-calc-result">
        <p className="home-calc-label">{copy.result}</p>
        <p className="home-calc-figure" aria-hidden="true"><span ref={figure}>{format(total)}</span></p>
        <p className="sc-sr" aria-live="polite">{format(total)} {copy.result}</p>
        <p className="home-calc-weeks">{copy.weeks.replace("{n}", format(weeks))}</p>
        <div className="home-calc-blocks" aria-hidden="true">{Array.from({ length: BLOCKS }, (_, i) => <i key={i} className={i < filled ? "on" : undefined} style={{ transitionDelay: `${Math.min(i, 30) * 6}ms` }} />)}</div>
        <p className="home-calc-note">{copy.block} {copy.note}</p>
        <a className="gm-cta" href={href}>{copy.cta} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}
