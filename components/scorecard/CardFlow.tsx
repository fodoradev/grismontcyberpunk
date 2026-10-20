"use client";

import { Fragment, startTransition, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { changeScorecardLocaleAction, saveAnswerAction, submitAction } from "../../app/scorecard/actions";
import { getScorecardCopy } from "../../content/scorecard/copy";
import type { Locale } from "../../lib/i18n";

export type FlowQuestion = {
  id: string;
  kind: "scored" | "diag" | "text";
  prompt: string;
  help?: string;
  options: { id: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  /** Index into `sections`. */
  section: number;
};
export type FlowSection = { name: string; count: number };

const ADVANCE_DELAY = 380; // long enough to see the choice register, short enough to feel instant
const SAVE_RETRIES = 3;

/** Prompt with the named process piped in where it says {process}. */
function Prompt({ text, process, locale }: { text: string; process: string; locale: Locale }) {
  const parts = text.split("{process}");
  const name = process ? getScorecardCopy(locale).midSentence(process) : locale === "hu" ? "ez a folyamat" : "this process";
  return <>{parts.map((p, i) => <Fragment key={i}>{p}{i < parts.length - 1 ? <span className="sc-pipe">{name}</span> : null}</Fragment>)}</>;
}

function Progress({ questions, sections, answers, current, position, editingId, locale }: {
  questions: FlowQuestion[]; sections: FlowSection[]; answers: Record<string, string>; current: number; position?: string; editingId?: string; locale: Locale;
}) {
  // A text answer counts once it has been confirmed, not while it is still being typed.
  const answered = questions.filter(q => q.id in answers && !(q.kind === "text" && q.id === editingId) && (q.kind !== "text" || !q.required || answers[q.id].trim()));
  const doneAtMount = useRef<Set<number> | null>(null);
  const perSection = sections.map((s, i) => answered.filter(q => q.section === i).length / s.count);
  doneAtMount.current ??= new Set(perSection.flatMap((f, i) => (f === 1 ? [i] : [])));
  return (
    <div className="sc-progress-wrap">
      <div className="sc-progress" role="progressbar" aria-label={locale === "hu" ? "A folyamatfelmérő előrehaladása" : "Scorecard progress"} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered.length}>
        {sections.map((s, i) => {
          const done = perSection[i] === 1;
          const cls = ["sc-seg", done ? "sc-seg-done" : "", done && !doneAtMount.current!.has(i) ? "sc-seg-sweep" : "", i === current ? "sc-seg-current" : ""].join(" ");
          return <div key={s.name} className={cls} style={{ flexGrow: s.count }} title={s.name}><span style={{ transform: `scaleX(${perSection[i]})` }} /></div>;
        })}
      </div>
      <div className="sc-progress-meta" aria-hidden="true">
        <span>{sections[current]?.name ?? (locale === "hu" ? "Minden kész" : "All done")}{position ? <span className="sc-progress-pos">{locale === "hu" ? `, ${position}. kérdés` : `, question ${position}`}</span> : null}</span>
        <span>{locale === "hu" ? `${answered.length}/${questions.length} megválaszolva` : `${answered.length} of ${questions.length} answered`}</span>
      </div>
    </div>
  );
}

export default function CardFlow({ token, firstName, questions, sections, initialAnswers, initialIndex, locale = "en" }: {
  token: string; firstName: string; questions: FlowQuestion[]; sections: FlowSection[]; initialAnswers: Record<string, string>; initialIndex: number; locale?: Locale;
}) {
  const hu = locale === "hu";
  const unsavedMessage = hu ? "Néhány választ még nem sikerült elmenteni. Ellenőrizd az internetkapcsolatot, majd nyomj Entert az újrapróbáláshoz." : "Some answers haven't been saved yet. Check your connection, then press Enter to try again.";
  const networkMessage = hu ? "Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot, majd nyomj Entert az újrapróbáláshoz." : "We couldn't reach the server. Check your connection and press Enter to try again.";
  const [index, setIndex] = useState(initialIndex);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [message, setMessage] = useState<string>();
  const [saveFailed, setSaveFailed] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [switching, setSwitching] = useState(false);
  const switchingLocale = useRef(false);
  const submittingReport = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unsaved = useRef(new Map<string, string>());
  const persistedAnswers = useRef(new Set(Object.keys(initialAnswers)));
  const flushing = useRef<Promise<void>>(Promise.resolve());
  const flow = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const textField = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const total = questions.length;
  const q = questions[index] as FlowQuestion | undefined; // undefined on the final "submit" card
  const process = answers.P1?.trim() ?? "";

  // ── Saving: optimistic, in order, retried; the final submit waits for everything to land. ──
  const flush = useCallback(() => {
    flushing.current = flushing.current.then(async () => {
      for (const [id, value] of [...unsaved.current]) {
        if (unsaved.current.get(id) !== value) continue;
        for (let attempt = 1; attempt <= SAVE_RETRIES; attempt++) {
          try {
            const r = await saveAnswerAction(token, id, value);
            if (r.ok) {
              persistedAnswers.current.add(id);
              if (unsaved.current.get(id) === value) unsaved.current.delete(id);
            }
            if (!r.ok) setMessage(r.message);
            break;
          } catch {
            if (attempt < SAVE_RETRIES) await new Promise(res => setTimeout(res, 600 * attempt));
          }
        }
      }
      setSaveFailed(unsaved.current.size > 0);
    });
    return flushing.current;
  }, [token]);

  const save = useCallback((id: string, value: string) => {
    unsaved.current.set(id, value);
    void flush();
  }, [flush]);

  // ── Navigation ──
  const go = useCallback((to: number) => {
    if (switchingLocale.current) return;
    clearTimeout(advanceTimer.current);
    if (to < 0 || to > total) return;
    setDir(to > index ? 1 : -1);
    setMessage(undefined);
    setIndex(to);
  }, [index, total]);

  const answeredHere = (question: FlowQuestion) =>
    question.kind === "text" ? !question.required || Boolean(answers[question.id]?.trim()) : Boolean(answers[question.id]);

  const submit = useCallback(() => {
    if (switchingLocale.current || submittingReport.current) return;
    submittingReport.current = true;
    startSubmit(async () => {
      try {
        await flush();
        if (unsaved.current.size) { setMessage(unsavedMessage); return; }
        const r = await submitAction(token); // redirects to the report on success
        if (!r.ok) setMessage(r.message);
      } catch {
        setMessage(networkMessage);
      } finally { submittingReport.current = false; }
    });
  }, [flush, token, unsavedMessage, networkMessage]);

  const next = useCallback(() => {
    if (switchingLocale.current) return;
    if (!q) return submit();
    if (!answeredHere(q)) {
      // A small shake says "not yet" without moving focus away from the question.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        card.current?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 260, easing: "ease-out" });
      setMessage(q.kind === "text" ? (hu ? "A folytatáshoz írj be egy választ." : "Type an answer to continue.") : hu ? `A folytatáshoz válassz: nyomj meg egy számot 1 és ${q.options.length} között, vagy kattints egy válaszra.` : `Choose an answer to continue: press 1–${q.options.length} or click one.`);
      return;
    }
    if (q.kind === "text") save(q.id, answers[q.id]?.trim() ?? "");
    go(index + 1);
  }, [q, answers, index, go, save, submit, hu]);

  const select = useCallback((optionId: string) => {
    if (!q || switchingLocale.current) return;
    setAnswers(a => ({ ...a, [q.id]: optionId }));
    setMessage(undefined);
    save(q.id, optionId);
    clearTimeout(advanceTimer.current);
    const from = index;
    advanceTimer.current = setTimeout(() => { setDir(1); setIndex(i => (i === from ? from + 1 : i)); }, ADVANCE_DELAY);
  }, [q, index, save]);

  useEffect(() => {
    const onLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent<{ href: string; locale: Locale }>).detail;
      if (!event.cancelable || !detail || typeof detail.href !== "string" || (detail.locale !== "en" && detail.locale !== "hu")) return;
      event.preventDefault();
      if (switchingLocale.current || submittingReport.current) return;
      switchingLocale.current = true;
      setSwitching(true);
      clearTimeout(advanceTimer.current);
      setMessage(undefined);
      // Text left with the back/next arrows is also a draft worth preserving.
      for (const question of questions) {
        if (question.kind !== "text" || question.id === q?.id || !(question.id in answers)) continue;
        const value = answers[question.id].replace(/\u0000/g, "").trim();
        if ((!question.required || value) && (!question.maxLength || value.length <= question.maxLength)) unsaved.current.set(question.id, value);
      }
      // Read the field itself so even the latest keystroke is included before navigation.
      if (q?.kind === "text") {
        const value = (textField.current?.value ?? answers[q.id] ?? "").replace(/\u0000/g, "").trim();
        if ((!q.required || value) && (!q.maxLength || value.length <= q.maxLength)) {
          unsaved.current.set(q.id, value);
        } else if (value || (q.required && (persistedAnswers.current.has(q.id) || unsaved.current.has(q.id)))) {
          setMessage(value
            ? (hu ? "A válasz túl hosszú. Rövidítsd le, mielőtt nyelvet váltasz." : "That answer is too long. Shorten it before changing language.")
            : (hu ? "Nyelvváltás előtt add meg a folyamatot, hogy ne vesszen el, amit beírtál." : "Enter the process before changing language so your edit isn't lost."));
          switchingLocale.current = false;
          setSwitching(false);
          return;
        }
      }
      startTransition(async () => {
        let navigating = false;
        try {
          await flush();
          if (unsaved.current.size) {
            setMessage(hu ? "Néhány választ nem sikerült elmenteni. Ellenőrizd az internetkapcsolatot, majd próbáld újra a nyelvváltást." : "Some answers haven't been saved yet. Check your connection, then try changing language again.");
            return;
          }
          const result = await changeScorecardLocaleAction(token, detail.locale);
          if (!result.ok) { setMessage(result.message); return; }
          window.location.assign(detail.href);
          navigating = true;
        } catch {
          setMessage(hu ? "Nem sikerült nyelvet váltani. Ellenőrizd az internetkapcsolatot, majd próbáld újra." : "We couldn't change language. Check your connection and try again.");
        } finally {
          if (!navigating) { switchingLocale.current = false; setSwitching(false); }
        }
      });
    };
    window.addEventListener("grismont:language-change", onLanguageChange);
    return () => window.removeEventListener("grismont:language-change", onLanguageChange);
  }, [q, questions, answers, initialAnswers, flush, token, hu]);

  // ── Keyboard: numbers choose, Enter/Space/→ continue, Backspace/← go back, ↑/↓ move between options. ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || e.isComposing || submitting || switchingLocale.current) return;
      const t = e.target as HTMLElement;
      if (t.matches("input, textarea, select, [contenteditable]")) {
        // While typing, only Enter (without Shift) leaves the field; everything else edits the text.
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); next(); }
        return;
      }
      if (q && q.kind !== "text" && /^[1-9]$/.test(e.key)) {
        const option = q.options[Number(e.key) - 1];
        if (option) { e.preventDefault(); select(option.id); }
        return;
      }
      const onControl = t.matches("button, a");
      switch (e.key) {
        case "Enter":
        case " ":
          if (onControl) return; // let the focused button do its own thing
          e.preventDefault(); next(); break;
        case "ArrowRight": e.preventDefault(); next(); break;
        case "ArrowLeft":
        case "Backspace": e.preventDefault(); go(index - 1); break;
        case "ArrowDown":
        case "ArrowUp": {
          const opts = [...document.querySelectorAll<HTMLButtonElement>(".sc-choice")];
          if (!opts.length) return;
          e.preventDefault();
          const at = opts.indexOf(document.activeElement as HTMLButtonElement);
          const to = at === -1 ? (e.key === "ArrowDown" ? 0 : opts.length - 1) : (at + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
          opts[to].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, index, next, select, go, submitting]);

  // Each new card takes focus, then returns the questionnaire to its most readable viewport position.
  const firstRender = useRef(true);
  useEffect(() => {
    const shouldFocus = !firstRender.current || q?.kind === "text";
    firstRender.current = false;
    if (shouldFocus) (q?.kind === "text" ? textField.current : heading.current)?.focus({ preventScroll: true });

    const frame = requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tabletOrMobile = window.matchMedia("(max-width: 1000px)").matches;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      let target: number;

      if (tabletOrMobile) {
        const flowRect = flow.current?.getBoundingClientRect();
        if (!flowRect) return;
        target = window.scrollY + flowRect.top;
      } else {
        const stageRect = stage.current?.getBoundingClientRect();
        if (!stageRect) return;
        target = window.scrollY + stageRect.top + stageRect.height / 2 - viewportHeight / 2;
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
      const top = Math.min(Math.max(0, target), maxScroll);
      if (reducedMotion) window.scrollTo(0, top);
      else window.scrollTo({ top, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [index, q?.kind]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const section = q ? q.section : sections.length;
  const inSection = q ? questions.filter(x => x.section === q.section) : [];
  const posInSection = q ? inSection.indexOf(q) + 1 : 0;

  return (
    <section ref={flow} className="sc-flow" aria-label={hu ? "A folyamatfelmérő kérdései" : "Discovery Scorecard questions"} aria-busy={switching || submitting}>
      <Progress questions={questions} sections={sections} answers={answers} current={section}
        position={q && inSection.length > 1 ? (hu ? `${posInSection}/${inSection.length}` : `${posInSection} of ${inSection.length}`) : undefined} editingId={q?.kind === "text" ? q.id : undefined} locale={locale} />

      <div ref={stage} className="sc-stage" inert={switching}>
        <div key={index} ref={card} className={`sc-card ${dir === 1 ? "sc-in-fwd" : "sc-in-back"}`}>
          {q ? (
            <>
              <h1 ref={heading} tabIndex={-1} id="sc-q" className="sc-card-q"><span className="sc-card-n">{index + 1}</span><Prompt text={q.prompt} process={process} locale={locale} /></h1>
              {q.help ? <p className="sc-card-help" id="sc-q-help">{q.help}</p> : null}

              {q.kind === "text" ? (
                <div className="sc-text">
                  {q.maxLength && q.maxLength > 120 ? (
                    <textarea ref={textField} rows={3} maxLength={q.maxLength} placeholder={q.placeholder} value={answers[q.id] ?? ""} aria-required={q.required} aria-labelledby="sc-q" aria-describedby={q.help ? "sc-q-help" : undefined}
                      onChange={e => { setAnswers(a => ({ ...a, [q.id]: e.target.value })); setMessage(undefined); }} />
                  ) : (
                    <input ref={textField} maxLength={q.maxLength} placeholder={q.placeholder} value={answers[q.id] ?? ""} aria-labelledby="sc-q" aria-describedby={q.help ? "sc-q-help" : undefined}
                      aria-required={q.required} autoComplete="off" onChange={e => { setAnswers(a => ({ ...a, [q.id]: e.target.value })); setMessage(undefined); }} />
                  )}
                  <div className="sc-ok">
                    <button type="button" className="gm-cta" onClick={next}>{q.required || answers[q.id]?.trim() ? (hu ? "Rendben" : "OK") : (hu ? "Kihagyás" : "Skip")}</button>
                    <span className="sc-keyhint">{hu ? "folytatás: " : "press "}<kbd>Enter ↵</kbd>{q.maxLength && q.maxLength > 120 ? <> · <kbd>Shift</kbd>+<kbd>Enter</kbd>{hu ? " új sorhoz" : " for a new line"}</> : null}</span>
                  </div>
                </div>
              ) : (
                <div className="sc-choices" role="radiogroup" aria-labelledby="sc-q">
                  {q.options.map((o, i) => {
                    const checked = answers[q.id] === o.id;
                    return (
                      <button key={o.id} type="button" role="radio" aria-checked={checked} className="sc-choice" onClick={() => select(o.id)}>
                        <kbd aria-hidden="true">{i + 1}</kbd>
                        <span>{o.label}</span>
                        {checked ? <svg className="sc-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <h1 ref={heading} tabIndex={-1} className="sc-card-q">{hu ? `Minden kérdésre válaszoltál, ${firstName}.` : `That's everything, ${firstName}.`}</h1>
              <p className="sc-card-help">{hu ? "Beküldés után azonnal elkészül a riportod: a céged profilja, a legnagyobb kockázat, három gyorsan megvalósítható javítás és egy 90 napos ütemterv. PDF-ben e-mailben is elküldjük." : "Your report is built the moment you submit: your profile, biggest risk, three quick wins and a 90-day roadmap. A PDF copy goes to your inbox."}</p>
              <div className="sc-ok">
                <button type="button" className="gm-cta" onClick={submit} disabled={submitting || switching}>{submitting ? (hu ? "A riport készül…" : "Building your report…") : (hu ? "Megnézem a riportot" : "See my report")} <span aria-hidden="true">↗</span></button>
                <span className="sc-keyhint">{hu ? "folytatás: " : "press "}<kbd>Enter ↵</kbd></span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sc-flow-foot">
        <p className="sc-flow-msg" role="status" aria-live="polite">{message ?? (switching ? (hu ? "Válaszok mentése és nyelvváltás…" : "Saving answers and changing language…") : saveFailed ? (hu ? "Néhány választ még nem sikerült elmenteni; újrapróbáljuk." : "Some answers aren't saved yet; we'll keep trying.") : "")}</p>
        <span className="sc-keyhint sc-keyhint-nav">{q && q.kind !== "text" ? <><kbd>1</kbd>–<kbd>{q.options.length}</kbd>{hu ? " választás · " : " choose · "}</> : null}<kbd>Enter</kbd>{hu ? " tovább · " : " next · "}<kbd>←</kbd>{hu ? " vissza" : " back"}</span>
        <nav className="sc-flow-nav" aria-label={hu ? "Navigáció a kérdések között" : "Question navigation"}>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0 || switching} aria-label={hu ? "Előző kérdés" : "Previous question"}>←</button>
          <button type="button" onClick={next} disabled={!q || switching} aria-label={hu ? "Következő kérdés" : "Next question"}>→</button>
        </nav>
      </div>
    </section>
  );
}
