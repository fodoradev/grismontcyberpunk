import { VisualBackdrop } from "../components/VisualSlot";
import { getLocale } from "../lib/i18n-server";
import { localizePath } from "../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Az oldal nem található" : "Page not found" };
}

export default async function NotFound() {
  const locale = await getLocale();
  const hu = locale === "hu";
  return <main id="main-content" className="sc-404">
    <VisualBackdrop id="notFound" />
    <div className="sc-404-art">
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
        <path className="sc-404-clear" pathLength="1" d="M0 150 H360" />
        <path className="sc-404-knot" pathLength="1" d="M360 150 C410 150 430 60 480 70 S560 230 490 225 S400 90 500 62 S640 120 590 205 S440 215 480 130 S610 40 640 110 S590 262 530 240 S450 150 540 110 S650 170 610 230" />
      </svg>
      <div className="gm-label sc-404-code">404</div>
    </div>
    <div className="gm-shell sc-404-body">
      <h1>{hu ? "Ez az oldal nincs itt." : "This page isn't here."}</h1>
      <p className="gm-lead">{hu ? "Lehet, hogy megváltozott a címe, vagy hibás a link. A főoldalról könnyen megtalálod, amit keresel." : "The address may have changed, or the link may be incorrect. You can find your way from the homepage."}</p>
      <ul className="sc-404-routes">
        <li><a href={localizePath(locale, "/")}>{hu ? "Vissza a főoldalra" : "Back to the homepage"} <span aria-hidden="true">→</span></a></li>
        <li><a href={localizePath(locale, "/scorecard")}>{hu ? "Ingyenes Folyamat-pontozó" : "Free scorecard"} <span aria-hidden="true">→</span></a></li>
        <li><a href={localizePath(locale, "/#contact")}>{hu ? "Kapcsolat" : "Contact"} <span aria-hidden="true">→</span></a></li>
      </ul>
    </div>
  </main>;
}
