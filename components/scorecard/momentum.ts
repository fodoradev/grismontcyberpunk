"use client";

import { useEffect, useRef, useState } from "react";

/** One line for the card right after a section is newly finished; nothing waits for it. */
export function useSectionMomentum(index: number, complete: boolean[], format: (section: number, left: number) => string, ignore = -1) {
  const announced = useRef<Set<number> | null>(null);
  announced.current ??= new Set(complete.flatMap((done, i) => (done ? [i] : [])));
  const [line, setLine] = useState<string>();
  useEffect(() => {
    const seen = announced.current!;
    const fresh = complete.findIndex((done, i) => done && i !== ignore && !seen.has(i));
    complete.forEach((done, i) => { if (done) seen.add(i); });
    setLine(fresh === -1 ? undefined : format(fresh, complete.filter((done, i) => !done && i !== ignore).length));
    // Evaluated once per card, so the line lasts exactly one card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  return line;
}

/** Minutes left, from the published time promise spread evenly over the questions. Never below 1. */
export const minutesLeft = (remaining: number, total: number, promisedMinutes = 8) => Math.max(1, Math.ceil(remaining * promisedMinutes / total));

/** On a new card the top of the focused shell is the readable position; keyboard use must not wait for a smooth scroll. */
export const resetCardScroll = () => window.scrollTo({ top: 0, behavior: "instant" });
