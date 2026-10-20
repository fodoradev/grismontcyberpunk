import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "./globals.css";
import { getLocale, getPublicPath } from "../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
  title: { default: locale === "hu" ? "Folyamatfejlesztés, automatizálás és AI | Grismont" : "Lean Six Sigma, AI & Automation | Grismont", template: "%s | Grismont" },
  description: locale === "hu" ? "Átláthatóbb folyamatok, kevesebb felesleges kör. Attila Lean Six Sigma szemlélettel, automatizálással és AI-megoldásokkal segít. Kezdd az ingyenes folyamatfelmérővel." : "Make work easier to follow. Attila combines Lean Six Sigma, process improvement, automation and AI. Start with a free Discovery Scorecard.",
  robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, path] = await Promise.all([getLocale(), getPublicPath()]);
  return <html lang={locale} data-scroll-behavior="smooth"><body><div id="grismont-board"><a className="skip-link" href="#main-content">{locale === "hu" ? "Ugrás a tartalomra" : "Skip to content"}</a><SiteHeader locale={locale} path={path} />{children}<SiteFooter locale={locale} /></div></body></html>;
}
