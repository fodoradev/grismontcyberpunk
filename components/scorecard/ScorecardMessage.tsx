import type { ReactNode } from "react";
import { localizePath, type Locale } from "../../lib/i18n";

/** Simple full-page message for expired links, deletion confirmations and similar states. */
export default function ScorecardMessage({ title, text, children, locale = "en" }: { title: string; text: string; children?: ReactNode; locale?: Locale }) {
  return (
    <main id="main-content" className="gm-shell sc-page sc-narrow sc-message">
      <div className="gm-label">{locale === "hu" ? "Folyamat-pontozó" : "Discovery Scorecard"}</div>
      <h1>{title}</h1>
      <p className="gm-lead">{text}</p>
      <div className="sc-actions">{children ?? <a className="gm-cta" href={localizePath(locale, "/scorecard")}>{locale === "hu" ? "Folyamat-pontozó indítása" : "Start the scorecard"} <span aria-hidden="true">↗</span></a>}</div>
    </main>
  );
}
