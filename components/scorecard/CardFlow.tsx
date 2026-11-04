"use client";

import { Fragment, startTransition, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { changeScorecardLocaleAction, saveAnswerAction, submitAction } from "../../app/scorecard/actions";
import { getScorecardCopy } from "../../content/scorecard/copy";
import { localizePath, type Locale } from "../../lib/i18n";
import { INDUSTRIES, SIZE_BANDS } from "../../lib/scorecard/types";
import { getQuestionContent } from "../../content/scorecard/questions";
import { minutesLeft, resetCardScroll, useSectionMomentum } from "./momentum";

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

// Step 3 work-type labels (04 §2) are shorter than the report's INDUSTRY_LABELS.
const WORK_TYPES = {
  en: { manufacturing: "Manufacturing or logistics", services: "Customer service", office: "Office and admin", other: "Other" },
  hu: { manufacturing: "Gyártás vagy logisztika", services: "Ügyfélszolgálat", office: "Iroda és adminisztráció", other: "Egyéb" },
} as const;

const ADVANCE_DELAY = 380; // long enough to see the choice register, short enough to feel instant
const SAVE_RETRIES = 3;

/** Prompt with the named process piped in where it says {process}. */
function Prompt({ text, process, locale }: { text: string; process: string; locale: Locale }) {
  const parts = text.split("{process}");
  const name = process ? getScorecardCopy(locale).midSentence(process) : locale === "hu" ? "ez a folyamat" : "this process";
  return <>{parts.map((p, i) => <Fragment key={i}>{p}{i < parts.length - 1 ? <span className="sc-pipe">{name}</span> : null}</Fragment>)}</>;
}

/** The promised count: only the choice questions are numbered, the process name and free text aren't. */
const numbered = (questions: FlowQuestion[]) => questions.filter(q => q.kind !== "text");

function answeredList(questions: FlowQuestion[], answers: Record<string, string>, editingId?: string) {
  // A text answer counts once it has been confirmed, not while it is still being typed.
  return questions.filter(q => q.id in answers && !(q.kind === "text" && q.id === editingId) && (q.kind !== "text" || !q.required || answers[q.id].trim()));
}

function Progress({ questions, sections, answers, current, position, editingId, index, locale }: {
  questions: FlowQuestion[]; sections: FlowSection[]; answers: Record<string, string>; current: number; position?: string; editingId?: string; index: number; locale: Locale;
}) {
  const hu = locale === "hu";
  const answered = answeredList(questions, answers, editingId);
  const scored = numbered(questions);
  const answeredScored = answered.filter(q => q.kind !== "text").length;
  const here = questions[index] as FlowQuestion | undefined;
  const number = here && here.kind !== "text" ? scored.indexOf(here) + 1 : 0;
  const left = number ? scored.length - number + 1 : here && index === 0 ? scored.length : 0;
  const timeLeft = left ? (hu ? `kb. ${minutesLeft(left, scored.length)} perc van hátra` : `about ${minutesLeft(left, scored.length)} min left`) : "";
  const count = !here ? (hu ? `${answeredScored}/${scored.length} megválaszolva` : `${answeredScored} of ${scored.length} answered`)
    : number ? (hu ? `${number}. kérdés / ${scored.length}` : `Question ${number} of ${scored.length}`)
    : index === 0 ? (hu ? "Mielőtt elkezdjük" : "Before the questions") : (hu ? "Utolsó kérdés" : "One last question");
  const doneAtMount = useRef<Set<number> | null>(null);
  const perSection = sections.map((s, i) => answered.filter(q => q.section === i).length / s.count);
  doneAtMount.current ??= new Set(perSection.flatMap((f, i) => (f === 1 ? [i] : [])));
  return (
    <div className="sc-progress-wrap">
      <div className="sc-progress" role="progressbar" aria-label={locale === "hu" ? "A Folyamat-pontozó előrehaladása" : "Scorecard progress"} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered.length} aria-valuetext={hu ? `${answeredScored}/${scored.length} kérdés megválaszolva` : `${answeredScored} of ${scored.length} questions answered`}>
        {sections.map((s, i) => {
          const done = perSection[i] === 1;
          const cls = ["sc-seg", done ? "sc-seg-done" : "", done && !doneAtMount.current!.has(i) ? "sc-seg-sweep" : "", i === current ? "sc-seg-current" : ""].join(" ");
          return <div key={s.name} className={cls} style={{ flexGrow: s.count }} title={s.name}><span style={{ transform: `scaleX(${perSection[i]})` }} /></div>;
        })}
      </div>
      <div className="sc-progress-meta" aria-hidden="true">
        <span>{sections[current]?.name ?? (locale === "hu" ? "Minden kész" : "All done")}{position ? <span className="sc-progress-pos">{locale === "hu" ? `, ${position}. kérdés` : `, question ${position}`}</span> : null}</span>
        <span className="sc-progress-count">{count}{timeLeft ? ` · ${timeLeft}` : ""}</span>
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
  const [saving, setSaving] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [switching, setSwitching] = useState(false);
  const switchingLocale = useRef(false);
  const submittingReport = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unsaved = useRef(new Map<string, string>());
  const persistedAnswers = useRef(new Set(Object.keys(initialAnswers)));
  const flushing = useRef<Promise<void>>(Promise.resolve());
  const heading = useRef<HTMLHeadingElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const textField = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const profileForm = useRef<HTMLFormElement>(null);

  const total = questions.length;
  const { SIZE_LABELS } = getQuestionContent(locale);
  const q = questions[index] as FlowQuestion | undefined; // undefined on the final "submit" card
  const process = answers.P1?.trim() ?? "";

  // ── Saving: optimistic, in order, retried; the final submit waits for everything to land. ──
  const flush = useCallback(() => {
    flushing.current = flushing.current.then(async () => {
      setSaving(true);
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
      setSaving(false);
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

  /** Submits with the optional step-3 profile, or without it when the visitor skips. */
  const submit = useCallback((skipProfile = false) => {
    if (switchingLocale.current || submittingReport.current) return;
    submittingReport.current = true;
    const profile = !skipProfile && profileForm.current
      ? Object.fromEntries([...new FormData(profileForm.current)].filter(([, v]) => typeof v === "string" && v.trim()))
      : {};
    startSubmit(async () => {
      try {
        await flush();
        if (unsaved.current.size) { setMessage(unsavedMessage); return; }
        const r = await submitAction(token, profile); // redirects to the report on success
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

    resetCardScroll();
  }, [index, q?.kind]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const section = q ? q.section : sections.length;
  const answeredNow = answeredList(questions, answers, q?.kind === "text" ? q.id : undefined);
  const momentum = useSectionMomentum(index, sections.map((s, i) => answeredNow.filter(x => x.section === i).length === s.count), (done, left) => {
    const name = sections[done].name;
    if (!left) return hu ? `${name}: kész. Mind a hat terület megvan.` : `${name} done. All six areas finished.`;
    return hu ? `${name}: kész. Még ${left} terület van hátra.` : `${name} done, ${left} ${left === 1 ? "area" : "areas"} left.`;
  }, 0);
  const inSection = q ? questions.filter(x => x.section === q.section) : [];
  const posInSection = q ? inSection.indexOf(q) + 1 : 0;

  return (
    <section className="sc-flow" aria-label={hu ? "A Folyamat-pontozó kérdései" : "Discovery Scorecard questions"} aria-busy={switching || submitting}>
      <Progress questions={questions} sections={sections} answers={answers} current={section}
        position={q && inSection.length > 1 ? (hu ? `${posInSection}/${inSection.length}` : `${posInSection} of ${inSection.length}`) : undefined} editingId={q?.kind === "text" ? q.id : undefined} index={index} locale={locale} />

      <div className="sc-stage" inert={switching}>
        <div key={index} ref={card} className={`sc-card ${dir === 1 ? "sc-in-fwd" : "sc-in-back"}`}>
          {q ? (
            <>
              <h1 ref={heading} tabIndex={-1} id="sc-q" className="sc-card-q"><span className="sc-card-n" aria-hidden="true">{q.kind === "text" ? "" : numbered(questions).indexOf(q) + 1}</span><Prompt text={q.prompt} process={process} locale={locale} /></h1>
              {q.help ? <p className="sc-card-help" id="sc-q-help">{q.help}</p> : null}

              {q.kind === "text" ? (
                <div className="sc-text">
                  {q.maxLength && q.maxLength > 120 ? (
                    <textarea ref={textField} name={q.id} rows={3} maxLength={q.maxLength} placeholder={q.placeholder} value={answers[q.id] ?? ""} aria-required={q.required} aria-labelledby="sc-q" aria-describedby={q.help ? "sc-q-help" : undefined}
                      onChange={e => { setAnswers(a => ({ ...a, [q.id]: e.target.value })); setMessage(undefined); }} />
                  ) : (
                    <input ref={textField} name={q.id} maxLength={q.maxLength} placeholder={q.placeholder} value={answers[q.id] ?? ""} aria-labelledby="sc-q" aria-describedby={q.help ? "sc-q-help" : undefined}
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
                    // One tab stop for the group; ↑/↓ moves between the options.
                    const tabStop = checked || (!answers[q.id] && i === 0);
                    return (
                      <button key={o.id} type="button" role="radio" aria-checked={checked} tabIndex={tabStop ? 0 : -1} className="sc-choice" onClick={() => select(o.id)}>
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
              <p className="sc-card-help">{hu ? "Három opcionális kérdés, hogy a jelentésed hasznosabb legyen." : "Three optional questions help me make your report more useful."}</p>
              <form ref={profileForm} className="sc-profile-form" onSubmit={event => { event.preventDefault(); submit(); }}>
                <div className="sc-fields">
                  <label className="sc-field"><span>{hu ? "Cégméret" : "Company size"}</span>
                    <select name="companySize" defaultValue=""><option value="">{hu ? "Válassz…" : "Choose…"}</option>{SIZE_BANDS.map(size => <option key={size} value={size}>{SIZE_LABELS[size]}</option>)}</select></label>
                  <label className="sc-field"><span>{hu ? "Munka jellege" : "Type of work"}</span>
                    <select name="industry" defaultValue=""><option value="">{hu ? "Válassz…" : "Choose…"}</option>{INDUSTRIES.map(i => <option key={i} value={i}>{WORK_TYPES[locale][i]}</option>)}</select></label>
                  <label className="sc-field"><span>{hu ? "Beosztásod" : "Your role"}</span><input name="role" autoComplete="organization-title" maxLength={80} /></label>
                  <label className="sc-field"><span>{hu ? "Cég" : "Company"} <em>{hu ? "(opcionális)" : "(optional)"}</em></span><input name="companyName" autoComplete="organization" maxLength={120} /></label>
                </div>
                {/* Marketing consent: separate, optional and never pre-ticked (04 §3). */}
                <label className="sc-consent"><input type="checkbox" name="followUp" /><span>{hu ? "Küldj néhány hasznos e-mailt az eredményeimmel kapcsolatban." : "Send me a few useful follow-up emails about my results."} <a href={localizePath(locale, "/privacy#scorecard")} target="_blank">{hu ? "Részletek" : "Details"}<span className="sc-sr">{hu ? " (új lapon nyílik meg)" : " (opens in a new tab)"}</span></a></span></label>
                <div className="sc-ok">
                  <button type="submit" className="gm-cta" disabled={submitting || switching}>{submitting ? (hu ? "A riport készül…" : "Building your report…") : (hu ? "Mutasd az eredményt" : "Show my report")} <span aria-hidden="true">↗</span></button>
                  <button type="button" className="sc-skip" onClick={() => submit(true)} disabled={submitting || switching}>{hu ? "Kihagyom" : "Skip"}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="sc-flow-foot">
        <p className="sc-flow-msg" role="status" aria-live="polite">{message ?? (switching ? (hu ? "Válaszok mentése és nyelvváltás…" : "Saving answers and changing language…") : saveFailed ? (hu ? "Néhány választ még nem sikerült elmenteni; újrapróbáljuk." : "Some answers aren't saved yet; we'll keep trying.") : momentum ? <span key={momentum} className="sc-momentum">{momentum}</span> : "")}</p>
        {answeredNow.length && !saveFailed ? <span className="sc-save-state" aria-hidden="true">{saving ? (hu ? "Mentés…" : "Saving…") : (hu ? "Mentve" : "Saved")}</span> : null}
        <span className="sc-keyhint sc-keyhint-nav">{q && q.kind !== "text" ? <><kbd>1</kbd>–<kbd>{q.options.length}</kbd>{hu ? " választás · " : " choose · "}</> : null}<kbd>Enter</kbd>{hu ? " tovább · " : " next · "}<kbd>←</kbd>{hu ? " vissza" : " back"}</span>
        <nav className="sc-flow-nav" aria-label={hu ? "Navigáció a kérdések között" : "Question navigation"}>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0 || switching} aria-label={hu ? "Előző kérdés" : "Previous question"}>←</button>
          <button type="button" onClick={next} disabled={!q || switching} aria-label={hu ? "Következő kérdés" : "Next question"}>→</button>
        </nav>
      </div>
    </section>
  );
}
