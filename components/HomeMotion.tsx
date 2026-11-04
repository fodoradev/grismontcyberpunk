"use client";

import { useEffect } from "react";

export default function HomeMotion() {
  useEffect(() => {
    const root = document.getElementById("grismont-board");
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = [...root.querySelectorAll<HTMLElement>("main>section")].flatMap(section =>
      [...(section.querySelector(".home-section") || section).children].filter(el => !el.classList.contains("home-hero") && !el.classList.contains("home-art") && !el.classList.contains("home-atmos")) as HTMLElement[]
    );
    let frame: number | null = null;
    let disposed = false;
    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0) >= Math.min(r.height * .45, 80); };
    const paint = () => {
      frame = null;
      if (disposed) return;
      if (media.matches) {
        root.classList.remove("gm-motion-enabled");
        return;
      }
      revealTargets.forEach(el => { if (visible(el)) el.classList.add("gm-visible"); });
      root.classList.add("gm-motion-enabled");
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(paint); };
    revealTargets.forEach(el => el.classList.add("gm-reveal"));
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    root.addEventListener("toggle", schedule, true);
    media.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("gm-motion-enabled");
      revealTargets.forEach(el => el.classList.remove("gm-reveal", "gm-visible"));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      root.removeEventListener("toggle", schedule, true);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return null;
}
