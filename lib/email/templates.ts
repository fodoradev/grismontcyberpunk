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
  ? `Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont Folyamat-pontozóját. <a href="${esc(deleteUrl)}" style="color:#536057">Válaszaim és riportom törlése</a>.`
  : `You're receiving this because you started the Grismont Discovery Scorecard. <a href="${esc(deleteUrl)}" style="color:#536057">Delete my answers and report</a>.`;

export function advancedAuditResumeEmail(resumeUrl: string, privacyUrl: string, locale: Locale = "en") {
  locale = normalizeLocale(locale);
  const hu = locale === "hu";
  const subject = hu ? "A privát hivatkozásod a Grismont részletes auditjához" : "Your private link to the Grismont Advanced Audit";
  const html = layout(hu ? `
<p>Szia!</p>
<p>Elmentettük az első válaszodat a Grismont részletes auditjában. Ezzel a privát hivatkozással később, akár másik eszközön is folytathatod.</p>
${button(resumeUrl, "Audit folytatása")}
<p>Őrizd biztonságban ezt a hivatkozást: bárki megnyithatja, aki hozzáfér. Nem küldünk emlékeztetőket, és nem teszünk marketinglistára. Az audit az adatkezelési tájékoztatóban leírt idő után automatikusan törlődik.</p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>` : `
<p>Hello,</p>
<p>We've saved your first answer in the Grismont Advanced Audit. Use this private link to continue later, including on another device.</p>
${button(resumeUrl, "Continue your audit")}
<p>Keep this link private: anyone with access to it can open your saved audit. We won't send reminders or add you to a marketing list. Your audit is deleted automatically after the period described in the privacy notice.</p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>`, `<a href="${esc(privacyUrl)}" style="color:#536057">${hu ? "Adatkezelési tájékoztató" : "Privacy notice"}</a>`, locale);
  const text = hu
    ? `Szia!\n\nElmentettük az első válaszodat a Grismont részletes auditjában. Ezzel a privát hivatkozással később, akár másik eszközön is folytathatod:\n${resumeUrl}\n\nŐrizd biztonságban ezt a hivatkozást: bárki megnyithatja, aki hozzáfér. Nem küldünk emlékeztetőket, és nem teszünk marketinglistára. Az audit az adatkezelési tájékoztatóban leírt idő után automatikusan törlődik.`
    : `Hello,\n\nWe've saved your first answer in the Grismont Advanced Audit. Use this private link to continue later, including on another device:\n${resumeUrl}\n\nKeep this link private: anyone with access to it can open your saved audit. We won't send reminders or add you to a marketing list. Your audit is deleted automatically after the period described in the privacy notice.`;
  return { subject, html, text };
}

/** Email 0 (04 §3): the report, a booking link (or "reply to this email" until one exists) and the Advanced audit link. */
export function reportEmail(r: ReportModel, links: { report: string; delete: string; audit: string; booking?: string }) {
  const locale = normalizeLocale(r.locale ?? "en");
  if (locale === "hu") {
    const subject = "A Folyamat-pontozó eredményed (PDF)";
    const help = links.booking
      ? "Segítsek az első gyors javításban? Egy ingyenes, 20 perces beszélgetésben átnézzük a pontszámaidat, és megbeszéljük az első lépést. Nincs értékesítési rizsa."
      : "Segítsek az első gyors javításban? Egy ingyenes, 20 perces beszélgetésben átnézzük a pontszámaidat, és megbeszéljük az első lépést. Nincs értékesítési rizsa. Válaszolj erre az e-mailre, és egyeztetünk egy időpontot.";
    const deeper = "Részletesebb képet szeretnél? Töltsd ki a Részletes folyamat-auditot (44 kérdés, kb. 8 perc):";
    const wins = r.quickWins.map(w => `<li style="margin-bottom:6px">${esc(w.title)}</li>`).join("");
    const html = layout(`
<p>Kedves ${esc(r.intake.firstName)}!</p>
<p>Elkészült a Folyamat-pontozód eredménye. A riportot PDF-ben csatoltam, de online is bármikor megnézheted.</p>
<p style="background:#DCD4F4;border-radius:12px;padding:16px 18px;margin:20px 0"><strong>A legnagyobb kockázat:</strong> ${esc(r.biggestRisk.title)}</p>
<p style="margin-bottom:6px"><strong>Három teendő, amellyel már jövő héten elkezdheted:</strong></p>
<ol style="padding-left:20px;margin-top:0">${wins}</ol>
${button(links.report, "Megnézem a riportot")}
<p>${esc(help)}</p>
${links.booking ? button(links.booking, "Foglalok egy 20 perces átnézést") : ""}
<p style="font-size:14px">${esc(deeper)} <a href="${esc(links.audit)}" style="color:#202B26">Részletes folyamat-audit</a></p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>`, deleteFooter(links.delete, locale), locale);
    const text = `Kedves ${r.intake.firstName}!

Elkészült a Folyamat-pontozód eredménye. A riportot PDF-ben csatoltam, online itt nézheted meg: ${links.report}

A legnagyobb kockázat: ${r.biggestRisk.title}

Három teendő, amellyel már jövő héten elkezdheted:
${r.quickWins.map((w, i) => `${i + 1}. ${w.title}`).join("\n")}

${help}${links.booking ? `\n${links.booking}` : ""}

${deeper} ${links.audit}

Attila, Grismont

Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont Folyamat-pontozóját.
Válaszaim és riportom törlése: ${links.delete}`;
    return { subject, html, text };
  }
  const subject = "Your scorecard report (PDF)";
  const help = links.booking
    ? "Want help with the first quick win? In a free 20-minute call we go through your scores and agree the first step. No sales pitch."
    : "Want help with the first quick win? In a free 20-minute call we go through your scores and agree the first step. No sales pitch. Reply to this email to find a time.";
  const deeper = "Want a deeper look? Take the Advanced audit (44 questions, about 8 minutes):";
  const wins = r.quickWins.map(w => `<li style="margin-bottom:6px">${esc(w.title)}</li>`).join("");
  const html = layout(`
<p>Hi ${esc(r.intake.firstName)},</p>
<p>Your Discovery Scorecard report is attached as a PDF, and you can open the full version online any time.</p>
<p style="background:#DCD4F4;border-radius:12px;padding:16px 18px;margin:20px 0"><strong>Your biggest risk:</strong> ${esc(r.biggestRisk.title)}</p>
<p style="margin-bottom:6px"><strong>Three things you can start next week:</strong></p>
<ol style="padding-left:20px;margin-top:0">${wins}</ol>
${button(links.report, "Open your report")}
<p>${esc(help)}</p>
${links.booking ? button(links.booking, "Book a 20-minute review") : ""}
<p style="font-size:14px">${esc(deeper)} <a href="${esc(links.audit)}" style="color:#202B26">Advanced audit</a></p>
<p>Attila<br><span style="color:#536057">Grismont</span></p>`, deleteFooter(links.delete));
  const text = `Hi ${r.intake.firstName},

Your Discovery Scorecard report is attached as a PDF. Full version online: ${links.report}

Your biggest risk: ${r.biggestRisk.title}

Three things you can start next week:
${r.quickWins.map((w, i) => `${i + 1}. ${w.title}`).join("\n")}

${help}${links.booking ? `\n${links.booking}` : ""}

${deeper} ${links.audit}

Attila, Grismont

Delete my answers and report: ${links.delete}`;
  return { subject, html, text };
}

export function reminderEmail(firstName: string, answered: number, total: number, links: { resume: string; delete: string }, locale: Locale = "en", reminderNumber = 1) {
  locale = normalizeLocale(locale);
  const stageNotice = locale === "hu"
    ? reminderNumber >= 5
      ? "Ez az utolsó emlékeztetőnk. Ha nem fejezed be, a válaszaidat 30 nap után automatikusan töröljük."
      : "Ha még nem fejezted be, küldünk még egy emlékeztetőt. Ha nem fejezed be, a válaszaidat 30 nap után automatikusan töröljük."
    : reminderNumber >= 5
      ? "This is our last reminder. Unfinished answers are deleted automatically after 30 days."
      : "If you haven't finished yet, we'll send one more reminder. Unfinished answers are deleted automatically after 30 days.";
  const minutesLeft = Math.max(1, Math.round(((total - answered) * 14) / 60)); // ~14 seconds a question
  if (locale === "hu") {
    const subject = "Folytasd a Grismont Folyamat-pontozóját";
    const progress = answered > 0
      ? `Az összesen ${total} kérdésből már ${answered} kérdésre válaszoltál. A maradék nagyjából ${minutesLeft} perc.`
      : "A kitöltés 7–8 perc, és minden válaszodat automatikusan mentjük.";
    const html = layout(`
<p>Kedves ${esc(firstName)}!</p>
<p>Elkezdted kitölteni a Grismont Folyamat-pontozóját, de még nem fejezted be. ${esc(progress)}</p>
<p>Ha beküldöd, azonnal megkapod a riportot: hat terület értékelését, három gyorsan megvalósítható javaslatot, a legnagyobb kockázatot és egy 90 napos ütemtervet.</p>
${button(links.resume, "Folytasd a kitöltést")}
<p style="color:#536057">${esc(stageNotice)}</p>`, deleteFooter(links.delete, locale), locale);
    const text = `Kedves ${firstName}!

Elkezdted kitölteni a Grismont Folyamat-pontozóját, de még nem fejezted be. ${progress}

Ha beküldöd, azonnal megkapod a riportot: hat terület értékelését, három gyorsan megvalósítható javaslatot, a legnagyobb kockázatot és egy 90 napos ütemtervet.

Folytasd a kitöltést: ${links.resume}

${stageNotice}

Azért kapod ezt az e-mailt, mert elkezdted kitölteni a Grismont Folyamat-pontozóját.
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
<p style="color:#536057">${esc(stageNotice)}</p>`, deleteFooter(links.delete));
  const text = `Hi ${firstName},

You started the Grismont Discovery Scorecard but didn't finish it. ${progress}

Continue where you left off: ${links.resume}

${stageNotice}

Delete my answers: ${links.delete}`;
  return { subject, html, text };
}

export function ownerNotifyEmail(r: ReportModel, details: { email: string; role?: string | null; companyName?: string | null; profile: string; reportUrl: string }) {
  const locale = normalizeLocale(r.locale ?? "en");
  const hu = locale === "hu";
  const { SIZE_LABELS, INDUSTRY_LABELS } = getQuestionContent(locale);
  const who = [r.intake.firstName, details.role, details.companyName].filter(Boolean).join(", ");
  const size = r.intake.companySize ? (hu ? SIZE_LABELS[r.intake.companySize] : r.intake.companySize) : "–";
  const industry = r.intake.industry ? (hu ? INDUSTRY_LABELS[r.intake.industry] : r.intake.industry) : "–";
  const subject = `${hu ? "Új Folyamat-pontozó" : "New scorecard"}: ${who} · ${size} · ${industry}`;
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
${button(details.reportUrl, hu ? "Riport megnyitása" : "Open the report")}`, hu ? "Belső értesítés a Grismont Folyamat-pontozóból." : "Internal notification from the Discovery Scorecard.", locale);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${details.reportUrl}`;
  return { subject, html, text: hu ? `${text}\n\nBelső értesítés a Grismont Folyamat-pontozóból.` : text };
}

const CONTACT_INTEREST_LABELS: Record<string, string> = { training: "Training", workshop: "Workshop", programme: "Programme", sprint: "Sprint", unsure: "Not sure yet" };

/** Owner-only: a message from the home page contact form. Reply-To is the sender. */
export function contactNotifyEmail(m: { name: string; email: string; message: string; interest: string | null; locale: string; createdAt: Date }) {
  const interest = m.interest ? CONTACT_INTEREST_LABELS[m.interest] ?? m.interest : "—";
  const subject = `Contact form: ${m.name}${m.interest ? ` (${interest})` : ""}`;
  const rows: [string, string][] = [["Name", m.name], ["Email", m.email], ["Interested in", interest], ["Language", m.locale.toUpperCase()], ["Received", m.createdAt.toISOString()]];
  const html = layout(`
<p><strong>New message from the contact form.</strong> Reply to this email to answer ${esc(m.name)} directly.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;margin:16px 0">${rows.map(([k, v]) => `<tr><td style="color:#536057;padding:3px 16px 3px 0">${k}</td><td>${esc(v)}</td></tr>`).join("")}</table>
<p style="background:#EAF0DC;border-radius:12px;padding:16px 18px;white-space:pre-wrap">${esc(m.message)}</p>`, "Sent by the grismont.hu contact form. The message is deleted automatically after 12 months.");
  const text = `New message from the contact form.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${m.message}`;
  return { subject, html, text };
}

type FollowUpLinks = { report: string; unsubscribe: string; booking?: string };
type CaseStudyLite = { title: string; problem: string; action: string; result: string; url?: string };

const unsubscribeFooter = (url: string, locale: Locale) => locale === "hu"
  ? `Azért kapod ezt az e-mailt, mert a Folyamat-pontozó végén kérted az eredményeiddel kapcsolatos e-maileket. <a href="${esc(url)}" style="color:#536057">Leiratkozás</a>.`
  : `You're receiving this because you asked for follow-up emails about your scorecard results. <a href="${esc(url)}" style="color:#536057">Unsubscribe</a>.`;

/** Marketing follow-ups (04 §3), sent only with the separate consent. Every one carries an unsubscribe link. */
export function followUpEmail(kind: "followup_2" | "followup_5" | "followup_9", r: ReportModel, links: FollowUpLinks, caseStudy?: CaseStudyLite) {
  const locale = normalizeLocale(r.locale ?? "en");
  const hu = locale === "hu";
  const name = r.intake.firstName;
  const sign = `<p>Attila<br><span style="color:#536057">Grismont</span></p>`;
  let subject: string, body: string, text: string;
  if (kind === "followup_2") {
    const w = r.quickWins[0];
    subject = hu ? "Az első gyors javításod, lépésről lépésre" : "Your first quick win, step by step";
    const rows: [string, string][] = hu
      ? [["Mit láttunk", w.observed], ["Miért számít", w.why], ["A teendő", w.action], ["Akkor kész, ha", w.done]]
      : [["What we saw", w.observed], ["Why it matters", w.why], ["What to do", w.action], ["Done when", w.done]];
    body = `<p>${hu ? `Kedves ${esc(name)}!` : `Hi ${esc(name)},`}</p>
<p>${hu ? "A riportod első gyors javítása ez volt:" : "The first quick win in your report was:"}</p>
<p style="background:#EAF0DC;border-radius:12px;padding:16px 18px"><strong>${esc(w.title)}</strong></p>
${rows.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join("\n")}
<p>${hu ? "Ha elakadsz, válaszolj erre az e-mailre, és segítek." : "If you get stuck, reply to this email and I'll help."}</p>
${button(links.report, hu ? "Megnézem a riportot" : "Open your report")}${sign}`;
    text = `${hu ? `Kedves ${name}!` : `Hi ${name},`}\n\n${hu ? "A riportod első gyors javítása ez volt:" : "The first quick win in your report was:"} ${w.title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n\n")}\n\n${hu ? "Ha elakadsz, válaszolj erre az e-mailre, és segítek." : "If you get stuck, reply to this email and I'll help."}\n${links.report}`;
  } else if (kind === "followup_5") {
    if (!caseStudy) throw new Error("followup_5 needs a case study");
    subject = hu ? "Hogyan nyert vissza egy csapat heti egy napot" : "How one team got a day back every week";
    body = `<p>${hu ? `Kedves ${esc(name)}!` : `Hi ${esc(name)},`}</p>
<p><strong>${esc(caseStudy.title)}</strong></p>
<p>${esc(caseStudy.problem)}</p><p>${esc(caseStudy.action)}</p>
<p style="background:#EAF0DC;border-radius:12px;padding:16px 18px"><strong>${hu ? "Eredmény" : "Result"}:</strong> ${esc(caseStudy.result)}</p>
${caseStudy.url ? button(caseStudy.url, hu ? "Elolvasom az esetet" : "Read the case") : ""}${sign}`;
    text = `${hu ? `Kedves ${name}!` : `Hi ${name},`}\n\n${caseStudy.title}\n\n${caseStudy.problem}\n\n${caseStudy.action}\n\n${hu ? "Eredmény" : "Result"}: ${caseStudy.result}${caseStudy.url ? `\n${caseStudy.url}` : ""}`;
  } else {
    subject = hu ? "Átnézzük együtt?" : "Shall we look at it together?";
    const line = hu
      ? `Egy hete kaptad meg a Folyamat-pontozó eredményét${r.process ? ` erről a folyamatról: „${r.process}”` : ""}. Ha szeretnéd, egy ingyenes, 20 perces beszélgetésben átnézzük, és megbeszéljük az első lépést.`
      : `A week ago you scored ${r.process ? `“${r.process}”` : "one of your processes"}. If you like, we can go through the results in a free 20-minute call and agree the first step.`;
    const reply = hu ? "Vagy egyszerűen válaszolj erre az e-mailre." : "Or simply reply to this email.";
    body = `<p>${hu ? `Kedves ${esc(name)}!` : `Hi ${esc(name)},`}</p><p>${esc(line)}</p>
${links.booking ? button(links.booking, hu ? "Foglalok egy 20 perces átnézést" : "Book a 20-minute review") : ""}<p>${esc(links.booking ? reply : hu ? "Válaszolj erre az e-mailre, és egyeztetünk egy időpontot." : "Reply to this email and we'll find a time.")}</p>${sign}`;
    text = `${hu ? `Kedves ${name}!` : `Hi ${name},`}\n\n${line}\n${links.booking ? `${links.booking}\n${reply}` : hu ? "Válaszolj erre az e-mailre, és egyeztetünk egy időpontot." : "Reply to this email and we'll find a time."}`;
  }
  const footer = unsubscribeFooter(links.unsubscribe, locale);
  return {
    subject,
    html: layout(body, footer, locale),
    text: `${text}\n\nAttila, Grismont\n\n${hu ? "Leiratkozás" : "Unsubscribe"}: ${links.unsubscribe}`,
    headers: { "List-Unsubscribe": `<${links.unsubscribe}>` },
  };
}
