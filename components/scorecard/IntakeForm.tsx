"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { startScorecard, type IntakeState } from "../../app/scorecard/actions";
import { localizePath, type Locale } from "../../lib/i18n";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span className="sc-error" id={`${id}-error`}>{message}</span> : null;
}

export default function IntakeForm({ locale = "en" }: { locale?: Locale }) {
  const hu = locale === "hu";
  const [state, action, pending] = useActionState<IntakeState, FormData>(async (previous, data) => {
    // Keep the entered details available if the action cannot reach the server.
    try { return await startScorecard(previous, data); }
    catch (error) {
      // Next.js redirects are control flow and must reach the framework.
      if (error instanceof Error && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) throw error;
      return {
        message: hu ? "Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot, majd próbáld újra." : "We couldn't reach the server. Check your connection and try again.",
        values: Object.fromEntries([...data].filter(([key, value]) => !key.startsWith("$") && typeof value === "string")) as Record<string, string>,
      };
    }
  }, {});
  const v = state.values ?? {};
  const err = (name: string) => state.errors?.[name];
  const describe = (name: string) => (err(name) ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});
  const form = useRef<HTMLFormElement>(null);
  // After a failed submit, move focus to the first invalid field so keyboard and screen-reader users land on it.
  useEffect(() => { form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); }, [state]);

  return (
    <form ref={form} action={action} className="sc-intake" noValidate onSubmit={event => {
      // React resets the fields when an `action` prop returns, which would drop a tick made meanwhile; dispatching keeps them as typed.
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => action(data));
    }}>
      <input type="hidden" name="locale" value={locale} />
      {state.message ? <p className="sc-alert" role="alert">{state.message}</p> : null}
      <div className="sc-fields">
        <label className="sc-field">
          <span>{hu ? "Keresztnév" : "First name"}</span>
          <input name="firstName" autoComplete="given-name" required maxLength={60} defaultValue={v.firstName} {...describe("firstName")} />
          <FieldError id="firstName" message={err("firstName")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Munkahelyi e-mail" : "Work email"}</span>
          <input name="email" type="email" autoComplete="email" spellCheck={false} required maxLength={254} defaultValue={v.email} {...describe("email")} />
          <FieldError id="email" message={err("email")} />
        </label>
      </div>
      <label className="sc-hp" aria-hidden="true">{hu ? "Weboldal" : "Website"}<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="sc-consent">
        <input type="checkbox" name="consent" required defaultChecked={v.consent === "on"} {...describe("consent")} />
        <span>{hu ? "Elolvastam az " : "I have read the "}<a href={localizePath(locale, "/privacy")} target="_blank">{hu ? "adatkezelési tájékoztatót" : "privacy notice"}<span className="sc-sr">{hu ? " (új lapon nyílik meg)" : " (opens in a new tab)"}</span></a>.</span>
      </label>
      <FieldError id="consent" message={err("consent")} />
      {/* Separate and optional, never pre-ticked (04 §2, 07 B). */}
      <label className="sc-consent sc-consent-optional">
        <input type="checkbox" name="reminders" defaultChecked={v.reminders === "on"} />
        <span>{hu ? "Küldj legfeljebb 3 emlékeztetőt, ha nem fejezem be." : "Send me up to 3 reminders if I do not finish."}</span>
      </label>
      <div className="sc-actions">
        <button className="gm-cta" type="submit" disabled={pending}>{pending ? (hu ? "Mentés…" : "Saving…") : (hu ? "Kezdjük a kérdéseket" : "Start the questions")} <span aria-hidden="true">→</span></button>
        <span className="sc-hint">{hu ? "A válaszaidat minden kérdés után mentjük." : "Your answers are saved after every question."}</span>
      </div>
    </form>
  );
}
