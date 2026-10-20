"use client";

import { useActionState, useEffect, useRef } from "react";
import { startScorecard, type IntakeState } from "../../app/scorecard/actions";
import { getQuestionContent } from "../../content/scorecard/questions";
import { localizePath, type Locale } from "../../lib/i18n";
import { INDUSTRIES, SIZE_BANDS } from "../../lib/scorecard/types";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span className="sc-error" id={`${id}-error`}>{message}</span> : null;
}

export default function IntakeForm({ locale = "en" }: { locale?: Locale }) {
  const hu = locale === "hu";
  const { INDUSTRY_LABELS, SIZE_LABELS } = getQuestionContent(locale);
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
    <form ref={form} action={action} className="sc-intake" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {state.message ? <p className="sc-alert" role="alert">{state.message}</p> : null}
      <div className="sc-fields">
        <label className="sc-field">
          <span>{hu ? "Keresztnév" : "First name"}</span>
          <input name="firstName" autoComplete="given-name" required maxLength={60} defaultValue={v.firstName} {...describe("firstName")} />
          <FieldError id="firstName" message={err("firstName")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Munkahelyi e-mail-cím" : "Work email"}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} {...describe("email")} />
          <FieldError id="email" message={err("email")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Cégméret" : "Company size"}</span>
          <select key={v.companySize ?? ""} name="companySize" required defaultValue={v.companySize ?? ""} {...describe("companySize")}>
            <option value="" disabled>{hu ? "Válassz…" : "Choose…"}</option>
            {SIZE_BANDS.map(s => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
          </select>
          <FieldError id="companySize" message={err("companySize")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Tevékenységi terület" : "Type of work"}</span>
          <select key={v.industry ?? ""} name="industry" required defaultValue={v.industry ?? ""} {...describe("industry")}>
            <option value="" disabled>{hu ? "Válaszd a leginkább illőt…" : "Choose the closest…"}</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{INDUSTRY_LABELS[i]}</option>)}
          </select>
          <FieldError id="industry" message={err("industry")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Cégnév" : "Company"} <em>{hu ? "nem kötelező" : "optional"}</em></span>
          <input name="companyName" autoComplete="organization" maxLength={120} defaultValue={v.companyName} {...describe("companyName")} />
          <FieldError id="companyName" message={err("companyName")} />
        </label>
        <label className="sc-field">
          <span>{hu ? "Munkakör" : "Your role"} <em>{hu ? "nem kötelező" : "optional"}</em></span>
          <input name="role" autoComplete="organization-title" maxLength={80} defaultValue={v.role} {...describe("role")} />
          <FieldError id="role" message={err("role")} />
        </label>
      </div>
      <label className="sc-hp" aria-hidden="true">{hu ? "Weboldal" : "Website"}<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="sc-consent">
        <input type="checkbox" name="consent" required defaultChecked={v.consent === "on"} {...describe("consent")} />
        <span>{hu ? "Elolvastam az " : "I've read the "}<a href={localizePath(locale, "/privacy")} target="_blank">{hu ? "adatkezelési tájékoztatót" : "privacy notice"}<span className="sc-sr">{hu ? " (új lapon nyílik meg)" : " (opens in a new tab)"}</span></a>{hu ? ". Hozzájárulok, hogy e-mailt kapjak erről a felmérésről, és egy emlékeztetőt, ha nem fejezem be." : ". You may email me about this scorecard, including one reminder if I don't finish."}</span>
      </label>
      <FieldError id="consent" message={err("consent")} />
      <div className="sc-actions">
        <button className="gm-cta" type="submit" disabled={pending}>{pending ? (hu ? "Mentés…" : "Saving…") : (hu ? "Kezdjük a kérdéseket" : "Start the questions")} <span aria-hidden="true">→</span></button>
        <span className="sc-hint">{hu ? "A válaszaidat menet közben folyamatosan mentjük." : "Your answers are saved after every section."}</span>
      </div>
    </form>
  );
}
