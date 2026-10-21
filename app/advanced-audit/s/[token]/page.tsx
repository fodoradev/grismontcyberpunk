import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdvancedAuditFlow from "../../../../components/advanced-audit/AdvancedAuditFlow";
import { getLocale } from "../../../../lib/i18n-server";
import { localizePath } from "../../../../lib/i18n";
import { completeAdvancedAudit, getAdvancedAuditByResumeToken } from "../../../../lib/advanced-audit/store";
import { AUDIT_CONTENT_VERSION } from "../../../../lib/advanced-audit/questions";

export async function generateMetadata(): Promise<Metadata> {
  return { title:await getLocale()==="hu"?"Részletes audit kérdőív":"Advanced audit questionnaire", referrer:"no-referrer", robots:{index:false,follow:false} };
}

export default async function AdvancedAuditQuestionnaire({params}:{params:Promise<{token:string}>}) {
  const locale=await getLocale();
  const {token}=await params;
  const valid=/^[A-Za-z0-9_-]{22}$/.test(token);
  const submission=valid?await getAdvancedAuditByResumeToken(token):undefined;
  if(!submission||submission.contentVersion!==AUDIT_CONTENT_VERSION) return <main id="main-content" className="gm-shell sc-message"><div className="gm-label">{locale==="hu"?"Részletes audit":"Advanced audit"}</div><h1>{locale==="hu"?"Ez a privát hivatkozás nem érvényes.":"This private link is no longer available."}</h1><p>{locale==="hu"?"Lehet, hogy törölték, lejárt, vagy hibásan másoltad. Bármikor indíthatsz új auditot.":"It may have expired, been deleted, or been copied incorrectly. You can start a new audit at any time."}</p><a className="gm-cta" href={localizePath(locale,"/advanced-audit")}>{locale==="hu"?"Új audit indítása":"Start a new audit"} <span aria-hidden="true">→</span></a></main>;
  if(submission.status==="completed"){
    const completed=await completeAdvancedAudit(token,()=>({} as never));
    if(completed.kind!=="not-found")redirect(localizePath(locale,`/advanced-audit/r/${completed.reportToken}`));
  }
  return <main id="main-content" className="gm-shell sc-flow-page"><AdvancedAuditFlow token={token} initialAnswers={submission.answers} locale={locale}/></main>;
}
