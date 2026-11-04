"use client";

import { useEffect, useState } from "react";

/** Desktop section index, built from the rendered sections so legal copy stays the only source. */
export default function LegalIndex({ label }: { label: string }) {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>(".legal-body section")].filter(section => section.querySelector("h2"));
    sections.forEach((section, i) => { section.id ||= `section-${i + 1}`; });
    setItems(sections.map(section => ({ id: section.id, text: section.querySelector("h2")!.textContent ?? "" })));
  }, []);
  return <nav className="legal-index" aria-label={label}>{items.length ? <><span className="gm-label">{label}</span><ul>{items.map(item => <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ul></> : null}</nav>;
}
