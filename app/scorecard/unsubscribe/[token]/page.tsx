import type { Metadata } from "next";
import ScorecardMessage from "../../../../components/scorecard/ScorecardMessage";
import { getByResumeToken } from "../../../../lib/scorecard/store";
import { unsubscribeAction } from "../../actions";
import { getLocale } from "../../../../lib/i18n-server";
import { localizePath } from "../../../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await getLocale() === "hu" ? "Leiratkozás" : "Unsubscribe", referrer: "no-referrer" };
}

// Like deletion, unsubscribing needs a button press: email link scanners open links but don't submit forms.
export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const locale = await getLocale();
  const hu = locale === "hu";
  const { token } = await params;
  const s = await getByResumeToken(token);
  if (!s) return <ScorecardMessage locale={locale} title={hu ? "Ez a link már nem érvényes." : "This link is no longer valid."} text={hu ? "Az adataidat már töröltük, ezért több e-mailt nem küldünk." : "Your data has already been deleted, so no further emails will be sent."} />;
  if ((await searchParams).done || s.unsubscribedAt) {
    return <ScorecardMessage locale={locale} title={hu ? "Leiratkoztál." : "You're unsubscribed."} text={hu ? "Több követő e-mailt nem küldünk az eredményeiddel kapcsolatban. A riportod továbbra is elérhető a korábbi linken." : "You won't get any more follow-up emails about your results. Your report is still available at its link."}>
      <a className="gm-text-link" href={localizePath(locale, "/")}>{hu ? "Vissza a főoldalra" : "Back to the home page"}</a>
    </ScorecardMessage>;
  }
  return (
    <ScorecardMessage locale={locale} title={hu ? "Leiratkozol a követő e-mailekről?" : "Unsubscribe from follow-up emails?"} text={hu ? "Nem küldünk több e-mailt az eredményeiddel kapcsolatban. A riportod megmarad." : "We'll stop sending follow-up emails about your results. Your report stays available."}>
      <form action={unsubscribeAction}>
        <input type="hidden" name="token" value={token} />
        <button className="gm-cta" type="submit">{hu ? "Leiratkozom" : "Unsubscribe"}</button>
      </form>
    </ScorecardMessage>
  );
}
