import { describe, expect, it } from "vitest";
import { createFlowSimulation, MAX_GRAY_DOTS, sampleFlowRoute, stepFlowSimulation, type FlowRoute, type FlowSimulation } from "../../lib/animation/flow";

const straight = (y = 100): FlowRoute => ({ length: 800, gate: 601, pointAt: distance => ({ x: distance, y }) });
function advance(sim: FlowSimulation, seconds: number) {
  for (let i = 0; i < Math.ceil(seconds * 120); i++) stepFlowSimulation(sim, 1 / 120);
}

describe("alternative process animation", () => {
  it("recoils before a crossing, then lets the dots proceed in turn", () => {
    const sim = createFlowSimulation([straight(), { ...straight(), pointAt: distance => ({ x: 100, y: distance }) }]);
    sim.nextStall = Infinity;
    sim.dots = [sim.dots[0], sim.dots[4]];
    sim.dots.forEach(dot => { dot.distance = 84; });
    stepFlowSimulation(sim, 1 / 120);
    expect(sim.dots.every(dot => dot.velocity < 0)).toBe(true);
    expect(sim.yields).toBe(1);
    advance(sim, 0.2);
    expect(sim.dots[0].velocity).toBeGreaterThan(0);
    expect(sim.dots[1].velocity).toBe(0);
    advance(sim, 0.55);
    expect(sim.dots.every(dot => dot.velocity > 0)).toBe(true);
  });

  it("nudges a stopped dot forward and recoils the following dot", () => {
    const sim = createFlowSimulation([straight()]);
    sim.nextStall = Infinity;
    sim.dots = sim.dots.slice(0, 2);
    const [front, rear] = sim.dots;
    front.distance = 150;
    front.stalled = true;
    rear.distance = 126;
    stepFlowSimulation(sim, 1 / 120);
    expect(front.stalled).toBe(false);
    expect(front.velocity).toBeGreaterThan(front.speed);
    expect(rear.velocity).toBeLessThan(0);
    expect(sim.pushes).toBe(1);
    advance(sim, 0.8);
    expect(front.distance).toBeGreaterThan(150);
    expect(rear.velocity).toBeGreaterThan(0);
    expect(front.distance - rear.distance).toBeGreaterThan(16);
  });

  it("occasionally pauses a dot and recovers when its follower arrives", () => {
    const sim = createFlowSimulation([straight()]);
    sim.time = sim.nextStall = 6;
    sim.dots = sim.dots.slice(0, 2);
    sim.dots[0].distance = 200;
    sim.dots[1].distance = 100;
    stepFlowSimulation(sim, 1 / 120);
    expect(sim.dots[0].stalled).toBe(true);
    advance(sim, 3);
    expect(sim.pushes).toBe(1);
    expect(sim.dots.every(dot => !dot.stalled && dot.velocity > 0)).toBe(true);
  });

  it("recovers from a pause even if no follower reaches it", () => {
    const sim = createFlowSimulation([straight()]);
    sim.dots = sim.dots.slice(0, 1);
    sim.nextStall = Infinity;
    sim.dots[0].stalled = true;
    advance(sim, 8.2);
    expect(sim.dots[0].stalled).toBe(false);
    expect(sim.dots[0].velocity).toBeGreaterThan(0);
  });

  it("keeps green dots moving smoothly and wraps the stream off canvas", () => {
    const sim = createFlowSimulation([straight()]);
    sim.nextStall = Infinity;
    sim.dots = sim.dots.slice(0, 1);
    const dot = sim.dots[0];
    dot.distance = 700;
    advance(sim, 0.2);
    expect(dot.distance).toBeCloseTo(730);
    expect(dot.velocity).toBe(150);
    advance(sim, 0.5);
    expect(dot.distance).toBeLessThan(20);
    expect(dot.velocity).toBeGreaterThan(0);
  });

  it("interpolates cached paths without leaving their endpoints", () => {
    const route = sampleFlowRoute(800, distance => ({ x: distance, y: 20 }));
    expect(route.pointAt(123.4)).toEqual({ x: 123.4, y: 20 });
    expect(route.pointAt(-10)).toEqual({ x: 0, y: 20 });
    expect(route.pointAt(810)).toEqual({ x: 800, y: 20 });
  });

  it("holds returning dots at the gray limit and admits only one for each freed slot", () => {
    const sim = createFlowSimulation([straight(), straight(250), straight(400)]);
    sim.nextStall = Infinity;
    sim.dots.forEach((dot, i) => { dot.distance = 100 + (i % 4) * 80; dot.stalled = true; });
    // Extra arrivals exercise capacity independently of the current pool size.
    const first = { ...sim.dots[0], id: 12, distance: 799.9, stalled: false };
    const second = { ...sim.dots[4], id: 13, distance: 799.9, stalled: false };
    sim.dots.push(first, second);
    const grayCount = () => sim.dots.filter(dot => !dot.pending && dot.distance < sim.routes[dot.lane].gate).length;
    stepFlowSimulation(sim, 1 / 120);
    expect(grayCount()).toBe(MAX_GRAY_DOTS);
    expect(first.pending).toBe(true);
    expect(second.pending).toBe(true);
    expect(first.velocity).toBe(0);
    sim.dots[8].distance = sim.routes[2].gate + 1;
    stepFlowSimulation(sim, 1 / 120);
    expect(grayCount()).toBe(MAX_GRAY_DOTS);
    expect([first, second].filter(dot => dot.pending)).toHaveLength(1);
    expect(first.pending).toBe(false);
    expect(first.distance).toBe(0);
  });

  it("waits off canvas for space at a crowded entrance, then resumes", () => {
    const sim = createFlowSimulation([straight()]);
    sim.nextStall = Infinity;
    sim.dots = sim.dots.slice(0, 2);
    const [returning, queued] = sim.dots;
    returning.distance = 799.9;
    queued.distance = 12;
    queued.stalled = true;
    stepFlowSimulation(sim, 1 / 120);
    expect(returning.pending).toBe(true);
    expect(returning.distance).toBe(sim.routes[0].length);
    advance(sim, 0.5);
    expect(returning.pending).toBe(true);
    queued.distance = 60;
    queued.stalled = false;
    stepFlowSimulation(sim, 1 / 120);
    expect(returning.pending).toBe(false);
    expect(returning.distance).toBe(0);
    expect(returning.velocity).toBeGreaterThan(0);
  });
});
