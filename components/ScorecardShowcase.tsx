"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Copy = {
  areasTitle: string; areas: string[][]; previewLabel: string; previewCompany: string; riskLabel: string; risk: string;
  winLabel: string; win: string; scale: string;
};

/** Six areas beside a sample report: opening or pointing at an area lights up its score. Scores come from the real sample report. */
export default function ScorecardShowcase({ copy, scores, children }: { copy: Copy; scores: number[]; children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect(); } }, { threshold: .3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="home-score-grid">
      <div className="home-areas">
        <h3>{copy.areasTitle}</h3>
        {copy.areas.map(([title, text], i) => (
          <details key={title} name="scorecard-area" onToggle={e => { if (e.currentTarget.open) setActive(i); else setActive(current => current === i ? null : current); }} onPointerEnter={() => setActive(i)}>
            <summary>{title}</summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
      <div className="home-report-lit"><div className="home-report" ref={card} data-seen={seen ? "true" : undefined}>
        <div className="home-report-sheet">
          <p className="home-report-top"><span className="gm-label">{copy.previewLabel}</span><span className="home-report-company">{copy.previewCompany}</span></p>
          <ul className="home-report-bars">
            {copy.areas.map(([title], i) => (
              <li key={title} data-active={active === i ? "true" : undefined}>
                <span>{title}</span>
                <span className="home-report-track"><i style={{ "--score": scores[i] / 4, transitionDelay: `${i * 60}ms` } as React.CSSProperties} /></span>
                <b>{scores[i].toFixed(1)}</b>
              </li>
            ))}
          </ul>
          <p className="home-report-scale">{copy.scale}</p>
          <dl className="home-report-facts"><div><dt>{copy.riskLabel}</dt><dd>{copy.risk}</dd></div><div><dt>{copy.winLabel}</dt><dd>{copy.win}</dd></div></dl>
        </div>
      </div></div>
      {children}
    </div>
  );
}
