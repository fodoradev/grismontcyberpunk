import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { getComingSoonPages } from "../../data/coming-soon";
import { getLocale } from "../../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "hu" ? "Online képzések — hamarosan" : "Online courses — coming soon", description: getComingSoonPages(locale).courses.intro };
}

export default async function Courses() {
  const locale = await getLocale();
  return <ComingSoonPage {...getComingSoonPages(locale).courses} locale={locale} />;
}
