"use client";

import { useEffect, useRef } from "react";
import { createFlowSimulation, FLOW_LANES, sampleFlowRoute, stepFlowSimulation } from "../lib/animation/flow";

// The stream plays once while in view, then rests on the static "everything cleared" picture.
const RUN_SECONDS = 12;

export default function FlowDots() {
  const group = useRef<SVGGElement>(null);

  useEffect(() => {
    const element = group.current;
    const svg = element?.ownerSVGElement;
    if (!element || !svg) return;
    const paths = [...element.querySelectorAll<SVGPathElement>("path")];
    const circles = [...element.querySelectorAll<SVGCircleElement>("circle")];
    const routes = paths.map(path => sampleFlowRoute(path.getTotalLength(), distance => path.getPointAtLength(distance)));
    const sim = createFlowSimulation(routes);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let lastTime: number | null = null;
    let visible = true;
    let ran = 0;

    const paint = () => {
      sim.dots.forEach((dot, i) => {
        const route = routes[dot.lane];
        const point = route.pointAt(dot.distance);
        circles[i].setAttribute("visibility", dot.pending ? "hidden" : "visible");
        circles[i].setAttribute("cx", point.x.toFixed(2));
        circles[i].setAttribute("cy", point.y.toFixed(2));
        circles[i].setAttribute("fill", dot.distance < route.gate ? "#C8242E" : "#0E7C6B");
        circles[i].setAttribute("data-flow-state", dot.pending ? "pending" : dot.distance >= route.gate ? "clear" : dot.stalled ? "stalled" : dot.velocity < 0 ? "recoil" : dot.velocity === 0 ? "waiting" : "moving");
      });
    };
    const tick = (time: number) => {
      frame = null;
      if (lastTime !== null) {
        let elapsed = Math.min((time - lastTime) / 1000, 0.05);
        ran += elapsed;
        // Small fixed steps keep encounter handling steady on slow displays.
        while (elapsed > 0) {
          const dt = Math.min(elapsed, 1 / 120);
          stepFlowSimulation(sim, dt);
          elapsed -= dt;
        }
      }
      lastTime = time;
      paint();
      if (ran >= RUN_SECONDS) {
        svg.setAttribute("data-flow-settled", "");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
      if (!media.matches && !document.hidden && visible && ran < RUN_SECONDS) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    });
    observer.observe(svg);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    paint();
    sync();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      svg.removeAttribute("data-flow-settled");
    };
  }, []);

  return (
    <g ref={group} className="home-art-moving-dots" stroke="#F6F3EE" strokeWidth="1.5" aria-hidden="true">
      <g visibility="hidden">{FLOW_LANES.map((lane, i) => <path d={lane.path} key={i} />)}</g>
      {FLOW_LANES.flatMap((lane, i) => lane.phases.map((_, j) => <circle key={`${i}-${j}`} cx="-20" cy="-20" r="8" fill="#C8242E" />))}
    </g>
  );
}
