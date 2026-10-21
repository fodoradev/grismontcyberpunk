import { renderAdvancedAuditPdf } from "../../../../../lib/pdf/AdvancedAuditDocument";
import { getAdvancedAuditReportByToken } from "../../../../../lib/advanced-audit/store";
import { getLocale } from "../../../../../lib/i18n-server";

export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
  const locale=await getLocale(),{token}=await params;
  if(!/^[A-Za-z0-9_-]{22}$/.test(token))return new Response(locale==="hu"?"Nem található":"Not found",{status:404});
  const report=await getAdvancedAuditReportByToken(token);
  if(!report)return new Response(locale==="hu"?"Nem található":"Not found",{status:404});
  const pdf=await renderAdvancedAuditPdf(report.result);
  return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="Grismont-Advanced-Audit-${report.result.report_id??"report"}.pdf"`,"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Referrer-Policy":"no-referrer"}});
}
