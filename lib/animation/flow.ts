export type Point = { x: number; y: number };
export type FlowRoute = { length: number; gate: number; pointAt: (distance: number) => Point };
export type FlowDot = {
  id: number;
  lane: number;
  distance: number;
  speed: number;
  velocity: number;
  pending: boolean;
  stalled: boolean;
  stalledAt: number;
  recoilUntil: number;
  waitUntil: number;
  boostUntil: number;
  immuneUntil: number;
};

export const MAX_GRAY_DOTS = 12;
export type FlowSimulation = {
  routes: FlowRoute[];
  dots: FlowDot[];
  time: number;
  nextStall: number;
  seed: number;
  encounters: Map<string, number>;
  yields: number;
  pushes: number;
};

export const FLOW_LANES = [
  { path: "M-15 110 H65 Q95 110 95 145 V236 Q95 268 130 268 H169 Q205 268 205 220 V112 Q205 82 168 82 H149 Q120 82 120 116 V170 Q120 197 155 197 H254 L281 198 H480", phases: [0.03, 0.21, 0.57, 0.95] },
  { path: "M-10 204 H46 Q75 204 75 174 V75 Q75 48 106 48 H206 Q237 48 237 80 V276 Q237 310 201 310 H170 Q140 310 140 280 V155 Q140 128 170 128 H182 Q211 128 211 161 V211 Q211 232 232 232 H254 H281 H480", phases: [0.12, 0.39, 0.68, 0.97] },
  { path: "M-10 311 H28 Q54 311 54 280 V248 Q54 223 86 223 H160 Q182 223 182 248 V335 Q182 366 215 366 H224 Q254 366 254 331 V265 L281 266 H480", phases: [0.07, 0.31, 0.62, 0.91] },
];

// Cache each SVG path once; the frame loop only interpolates between samples.
export function sampleFlowRoute(length: number, pointAt: FlowRoute["pointAt"]): FlowRoute {
  const count = Math.ceil(length / 2);
  const points = Array.from({ length: count + 1 }, (_, i) => pointAt(i * length / count));
  return {
    length,
    gate: length - 199,
    pointAt(distance) {
      const position = Math.max(0, Math.min(count, distance / length * count));
      const index = Math.min(count - 1, Math.floor(position));
      const fraction = position - index;
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * fraction,
        y: points[index].y + (points[index + 1].y - points[index].y) * fraction,
      };
    },
  };
}

function random(sim: FlowSimulation) {
  sim.seed = (Math.imul(sim.seed, 1664525) + 1013904223) >>> 0;
  return sim.seed / 4294967296;
}

export function createFlowSimulation(routes: FlowRoute[]): FlowSimulation {
  const dots = routes.flatMap((route, lane) => FLOW_LANES[lane].phases.map((phase, index): FlowDot => {
    const slowTime = route.gate / 60;
    const elapsed = phase * (slowTime + 199 / 150);
    return {
      id: lane * 4 + index, lane,
      distance: elapsed < slowTime ? elapsed * 60 : route.gate + (elapsed - slowTime) * 150,
      speed: 57 + ((lane * 7 + index * 3) % 9), velocity: 60, pending: false,
      stalled: false, stalledAt: 0,
      recoilUntil: 0, waitUntil: 0, boostUntil: 0, immuneUntil: 0,
    };
  }));
  let grayCount = 0;
  for (const dot of dots) {
    if (dot.distance < routes[dot.lane].gate && ++grayCount > MAX_GRAY_DOTS) {
      dot.pending = true;
      dot.distance = routes[dot.lane].length;
      dot.velocity = 0;
    }
  }
  return { routes, dots, time: 0, nextStall: 6, seed: 6173, encounters: new Map(), yields: 0, pushes: 0 };
}

function gray(sim: FlowSimulation, dot: FlowDot) {
  return !dot.pending && dot.distance < sim.routes[dot.lane].gate;
}

function velocity(sim: FlowSimulation, dot: FlowDot) {
  if (dot.pending) return 0;
  if (!gray(sim, dot)) return 150;
  if (dot.stalled) return 0;
  if (dot.recoilUntil > sim.time) return -32;
  if (dot.waitUntil > sim.time) return 0;
  if (dot.boostUntil > sim.time) return 98;
  return dot.speed;
}

function recoil(sim: FlowSimulation, dot: FlowDot, wait: number) {
  dot.recoilUntil = sim.time + 0.14;
  dot.waitUntil = sim.time + wait;
  dot.immuneUntil = sim.time + wait + 0.45;
}

export function stepFlowSimulation(sim: FlowSimulation, dt: number) {
  sim.time += dt;

  // Stop infrequently, choosing a dot whose follower is already on its way.
  // A timeout also lets the stream recover if the follower yields elsewhere.
  if (sim.time >= sim.nextStall) {
    const candidates = sim.dots.filter(dot => gray(sim, dot) && !dot.stalled
      && dot.distance > 90 && dot.distance < sim.routes[dot.lane].gate - 100
      && dot.immuneUntil < sim.time && !sim.dots.some(other => other.stalled)
      && sim.dots.some(other => other.lane === dot.lane && dot.distance - other.distance > 55 && dot.distance - other.distance < 175));
    if (candidates.length) {
      const dot = candidates[Math.floor(random(sim) * candidates.length)];
      dot.stalled = true;
      dot.stalledAt = sim.time;
      sim.nextStall = sim.time + 14 + random(sim) * 9;
    } else sim.nextStall = sim.time + 1;
  }

  for (const dot of sim.dots) {
    if (dot.stalled && sim.time - dot.stalledAt > 8) dot.stalled = false;
    dot.velocity = velocity(sim, dot);
  }

  for (let i = 0; i < sim.dots.length; i++) {
    const a = sim.dots[i];
    if (!gray(sim, a) || a.distance < 20) continue;
    for (let j = i + 1; j < sim.dots.length; j++) {
      const b = sim.dots[j];
      if (!gray(sim, b) || b.distance < 20) continue;
      const sameStream = a.lane === b.lane && Math.abs(a.distance - b.distance) < 42;
      const front = a.distance > b.distance ? a : b;
      const rear = front === a ? b : a;

      if (sameStream && front.stalled && rear.velocity > 0 && front.distance - rear.distance <= 24) {
        front.stalled = false;
        front.boostUntil = sim.time + 0.5;
        front.immuneUntil = sim.time + 1;
        recoil(sim, rear, 0.32);
        sim.pushes++;
        continue;
      }
      // Keep a following dot behind the leader when both are recovering.
      if (sameStream && !front.stalled && front.distance - rear.distance < 21 && rear.velocity > front.velocity) {
        rear.waitUntil = Math.max(rear.waitUntil, sim.time + 0.08);
        rear.velocity = 0;
        continue;
      }
      const key = `${a.id}:${b.id}`;
      if ((sim.encounters.get(key) ?? 0) > sim.time || a.stalled || b.stalled) continue;
      const pa = sim.routes[a.lane].pointAt(a.distance);
      const pb = sim.routes[b.lane].pointAt(b.distance);
      const qa = sim.routes[a.lane].pointAt(a.distance + Math.max(0, a.velocity) * 0.1);
      const qb = sim.routes[b.lane].pointAt(b.distance + Math.max(0, b.velocity) * 0.1);
      if (Math.hypot(pa.x - pb.x, pa.y - pb.y) > 23 && Math.hypot(qa.x - qb.x, qa.y - qb.y) > 22) continue;
      if (a.velocity <= 0 && b.velocity <= 0) continue;
      if (a.immuneUntil > sim.time && b.immuneUntil > sim.time) continue;

      // At crossings one gets a short recoil, the other waits a beat longer.
      // A third arrival yields to a dot that already has right of way.
      const winner = sameStream ? front : a.immuneUntil > sim.time ? a : b.immuneUntil > sim.time ? b : (sim.yields % 2 === 0 ? a : b);
      const loser = winner === a ? b : a;
      if (winner.immuneUntil <= sim.time) recoil(sim, winner, 0.14);
      if (loser.immuneUntil <= sim.time) recoil(sim, loser, 0.68);
      sim.encounters.set(key, sim.time + 1.6);
      sim.yields++;
    }
  }

  for (const dot of sim.dots) {
    if (dot.pending) continue;
    dot.velocity = velocity(sim, dot);
    dot.distance = Math.max(0, dot.distance + dot.velocity * dt);
    const route = sim.routes[dot.lane];
    if (dot.distance >= route.length) {
      dot.distance = route.length;
      dot.pending = true;
      dot.velocity = 0;
      dot.stalled = false;
      dot.recoilUntil = dot.waitUntil = dot.boostUntil = dot.immuneUntil = 0;
    }
  }

  // Nearby parallel paths and three-way encounters can outlast a yield timer.
  // Keep a small physical gap even then, sliding the yielding dot back on its
  // own track rather than allowing it to pass through another gray dot.
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < sim.dots.length; i++) for (let j = i + 1; j < sim.dots.length; j++) {
      const a = sim.dots[i], b = sim.dots[j];
      if (!gray(sim, a) || !gray(sim, b)) continue;
      const pa = sim.routes[a.lane].pointAt(a.distance);
      const pb = sim.routes[b.lane].pointAt(b.distance);
      if (pa.x >= 240 && pb.x >= 240) continue;
      const separation = Math.hypot(pa.x - pb.x, pa.y - pb.y);
      if (separation >= 18) continue;
      const sameStream = a.lane === b.lane && Math.abs(a.distance - b.distance) < 42;
      const loser = a.stalled ? b : b.stalled ? a : sameStream ? (a.distance < b.distance ? a : b) : a.waitUntil > b.waitUntil ? a : b;
      const other = loser === a ? pb : pa;
      const route = sim.routes[loser.lane];
      let best = separation, distance = loser.distance;
      for (let back = 0.5; back <= 36; back += 0.5) {
        const candidate = Math.max(0, loser.distance - back);
        const point = route.pointAt(candidate);
        const gap = Math.hypot(point.x - other.x, point.y - other.y);
        if (gap > best) { best = gap; distance = candidate; }
        if (gap >= 18) break;
      }
      if (distance < loser.distance) {
        loser.distance = distance;
        loser.recoilUntil = Math.max(loser.recoilUntil, sim.time + 0.08);
        loser.waitUntil = Math.max(loser.waitUntil, sim.time + 0.24);
        loser.velocity = -32;
      }
    }
  }

  // Reuse finished dots only when there is capacity and a clear entrance.
  // Pending dots stay off canvas and do not take part in collisions or stalls.
  let grayCount = sim.dots.filter(dot => gray(sim, dot)).length;
  for (const dot of sim.dots) {
    if (!dot.pending || grayCount >= MAX_GRAY_DOTS) continue;
    const route = sim.routes[dot.lane];
    const entry = route.pointAt(0);
    const occupied = sim.dots.some(other => {
      if (!gray(sim, other)) return false;
      if (other.lane === dot.lane && other.distance < 48) return true;
      const point = sim.routes[other.lane].pointAt(other.distance);
      return Math.hypot(entry.x - point.x, entry.y - point.y) < 28;
    });
    if (occupied) continue;
    dot.pending = false;
    dot.distance = 0;
    dot.velocity = dot.speed;
    grayCount++;
  }
}
