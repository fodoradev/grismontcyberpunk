import type { Metadata } from "next";
import ComingSoonPage from "../../../components/ComingSoonPage";
import { getComingSoonPages } from "../../../data/coming-soon";
import { getLocale } from "../../../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Esettanulmányok — hamarosan" : "Case studies — coming soon", description: getComingSoonPages(locale).caseStudies.intro };
}

export default async function CaseStudies() {
  const locale = await getLocale();
  return <ComingSoonPage {...getComingSoonPages(locale).caseStudies} locale={locale} />;
}
