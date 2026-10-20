import type { Metadata } from "next";
import ScorecardMessage from "../../../../components/scorecard/ScorecardMessage";
import { getByResumeToken } from "../../../../lib/scorecard/store";
import { deleteAction } from "../../actions";
import { getLocale } from "../../../../lib/i18n-server";
import { localizePath } from "../../../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await getLocale() === "hu" ? "A folyamatfelmérőm törlése" : "Delete my scorecard", referrer: "no-referrer" };
}

// Deletion needs an explicit button press: email link scanners open links but don't submit forms.
export default async function DeletePage({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getLocale();
  const hu = locale === "hu";
  const { token } = await params;
  const s = await getByResumeToken(token);
  if (!s) return <ScorecardMessage locale={locale} title={hu ? "Nincs mit törölni." : "Nothing to delete."} text={hu ? "Ezeket a válaszokat már töröltük, vagy a link nem érvényes." : "These answers have already been deleted, or the link is not valid."} />;
  return (
    <ScorecardMessage locale={locale} title={hu ? "Törlöd a folyamatfelmérődet?" : "Delete your scorecard?"} text={hu ? `Ezzel véglegesen törlöd a válaszaidat${s.status === "completed" ? ", a riportot" : ""} és a felméréshez megadott elérhetőségeidet. Ezt nem lehet visszavonni.` : `This permanently deletes the answers${s.status === "completed" ? ", the report" : ""} and your contact details linked to this scorecard. It can't be undone.`}>
      <form action={deleteAction}>
        <input type="hidden" name="token" value={token} />
        <button className="gm-cta" type="submit">{hu ? "Végleges törlés" : "Delete permanently"}</button>
      </form>
      <a className="gm-text-link" href={localizePath(locale, "/")}>{hu ? "Mégsem, vissza a főoldalra" : "Keep it and go back"}</a>
    </ScorecardMessage>
  );
}
