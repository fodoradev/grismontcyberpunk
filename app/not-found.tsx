import { getLocale } from "../lib/i18n-server";
import { localizePath } from "../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Az oldal nem található" : "Page not found" };
}

export default async function NotFound() {
  const locale = await getLocale();
  const hu = locale === "hu";
  return <main id="main-content" className="gm-shell sc-page sc-narrow sc-message">
    <div className="gm-label">404</div>
    <h1>{hu ? "Ez az oldal nincs itt." : "This page isn't here."}</h1>
    <p className="gm-lead">{hu ? "Lehet, hogy megváltozott a címe, vagy hibás a link. A főoldalról könnyen megtalálod, amit keresel." : "The address may have changed, or the link may be incorrect. You can find your way from the homepage."}</p>
    <div className="sc-actions"><a className="gm-cta" href={localizePath(locale, "/")}>{hu ? "Vissza a főoldalra" : "Back to the homepage"} <span aria-hidden="true">↗</span></a></div>
  </main>;
}
