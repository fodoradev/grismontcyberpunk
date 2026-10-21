import { runDaily } from "../../../../lib/scorecard/delivery";
import { purgeExpiredAdvancedAudits } from "../../../../lib/advanced-audit/store";

export const maxDuration = 300;

/** Called once a day by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const [result, advancedAuditPurged] = await Promise.all([runDaily(), purgeExpiredAdvancedAudits()]);
  const combined = { ...result, advancedAuditPurged };
  console.log("[cron] daily", combined);
  return Response.json(combined);
}
