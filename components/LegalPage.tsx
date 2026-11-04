import type { ReactNode } from "react";
import Link from "next/link";
import LegalIndex from "./LegalIndex";
import { localizePath, type Locale } from "../lib/i18n";

export default function LegalPage({ eyebrow, title, intro, children, locale = "en", updated }: { eyebrow: string; title: string; intro: string; children: ReactNode; locale?: Locale; updated?: string }) {
  return <main id="main-content" className="gm-shell legal-page"><div className="legal-head"><Link className="gm-text-link legal-back" href={localizePath(locale, "/")}><span aria-hidden="true">← </span>{locale === "hu" ? "Vissza a Grismont főoldalára" : "Back to Grismont"}</Link><div className="gm-label">{eyebrow}</div><h1>{title}</h1><p className="legal-intro">{intro}</p></div><div className="legal-main"><div className="legal-body">{children}</div><div className="legal-updated">{updated ?? (locale === "hu" ? "A tervezet készült: 2026. október 13." : "Draft prepared 13 October 2026")}</div></div><LegalIndex label={locale === "hu" ? "Ezen az oldalon" : "On this page"} /></main>;
}
