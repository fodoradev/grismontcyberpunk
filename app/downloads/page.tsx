import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { getComingSoonPages } from "../../data/coming-soon";
import { getLocale } from "../../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Letölthető anyagok — hamarosan" : "Digital downloads — coming soon", description: getComingSoonPages(locale).downloads.intro };
}

export default async function Downloads() {
  const locale = await getLocale();
  return <ComingSoonPage {...getComingSoonPages(locale).downloads} locale={locale} />;
}
