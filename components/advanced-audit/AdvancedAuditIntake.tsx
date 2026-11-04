"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { startAdvancedAuditAction, type AdvancedAuditStartState } from "../../app/advanced-audit/actions";
import { localizePath, type Locale } from "../../lib/i18n";

export default function AdvancedAuditIntake({ locale }: { locale: Locale }) {
  const hu = locale === "hu";
  const [state, action, pending] = useActionState<AdvancedAuditStartState, FormData>(async (previous, data) => {
    try { return await startAdvancedAuditAction(previous, data); }
    catch (error) {
      if (error instanceof Error && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) throw error;
      return { email: String(data.get("email") ?? ""), message: hu ? "Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, majd próbáld újra." : "We couldn't reach the server. Check your connection and try again." };
    }
  }, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); }, [state]);

  return <form ref={form} action={action} className="sc-intake sc-audit-start" noValidate onSubmit={event => {
    // React resets the fields when an `action` prop returns, which would drop the ticks; dispatching keeps them as entered.
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }}>
    <p className="gm-label">{hu ? "A kitöltés menete" : "Before you begin"}</p>
    <h2>{hu ? "Egy folyamatra gondolj." : "Pick one process to assess."}</h2>
    <p>{hu ? "A teljes audit során erről az egy folyamatról válaszolj. Ha kéred, az első válasz mentése után e-mailben elküldjük a privát folytatási hivatkozást." : "Keep your answers focused on this one process throughout. If you like, we'll email you a private link after you save your first answer, so you can continue later."}</p>
    {state.message ? <p className="sc-alert" role="alert">{state.message}</p> : null}
    <label className="sc-field sc-audit-email">
      <span>{hu ? "E-mail-cím" : "Email address"} <em>{hu ? "a folytatási hivatkozáshoz" : "for the resume link"}</em></span>
      <input name="email" type="email" autoComplete="email" inputMode="email" spellCheck={false} maxLength={254} defaultValue={state.email} aria-invalid={Boolean(state.errors?.email)} aria-describedby={state.errors?.email ? "audit-email-error" : undefined} />
      {state.errors?.email ? <span className="sc-error" id="audit-email-error">{state.errors.email}</span> : null}
    </label>
    <label className="sc-hp" aria-hidden="true">{hu ? "Weboldal" : "Website"}<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="sc-consent sc-audit-consent">
      <input type="checkbox" name="consent" required aria-invalid={Boolean(state.errors?.consent)} aria-describedby={state.errors?.consent ? "audit-consent-error" : undefined} />
      <span>{hu ? <>Elolvastam az <a href={localizePath(locale, "/privacy")} target="_blank">adatkezelési tájékoztatót<span className="sc-sr"> (új lapon nyílik meg)</span></a>.</> : <>I have read the <a href={localizePath(locale, "/privacy")} target="_blank">privacy notice<span className="sc-sr"> (opens in a new tab)</span></a>.</>}</span>
    </label>
    {state.errors?.consent ? <span className="sc-error" id="audit-consent-error">{state.errors.consent}</span> : null}
    <label className="sc-consent sc-consent-optional">
      <input type="checkbox" name="resumeEmail" />
      <span>{hu ? "Küldd el e-mailben a privát folytatási hivatkozást az első válaszom mentése után. Emlékeztetőt vagy marketing e-mailt nem küldtök." : "Email me the private resume link after I save my first answer. No reminders or marketing emails."}</span>
    </label>
    <div className="sc-actions">
      <button className="gm-cta" type="submit" disabled={pending}>{pending ? (hu ? "Mentés…" : "Starting…") : (hu ? "Audit indítása" : "Start the audit")} <span aria-hidden="true">→</span></button>
      <span className="sc-hint">{hu ? "A válaszokat minden kérdés után mentjük." : "Your answers are saved after every question."}</span>
    </div>
    <p className="sc-small">{hu ? "A hivatkozást csak azzal oszd meg, akinek hozzáférést szeretnél adni." : "Anyone with your private link can open your saved audit."}</p>
  </form>;
}
