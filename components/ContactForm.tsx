"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendContactMessage, type ContactState } from "../lib/contact/actions";
import { business } from "../data/business";
import { localizePath, type Locale } from "../lib/i18n";

const copy = {
  en: {
    name: "Name", email: "Work email", message: "What takes too long?", placeholder: "e.g. Our weekly production report takes a full day to build.",
    interest: "I'm interested in", optional: "optional",
    interests: { training: "Training", workshop: "Workshop", programme: "Programme", sprint: "Sprint", unsure: "Not sure yet" },
    consent: ["I have read the ", "privacy notice", "."], newTab: " (opens in a new tab)",
    send: "Send message", sending: "Sending…", thanks: `Thank you. I will reply within one working day. — ${business.firstName}`,
    offline: "We couldn't reach the server. Check your connection and try again.",
  },
  hu: {
    name: "Név", email: "Munkahelyi e-mail", message: "Mi tart túl sokáig?", placeholder: "Pl. a heti gyártási riport összeállítása egy teljes napot elvisz.",
    interest: "Ez érdekel", optional: "nem kötelező",
    interests: { training: "Tréning", workshop: "Workshop", programme: "Program", sprint: "Sprint", unsure: "Még nem tudom" },
    consent: ["Elolvastam az ", "adatkezelési tájékoztatót", "."], newTab: " (új lapon nyílik meg)",
    send: "Üzenet küldése", sending: "Küldés…", thanks: `Köszönöm! Egy munkanapon belül válaszolok. — ${business.firstName}`,
    offline: "Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot, majd próbáld újra.",
  },
};

type Interest = keyof typeof copy.en.interests;

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span className="sc-error" id={`contact-${id}-error`}>{message}</span> : null;
}

export default function ContactForm({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const [state, action, pending] = useActionState<ContactState, FormData>(async (previous, data) => {
    try { return await sendContactMessage(previous, data); }
    catch { return { message: t.offline, values: Object.fromEntries([...data].filter(([k, v]) => !k.startsWith("$") && typeof v === "string")) as Record<string, string> }; }
  }, {});
  const [interest, setInterest] = useState<Interest | "">("");
  const form = useRef<HTMLFormElement>(null);
  const v = state.values ?? {};
  const err = (name: string) => state.errors?.[name];
  const describe = (name: string) => (err(name) ? { "aria-invalid": true, "aria-describedby": `contact-${name}-error` } : {});

  // Service cards link here with data-interest: preselect that choice (without JS the link still reaches the form).
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-interest]");
      const value = link?.dataset.interest;
      if (value && value in copy.en.interests) setInterest(value as Interest);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => { if (state.values?.interest !== undefined) setInterest((state.values.interest || "") as Interest | ""); }, [state.values]);
  // After a failed submit, move focus to the first invalid field (a frame later, once React has reset the form).
  useEffect(() => {
    const frame = requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [state]);

  if (state.ok) return <p className="home-contact-thanks" role="status">{t.thanks}</p>;

  return (
    <form ref={form} action={action} className="home-contact-form" noValidate>
      {state.message ? <p className="sc-alert" role="alert">{state.message}</p> : null}
      <div className="home-contact-row">
        <label className="sc-field"><span>{t.name}</span><input name="name" autoComplete="name" required maxLength={100} defaultValue={v.name} {...describe("name")} /><FieldError id="name" message={err("name")} /></label>
        <label className="sc-field"><span>{t.email}</span><input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} {...describe("email")} /><FieldError id="email" message={err("email")} /></label>
      </div>
      <label className="sc-field"><span>{t.message}</span><textarea name="message" rows={4} required maxLength={3000} placeholder={t.placeholder} defaultValue={v.message} {...describe("message")} /><FieldError id="message" message={err("message")} /></label>
      <fieldset className="home-contact-interest">
        <legend>{t.interest} <em>{t.optional}</em></legend>
        {(Object.keys(t.interests) as Interest[]).map(key => (
          <label key={key}><input type="radio" name="interest" value={key} checked={interest === key} onChange={() => setInterest(key)} /><span>{t.interests[key]}</span></label>
        ))}
      </fieldset>
      <label className="sc-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="sc-consent">
        <input type="checkbox" name="consent" required defaultChecked={v.consent === "on"} {...describe("consent")} />
        <span>{t.consent[0]}<a href={localizePath(locale, "/privacy")} target="_blank">{t.consent[1]}<span className="sc-sr">{t.newTab}</span></a>{t.consent[2]}</span>
      </label>
      <FieldError id="consent" message={err("consent")} />
      <button className="gm-cta light" type="submit" disabled={pending}>{pending ? t.sending : t.send} <span aria-hidden="true">→</span></button>
    </form>
  );
}
