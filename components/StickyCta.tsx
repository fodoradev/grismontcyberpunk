"use client";

import { useEffect, useState } from "react";

/** Phones only: the primary action stays in reach between the hero and the sections that already carry it. */
export default function StickyCta({ href, label, note }: { href: string; label: string; note: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const targets = ["home", "scorecard", "contact"].map(id => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target); });
      setShow(inView.size === 0);
    });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return <div className="home-sticky-cta" data-show={show ? "true" : undefined} inert={!show}><span>{note}</span><a className="gm-cta" href={href}>{label} <span aria-hidden="true">↗</span></a></div>;
}
