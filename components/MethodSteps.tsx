"use client";

import { useEffect, useRef, useState } from "react";

type Step = { title: string; text: string; tag: string };

/** The step being read lights up and the rail fills with it. Without JS every step simply reads as active. */
export default function MethodSteps({ steps }: { steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const items = [...(list.current?.children ?? [])];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(items.indexOf(entry.target)); });
    }, { rootMargin: "-42% 0px -48% 0px" });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  const progress = active === null ? 0 : (active + 1) / steps.length;
  return (
    <ol className="home-method-list" ref={list} data-tracking={active === null ? undefined : "true"} style={{ "--rail": progress } as React.CSSProperties}>
      {steps.map((step, i) => (
        <li key={step.tag} data-state={active === null ? undefined : i === active ? "active" : i < active ? "done" : "next"}>
          <span className="home-method-number">0{i + 1}</span>
          <div>
            <span className="home-method-tag">{step.tag}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
