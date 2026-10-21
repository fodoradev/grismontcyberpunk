import { runDaily } from "../../../../lib/scorecard/delivery";
import { purgeExpiredAdvancedAudits } from "../../../../lib/advanced-audit/store";
import { retryAdvancedAuditResumeEmails } from "../../../../lib/advanced-audit/delivery";

export const maxDuration = 300;

/** Called once a day by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const [result, advancedAuditResumeEmails, advancedAuditPurged] = await Promise.all([runDaily(), retryAdvancedAuditResumeEmails(), purgeExpiredAdvancedAudits()]);
  const combined = { ...result, advancedAuditResumeEmails, advancedAuditPurged };
  console.log("[cron] daily", combined);
  return Response.json(combined);
}
