import type { ReportModel } from "../scorecard/types";
import { normalizeLocale, type Locale } from "../i18n";
import { getQuestionContent } from "../../content/scorecard/questions";

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Minimal, client-safe HTML layout using the site's palette. */
function layout(body: string, footer: string, locale: Locale = "en") {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"></head><body style="margin:0;background:#F5F4EE;font-family:Arial,Helvetica,sans-serif;color:#202B26">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td style="font:800 24px Arial,sans-serif;letter-spacing:-1px;padding-bottom:24px">grismont<span style="color:#61782D">.</span></td></tr>
<tr><td style="font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:#536057;padding-top:28px;border-top:1px solid #D8DBD1">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#202B26;color:#F5F4EE;padding:13px 18px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">${esc(label)}</a></p>`;

const deleteFooter = (deleteUrl: string, locale: Locale = "en") => locale === "hu"
  ? `Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont folyamatfelmérőjét. <a href="${esc(deleteUrl)}" style="color:#536057">Válaszaim és riportom törlése</a>.`
  : `You're receiving this because you started the Grismont Discovery Scorecard. <a href="${esc(deleteUrl)}" style="color:#536057">Delete my answers and report</a>.`;

export function reportEmail(r: ReportModel, links: { report: string; delete: string }) {
  const locale = normalizeLocale(r.locale ?? "en");
  if (locale === "hu") {
    const subject = "Elkészült a folyamatfelmérőd eredménye";
    const wins = r.quickWins.map(w => `<li style="margin-bottom:6px">${esc(w.title)}</li>`).join("");
    const html = layout(`
<p>Kedves ${esc(r.intake.firstName)}!</p>
<p>Elkészült a folyamatfelmérőd eredménye. A riportot PDF-ben csatoltam, de online is bármikor megnézheted.</p>
<p style="background:#DCD4F4;border-radius:12px;padding:16px 18px;margin:20px 0"><strong>A legnagyobb kockázat:</strong> ${esc(r.biggestRisk.title)}</p>
<p style="margin-bottom:6px"><strong>Három teendő, amellyel már jövő héten elkezdheted:</strong></p>
<ol style="padding-left:20px;margin-top:0">${wins}</ol>
${button(links.report, "Megnézem a riportot")}
<p>A riport jó kiindulópont. Egy 30 perces beszélgetésen együtt átnézzük az eredményt, kezdve azzal a folyamattal, amelyen először változtatnál, és a saját javaslatommal is kiegészítem. Válaszolj erre az e-mailre, és egyeztetünk egy időpontot.</p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>`, deleteFooter(links.delete, locale), locale);
    const text = `Kedves ${r.intake.firstName}!

Elkészült a folyamatfelmérőd eredménye. A riportot PDF-ben csatoltam, online itt nézheted meg: ${links.report}

A legnagyobb kockázat: ${r.biggestRisk.title}

Három teendő, amellyel már jövő héten elkezdheted:
${r.quickWins.map((w, i) => `${i + 1}. ${w.title}`).join("\n")}

A riport jó kiindulópont. Egy 30 perces beszélgetésen együtt átnézzük az eredményt, kezdve azzal a folyamattal, amelyen először változtatnál, és a saját javaslatommal is kiegészítem. Válaszolj erre az e-mailre, és egyeztetünk egy időpontot.

Attila, Grismont

Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont folyamatfelmérőjét.
Válaszaim és riportom törlése: ${links.delete}`;
    return { subject, html, text };
  }
  const subject = "Your Discovery Scorecard report";
  const wins = r.quickWins.map(w => `<li style="margin-bottom:6px">${esc(w.title)}</li>`).join("");
  const html = layout(`
<p>Hi ${esc(r.intake.firstName)},</p>
<p>Your Discovery Scorecard report is attached as a PDF, and you can open the full version online any time.</p>
<p style="background:#DCD4F4;border-radius:12px;padding:16px 18px;margin:20px 0"><strong>Your biggest risk:</strong> ${esc(r.biggestRisk.title)}</p>
<p style="margin-bottom:6px"><strong>Three things you can start next week:</strong></p>
<ol style="padding-left:20px;margin-top:0">${wins}</ol>
${button(links.report, "Open your report")}
<p>The report is a starting point. In a 30-minute call we'll go through it together, starting with the process you'd fix first, and I'll add my own recommendation. Just reply to this email to find a time.</p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>`, deleteFooter(links.delete));
  const text = `Hi ${r.intake.firstName},

Your Discovery Scorecard report is attached as a PDF. Full version online: ${links.report}

Your biggest risk: ${r.biggestRisk.title}

Three things you can start next week:
${r.quickWins.map((w, i) => `${i + 1}. ${w.title}`).join("\n")}

In a 30-minute call we'll go through it together and I'll add my own recommendation. Reply to this email to find a time.

Attila, Grismont

Delete my answers and report: ${links.delete}`;
  return { subject, html, text };
}

export function reminderEmail(firstName: string, answered: number, total: number, links: { resume: string; delete: string }, locale: Locale = "en") {
  locale = normalizeLocale(locale);
  const minutesLeft = Math.max(1, Math.round(((total - answered) * 14) / 60)); // ~14 seconds a question
  if (locale === "hu") {
    const subject = "Folytasd a Grismont folyamatfelmérőjét";
    const progress = answered > 0
      ? `Az összesen ${total} kérdésből már ${answered} kérdésre válaszoltál. A maradék nagyjából ${minutesLeft} perc.`
      : "A kitöltés 7–8 perc, és minden válaszodat automatikusan mentjük.";
    const html = layout(`
<p>Kedves ${esc(firstName)}!</p>
<p>Elkezdted kitölteni a Grismont folyamatfelmérőjét, de még nem fejezted be. ${esc(progress)}</p>
<p>Ha beküldöd, azonnal megkapod a riportot: hat terület értékelését, három gyorsan megvalósítható javaslatot, a legnagyobb kockázatot és egy 90 napos ütemtervet.</p>
${button(links.resume, "Folytasd a kitöltést")}
<p style="color:#536057">Ez az egyetlen emlékeztető, amit küldünk. Ha nem fejezed be, a válaszaidat 30 nap után automatikusan töröljük.</p>`, deleteFooter(links.delete, locale), locale);
    const text = `Kedves ${firstName}!

Elkezdted kitölteni a Grismont folyamatfelmérőjét, de még nem fejezted be. ${progress}

Ha beküldöd, azonnal megkapod a riportot: hat terület értékelését, három gyorsan megvalósítható javaslatot, a legnagyobb kockázatot és egy 90 napos ütemtervet.

Folytasd a kitöltést: ${links.resume}

Ez az egyetlen emlékeztető, amit küldünk. Ha nem fejezed be, a válaszaidat 30 nap után automatikusan töröljük.

Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont folyamatfelmérőjét.
Válaszaim és riportom törlése: ${links.delete}`;
    return { subject, html, text };
  }
  const progress = answered > 0
    ? `You've answered ${answered} of ${total} questions. The rest take about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`
    : `It takes 7–8 minutes, and every answer is saved as you go.`;
  const subject = "Your Discovery Scorecard is waiting";
  const html = layout(`
<p>Hi ${esc(firstName)},</p>
<p>You started the Grismont Discovery Scorecard but didn't finish it. ${esc(progress)}</p>
<p>When you submit, you'll get your report straight away: your profile across six areas, three quick wins, your biggest risk and a 90-day roadmap.</p>
${button(links.resume, "Continue where you left off")}
<p style="color:#536057">This is the only reminder we'll send. Unfinished answers are deleted automatically after 30 days.</p>`, deleteFooter(links.delete));
  const text = `Hi ${firstName},

You started the Grismont Discovery Scorecard but didn't finish it. ${progress}

Continue where you left off: ${links.resume}

This is the only reminder we'll send. Unfinished answers are deleted automatically after 30 days.

Delete my answers: ${links.delete}`;
  return { subject, html, text };
}

export function ownerNotifyEmail(r: ReportModel, details: { email: string; role?: string | null; companyName?: string | null; profile: string; reportUrl: string }) {
  const locale = normalizeLocale(r.locale ?? "en");
  const hu = locale === "hu";
  const { SIZE_LABELS, INDUSTRY_LABELS } = getQuestionContent(locale);
  const who = [r.intake.firstName, details.role, details.companyName].filter(Boolean).join(", ");
  const size = hu ? SIZE_LABELS[r.intake.companySize] : r.intake.companySize;
  const industry = hu ? INDUSTRY_LABELS[r.intake.industry] : r.intake.industry;
  const subject = `${hu ? "Új folyamatfelmérő" : "New scorecard"}: ${who} · ${size} · ${industry}`;
  const rows: [string, string][] = [
    [hu ? "Kapcsolattartó" : "Contact", `${who} <${details.email}>`],
    [hu ? "Létszám / ágazat" : "Size / industry", `${size} / ${industry}`],
    [hu ? "Profil" : "Profile", details.profile],
    [hu ? "Legnagyobb kockázat" : "Biggest risk", r.biggestRisk.title],
    [hu ? "Javasolt következő lépés" : "Suggested next step", r.nextStep.text.title],
    [hu ? "Vizsgált folyamat" : "Process assessed", r.process ?? (hu ? "(nincs megadva)" : "(not named)")],
    [hu ? "Mi okoz gondot a folyamatban?" : "What goes wrong in it", r.freeText ?? (hu ? "(nincs válasz)" : "(not answered)")],
  ];
  const html = layout(`
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${rows.map(([k, v]) =>
    `<tr><td style="padding:8px 12px 8px 0;color:#536057;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;overflow-wrap:anywhere">${esc(v)}</td></tr>`).join("")}</table>
${button(details.reportUrl, hu ? "Riport megnyitása" : "Open the report")}`, hu ? "Belső értesítés a Grismont folyamatfelmérőből." : "Internal notification from the Discovery Scorecard.", locale);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${details.reportUrl}`;
  return { subject, html, text: hu ? `${text}\n\nBelső értesítés a Grismont folyamatfelmérőből.` : text };
}
