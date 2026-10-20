import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CardFlow, { type FlowQuestion, type FlowSection } from "../../../../components/scorecard/CardFlow";
import ScorecardMessage from "../../../../components/scorecard/ScorecardMessage";
import { getQuestionContent } from "../../../../content/scorecard/questions";
import { getLocale } from "../../../../lib/i18n-server";
import { localizePath } from "../../../../lib/i18n";
import { getByResumeToken, getReportTokenFor } from "../../../../lib/scorecard/store";
import { firstOpenIndex } from "../../../../lib/scorecard/validation";
import { AREAS, type Industry } from "../../../../lib/scorecard/types";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await getLocale() === "hu" ? "Folyamatfelmérő" : "Discovery Scorecard", referrer: "no-referrer" };
}

// Section 0 is the opening process question; sections 1–6 are the areas, in method order.
const sectionOf = (area?: (typeof AREAS)[number]) => (area ? AREAS.indexOf(area) + 1 : 0);

export default async function Questionnaire({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getLocale();
  const hu = locale === "hu";
  const { AREA_NAMES, QUESTIONS, promptFor } = getQuestionContent(locale);
  const sectionNames = [{ name: hu ? "A vizsgált folyamat" : "Your process" }, ...AREAS.map(a => ({ name: AREA_NAMES[a] }))];
  const { token } = await params;
  const s = await getByResumeToken(token);
  if (!s || s.status === "superseded") {
    return <ScorecardMessage locale={locale} title={hu ? "Ez a hivatkozás már nem érvényes." : "This link has expired."} text={hu ? "Lehet, hogy azóta újrakezdted a felmérőt, vagy a válaszokat törölték. Bármikor kezdhetsz újat." : "It may have been replaced by a newer start, or the answers were deleted. You can start a fresh scorecard any time."} />;
  }
  if (s.status === "completed") {
    const reportToken = await getReportTokenFor(s.id);
    if (reportToken) redirect(localizePath(locale, `/scorecard/r/${reportToken}`));
  }
  const industry = s.industry as Industry;
  const questions: FlowQuestion[] = QUESTIONS.map(q => ({
    id: q.id, kind: q.kind, prompt: promptFor(q, industry), section: sectionOf(q.area),
    options: q.kind === "text" ? [] : q.options.map(({ id, label }) => ({ id, label })),
    ...(q.kind === "text" ? { help: q.help, maxLength: q.maxLength, placeholder: q.placeholder, required: q.required } : {}),
  }));
  const sections: FlowSection[] = sectionNames.map((sec, i) => ({ ...sec, count: questions.filter(q => q.section === i).length }));
  return (
    <main id="main-content" className="gm-shell sc-flow-page">
      <CardFlow locale={locale} token={token} firstName={s.firstName} questions={questions} sections={sections} initialAnswers={s.answers} initialIndex={firstOpenIndex(s.answers)} />
    </main>
  );
}
