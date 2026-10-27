import { runDaily } from "../../../../lib/scorecard/delivery";
import { purgeExpiredAdvancedAudits } from "../../../../lib/advanced-audit/store";
import { retryAdvancedAuditResumeEmails } from "../../../../lib/advanced-audit/delivery";
import { runContactDaily } from "../../../../lib/contact/notify";

export const maxDuration = 300;

/** Called once a day by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const [result, advancedAuditResumeEmails, advancedAuditPurged, contact] = await Promise.all([runDaily(), retryAdvancedAuditResumeEmails(), purgeExpiredAdvancedAudits(), runContactDaily()]);
  const combined = { ...result, advancedAuditResumeEmails, advancedAuditPurged, ...contact };
  console.log("[cron] daily", combined);
  return Response.json(combined);
}
