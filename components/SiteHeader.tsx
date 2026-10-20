"use client";

import LanguageSwitch from "./LanguageSwitch";
import { localizePath, type Locale } from "../lib/i18n";

export default function SiteHeader({ locale = "en", path = "/" }: { locale?: Locale; path?: string }) {
  const hu = locale === "hu";
  const links = [
    { href: "/#services", text: hu ? "Szolgáltatások" : "The work" },
    { href: "/#method", text: hu ? "Így dolgozom" : "The approach" },
    { href: "/#about", text: hu ? "Rólam" : "About Attila" },
    { href: "/#contact", text: hu ? "Kapcsolat" : "Get in touch" },
  ];
  return (
    <header className="gm-top gm-shell">
      <a className="gm-wordmark" href={localizePath(locale, "/#home")} aria-label={hu ? "Grismont főoldal" : "Grismont home"}>grismont<span>.</span></a>
      <nav className="gm-nav" aria-label={hu ? "Fő navigáció" : "Main navigation"}>{links.map(link => <a href={localizePath(locale, link.href)} key={link.href}>{link.text}</a>)}</nav>
      <div className="gm-header-tools"><LanguageSwitch locale={locale} path={path} /><a className="gm-header-cta" href={localizePath(locale, "/scorecard")}><span className="gm-cta-full">{hu ? "Ingyenes felmérés" : "Free scorecard"}</span><span className="gm-cta-short">{hu ? "Felmérő" : "Scorecard"}</span><span aria-hidden="true">↗</span></a></div>
      <details className="gm-mobile-menu"><summary>{hu ? "Menü" : "Explore Grismont"}</summary><nav aria-label={hu ? "Mobil navigáció" : "Mobile navigation"}>{links.map(link => <a href={localizePath(locale, link.href)} key={link.href} onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}>{link.text}</a>)}</nav></details>
    </header>
  );
}
