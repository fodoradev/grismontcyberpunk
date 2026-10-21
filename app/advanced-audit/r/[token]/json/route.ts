import { getAdvancedAuditReportByToken } from "../../../../../lib/advanced-audit/store";

export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  if(!/^[A-Za-z0-9_-]{22}$/.test(token))return new Response("Not found",{status:404});
  const report=await getAdvancedAuditReportByToken(token);
  if(!report)return new Response("Not found",{status:404});
  return new Response(JSON.stringify({schema:"grismont.advanced-audit-report.v1",content_version:report.contentVersion,created_at:report.createdAt.toISOString(),report:report.result},null,2),{
    headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":'attachment; filename="grismont-advanced-audit-report.json"',"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Referrer-Policy":"no-referrer"},
  });
}
