import type { Metadata } from "next";
import { AUDIT_SECTIONS } from "../../lib/advanced-audit/questions";
import { getLocale } from "../../lib/i18n-server";
import AdvancedAuditIntake from "../../components/advanced-audit/AdvancedAuditIntake";

export async function generateMetadata(): Promise<Metadata> {
  const hu = await getLocale() === "hu";
  return { title:hu?"Részletes folyamat-audit":"Advanced audit", description:hu?"Részletes, szabályalapú folyamatfelmérés és 90 napos fejlesztési terv.":"A detailed, rule-based process assessment with a prioritised 90-day improvement plan.", robots:{index:false,follow:false} };
}

export default async function AdvancedAuditPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const hu = await getLocale() === "hu";
  const { error } = await searchParams;
  return <main id="main-content" className="gm-shell sc-page sc-audit-intro">
    {error === "start" && <p className="sc-alert" role="alert">{hu?"Most nem sikerült elindítani az auditot. Kérlek, próbáld újra később.":"We couldn't start the audit just now. Please try again in a moment."}</p>}
    <div className="sc-intro">
      <div className="gm-label">{hu?"Részletes folyamat-audit":"Advanced audit"}</div>
      <h1>{hu?"A folyamat teljesebb képe.":"A deeper look at how work gets done."}</h1>
      <p className="gm-lead">{hu?"Válassz ki egy folyamatot, és válaszolj arról, hogyan működött az elmúlt három hónapban. A „nem tudom” is hasznos válasz. A kitöltés után részletes eredményt és 90 napos fejlesztési tervet kapsz.":"Choose one process and answer based on how it has really run over the last three months. “Don't know” is useful information. At the end, you'll get a detailed assessment and a prioritised 90-day improvement plan."}</p>
      <ol className="sc-areas">{AUDIT_SECTIONS.map((section,index)=><li key={section.id}><span>{String(index+1).padStart(2,"0")} /</span>{hu?section.nameHu:section.name}</li>)}</ol>
      <p className="sc-hint">{hu?"44 kérdés · Kb. 8 perc · A válaszokat mentjük, így a privát hivatkozással később folytathatod.":"44 questions · About 8 minutes · Answers are saved, so you can resume later with your private link."}<br/>{hu?"Személyes adatot ne írj a szabad szöveges válaszokba. A becslésed is megfelelő; bizalmas információt ne adj meg.":"Avoid personal or confidential details in free-text answers. Your best estimate is fine."}</p>
    </div>
    <AdvancedAuditIntake locale={hu?"hu":"en"} />
  </main>;
}
