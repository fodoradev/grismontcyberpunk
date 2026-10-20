"use client";

import { useEffect } from "react";

export default function HomeMotion() {
  useEffect(() => {
    const root = document.getElementById("grismont-board");
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const art = root.querySelector<SVGSVGElement>(".home-art svg");
    const revealTargets = [...root.querySelectorAll<HTMLElement>("main>section")].flatMap(section =>
      [...(section.querySelector(".gm-section") || section).children].filter(el => !el.classList.contains("gm-art") && !el.classList.contains("home-art") && !el.classList.contains("gm-actions")) as HTMLElement[]
    );
    const sections = [root.querySelector("header"), ...root.querySelectorAll("main>section")].filter((el): el is Element => Boolean(el));
    const states = sections.map(section => ({ section, buttons: [...section.querySelectorAll<HTMLElement>(".gm-cta,.gm-header-cta")], timer: null as ReturnType<typeof setTimeout> | null, done: false })).filter(s => s.buttons.length);
    let frame: number | null = null;
    let disposed = false;
    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0) >= Math.min(r.height * .45, 80); };
    const cancel = (state: typeof states[number]) => { if (state.timer !== null) clearTimeout(state.timer); state.timer = null; };
    const paint = () => {
      frame = null;
      if (disposed) return;
      if (media.matches) {
        root.classList.remove("gm-motion-enabled");
        art?.pauseAnimations();
        states.forEach(cancel);
        return;
      }
      art?.unpauseAnimations();
      revealTargets.forEach(el => { if (visible(el)) el.classList.add("gm-visible"); });
      root.classList.add("gm-motion-enabled");
      const candidates = states.filter(s => !s.done && s.buttons.some(visible));
      const chosen = candidates.find(s => s.section.tagName !== "HEADER") || candidates[0];
      states.forEach(state => {
        if (state !== chosen || document.hidden) { cancel(state); return; }
        if (state.timer !== null) return;
        state.timer = setTimeout(() => {
          state.timer = null;
          if (disposed || media.matches || document.hidden) return;
          const button = state.buttons.find(visible);
          if (!button) return;
          state.done = true;
          button.classList.add("gm-glint");
        }, 4200);
      });
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(paint); };
    const clearGlint = (event: AnimationEvent) => { if (event.animationName === "gm-light-sweep" && event.target instanceof Element) event.target.classList.remove("gm-glint"); };
    revealTargets.forEach(el => el.classList.add("gm-reveal"));
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    root.addEventListener("toggle", schedule, true);
    root.addEventListener("animationend", clearGlint);
    media.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    return () => {
      disposed = true;
      states.forEach(cancel);
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("gm-motion-enabled");
      revealTargets.forEach(el => el.classList.remove("gm-reveal", "gm-visible"));
      states.forEach(s => s.buttons.forEach(button => button.classList.remove("gm-glint")));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      root.removeEventListener("toggle", schedule, true);
      root.removeEventListener("animationend", clearGlint);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return null;
}
