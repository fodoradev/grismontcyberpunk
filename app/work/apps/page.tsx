import type { Metadata } from "next";
import ComingSoonPage from "../../../components/ComingSoonPage";
import { getComingSoonPages } from "../../../data/coming-soon";
import { getLocale } from "../../../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Elkészült alkalmazások — hamarosan" : "Apps built — coming soon", description: getComingSoonPages(locale).apps.intro };
}

export default async function Apps() {
  const locale = await getLocale();
  return <ComingSoonPage {...getComingSoonPages(locale).apps} locale={locale} />;
}
