import type { Metadata } from "next";
import ScorecardMessage from "../../../../components/scorecard/ScorecardMessage";
import { getLocale } from "../../../../lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await getLocale() === "hu" ? "Folyamatfelmérő törölve" : "Scorecard deleted" };
}

export default async function DeletedPage() {
  const locale = await getLocale();
  const hu = locale === "hu";
  return <ScorecardMessage locale={locale} title={hu ? "Törölve." : "Deleted."} text={hu ? "Töröltük a válaszaidat, a riportodat és az elérhetőségeidet. A már megkapott e-mailek megmaradnak a postafiókodban." : "Your answers, report and contact details for this scorecard have been removed. Emails already delivered stay in your inbox."} />;
}
