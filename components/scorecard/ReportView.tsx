import { getScorecardCopy } from "../../content/scorecard/copy";
import { getQuestionContent } from "../../content/scorecard/questions";
import { business } from "../../data/business";
import { formatNumber, levelLabel, normalizeLocale, type Locale } from "../../lib/i18n";
import { profileBars, quadrantCells, quadrantPoint, type Cell } from "../../lib/scorecard/chart-geometry";
import { AREAS, type FindingText, type Quadrant as QuadrantId, type ReportModel } from "../../lib/scorecard/types";

const TRACK = 240;

const labels = {
  en: {
    report: "Discovery Scorecard", greeting: "here's where you stand.",
    intro: "Every point below comes from something you told us.",
    download: "Download PDF", jump: "Jump to the next step ↓",
    profile: "Your profile", profileTitle: "Six areas, one picture", scores: "Scores by area, 0 to 4",
    cap: "Why AI readiness is capped:", automation: "Automation", automationTitle: "Opportunity vs. readiness",
    opportunity: "Opportunity", readiness: "Readiness", ofFour: "of 4", scale: "(of 4)",
    action: "Do this:", done: "Done when:", risk: "Your biggest risk", start: "Start next week",
    wins: "Three quick wins", roadmap: "Your 90-day roadmap", order: "In the order that works",
    areas: "Area by area", meaning: "What each score means for you", focus: "Focus:",
    call: "We'll start our call here.", next: "Suggested next step",
    review: "Arrange a 30-minute review", subject: "Discovery Scorecard review",
    final: "This is a starting point. In the call I'll add my own recommendation. The link to delete your data is in your email.",
  },
  hu: {
    report: "Folyamatfelmérő – eredmény", greeting: "itt tartasz most.",
    intro: "Minden, amit itt olvasol, a válaszaidon alapul.",
    download: "PDF letöltése", jump: "Ugrás a következő lépéshez ↓",
    profile: "Az eredményeid", profileTitle: "Hat terület, egy átfogó kép", scores: "Pontszámok területenként, 0–4 pontos skálán",
    cap: "Miért alacsonyabb az AI-felkészültségi pontszámod?", automation: "Automatizálás", automationTitle: "Lehetőségek és felkészültség",
    opportunity: "Automatizálási lehetőség", readiness: "Felkészültség", ofFour: "a 4-ből", scale: "(4 pontos skálán)",
    action: "Teendő:", done: "Akkor kész, ha:", risk: "A legnagyobb kockázat", start: "Kezdd el jövő héten",
    wins: "Három gyorsan megvalósítható javítás", roadmap: "A 90 napos ütemterved", order: "Javasolt sorrendben",
    areas: "Területenkénti értékelés", meaning: "Mit jelentenek a pontszámok a gyakorlatban?", focus: "Erre figyelj:",
    call: "Ha beszélünk, ezzel kezdjük.", next: "Javasolt következő lépés",
    review: "Foglalj egy 30 perces beszélgetést", subject: "A folyamatfelmérő eredményének átbeszélése",
    final: "Ez egy kiindulópont. Ha beszélünk, a saját javaslataimmal is kiegészítem. Az adataid törléséhez szükséges linket az e-mailben találod.",
  },
} satisfies Record<Locale, Record<string, string>>;

function Profile({ r, locale }: { r: ReportModel; locale: Locale }) {
  const { AREA_NAMES } = getQuestionContent(locale);
  return (
    <div className="sc-profile" role="table" aria-label={labels[locale].scores}>
      {profileBars(r, TRACK).map(row => (
        <div className="sc-profile-row" role="row" key={row.area}>
          <span role="rowheader">{AREA_NAMES[row.area]}</span>
          <svg viewBox={`0 0 ${TRACK} 12`} preserveAspectRatio="none" aria-hidden="true">
            <rect width={TRACK} height="12" rx="3" className="sc-track" />
            {row.ghostWidth > 0 ? <rect width={row.ghostWidth} height="12" rx="3" className="sc-ghost" /> : null}
            <rect width={row.width} height="12" rx="3" className="sc-bar" />
          </svg>
          <span role="cell"><b>{formatNumber(r.areas[row.area].score, locale)}</b> {levelLabel(r.areas[row.area].level, locale)}</span>
        </div>
      ))}
    </div>
  );
}

function CapNote({ r, locale }: { r: ReportModel; locale: Locale }) {
  return r.ai.capped ? <p className="sc-cap-note"><b>{labels[locale].cap}</b> {getScorecardCopy(locale).capNote(r)}</p> : null;
}

function Quadrant({ r, locale }: { r: ReportModel; locale: Locale }) {
  const { QUADRANT_AXES, QUADRANT_TEXT, automationCapNote } = getScorecardCopy(locale);
  const t = labels[locale];
  const size = 200, radius = 9, band = locale === "hu" ? 30 : 18;
  const { opportunity, readiness, capped, quadrant } = r.automation;
  const p = quadrantPoint(opportunity, readiness, size, radius);
  const cells = Object.entries(quadrantCells(size)) as [QuadrantId, Cell][];
  const q = QUADRANT_TEXT[quadrant];
  return (
    <div className="sc-quadrant">
      <figure>
        <svg viewBox={`-1 0 ${size + 2} ${size + band * 2}`} role="img"
          aria-label={`${t.opportunity} ${formatNumber(opportunity, locale)} ${t.ofFour}, ${locale === "en" ? "readiness" : t.readiness.toLowerCase()} ${formatNumber(readiness, locale)} ${t.ofFour}: ${q.title}`}>
          {cells.map(([key, c]) => (
            <text key={key} x={c.x + c.w / 2} y={c.top ? band - 6 : band + size + 13} textAnchor="middle"
              className={key === quadrant ? "sc-q-label sc-q-label-current" : "sc-q-label"}>{locale === "hu" && !c.top
                ? <>{(key === "low-priority" ? ["Más terület", "fontosabb"] : ["Kevés ismétlődő", "munka"]).map((line, i) => <tspan key={line} x={c.x + c.w / 2} dy={i === 0 ? 0 : 12}>{line}</tspan>)}</>
                : QUADRANT_TEXT[key].title}</text>
          ))}
          <g transform={`translate(0 ${band})`}>
            {cells.map(([key, c]) => <rect key={key} x={c.x} y={c.y} width={c.w} height={c.h} className={key === quadrant ? "sc-q-cell sc-q-current" : "sc-q-cell"} />)}
            <circle cx={p.x} cy={p.y} r={radius} className="sc-q-dot" />
          </g>
        </svg>
        <figcaption>↑ {QUADRANT_AXES.up}<br />→ {QUADRANT_AXES.right}</figcaption>
      </figure>
      <div>
        <h3>{q.title}</h3>
        <p>{q.text}</p>
        <p className="sc-small">{t.opportunity} {formatNumber(opportunity, locale)} · {t.readiness} {formatNumber(readiness, locale)} {t.scale}</p>
        {capped ? <p className="sc-cap-note">{automationCapNote(r)}</p> : null}
      </div>
    </div>
  );
}

function Finding({ f, locale, className = "" }: { f: FindingText; locale: Locale; className?: string }) {
  const { AREA_NAMES } = getQuestionContent(locale);
  const t = labels[locale];
  return (
    <article className={`sc-finding ${className}`}>
      {f.area !== "ALL" ? <div className="gm-label">{AREA_NAMES[f.area]}</div> : null}
      <h3>{f.title}</h3>
      <p className="sc-observed">{f.observed}</p>
      <p>{f.why}</p>
      <p><b>{t.action}</b> {f.action}</p>
      <p className="sc-done"><b>{t.done}</b> {f.done}</p>
    </article>
  );
}

export default function ReportView({ r, pdfHref, locale = normalizeLocale(r.locale) }: { r: ReportModel; pdfHref: string; locale?: Locale }) {
  const { ROADMAP_COLUMNS, formatReportDate, freeTextLabel, reportIntro } = getScorecardCopy(locale);
  const { AREA_NAMES } = getQuestionContent(locale);
  const t = labels[locale];
  const date = formatReportDate(r);
  return (
    <main id="main-content" className="sc-report" lang={locale}>
      <section className="gm-shell sc-report-head">
        <div className="gm-label">{t.report} · {date}</div>
        <h1>{r.intake.firstName}, {t.greeting}</h1>
        <p className="gm-lead">{reportIntro(r)} {t.intro}</p>
        <div className="gm-actions"><a className="gm-cta" href={pdfHref}>{t.download} <span aria-hidden="true">↓</span></a><a className="gm-text-link" href="#next-step">{t.jump}</a></div>
      </section>

      <section className="gm-shell sc-block sc-two">
        <div><div className="gm-label">{t.profile}</div><h2>{t.profileTitle}</h2><Profile r={r} locale={locale} /><CapNote r={r} locale={locale} /></div>
        <div><div className="gm-label">{t.automation}</div><h2>{t.automationTitle}</h2><Quadrant r={r} locale={locale} /></div>
      </section>

      <section className="gm-shell sc-block">
        <div className="gm-label">{t.risk}</div>
        <Finding f={r.biggestRisk} locale={locale} className="sc-risk" />
      </section>

      <section className="gm-shell sc-block">
        <div className="gm-label">{t.start}</div>
        <h2>{t.wins}</h2>
        <div className="sc-wins">{r.quickWins.map(f => <Finding key={f.id} f={f} locale={locale} />)}</div>
      </section>

      <section className="sc-roadmap-band">
        <div className="gm-shell sc-block">
          <div className="gm-label">{t.roadmap}</div>
          <h2>{t.order}</h2>
          <div className="sc-roadmap">
            {ROADMAP_COLUMNS.map(({ key, label, sub }) => (
              <div key={key}>
                <h3>{label}</h3>
                <p className="sc-small">{sub}</p>
                <ol>{r.roadmap[key].map(f => <li key={f.id}><b>{f.title}</b><p>{f.action}</p><p className="sc-small">{t.done} {f.done}</p></li>)}</ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gm-shell sc-block">
        <div className="gm-label">{t.areas}</div>
        <h2>{t.meaning}</h2>
        <div className="sc-notes">
          {AREAS.map(a => (
            <details key={a}>
              <summary><span><span className="gm-number">{formatNumber(r.areas[a].score, locale)}</span>{AREA_NAMES[a]}: {r.areas[a].note.title}</span></summary>
              <p>{r.areas[a].note.why} {r.areas[a].note.observed} <b>{t.focus}</b> {r.areas[a].note.action}</p>
            </details>
          ))}
        </div>
      </section>

      {r.freeText ? (
        <section className="gm-shell sc-block">
          <div className="gm-label">{freeTextLabel(r)}</div>
          <blockquote className="sc-quote">{locale === "hu" ? "„" : "“"}{r.freeText}”</blockquote>
          <p className="sc-small">{t.call}</p>
        </section>
      ) : null}

      <section className="gm-final" id="next-step">
        <div className="gm-shell gm-final-layout">
          <div>
            <div className="gm-label">{t.next}</div>
            <h2>{r.nextStep.text.title}</h2>
            <p>{r.nextStep.text.observed} {r.nextStep.text.why}</p>
            <p style={{ marginTop: 12 }}>{r.nextStep.text.action}</p>
          </div>
          <div className="gm-actions">
            <a className="gm-cta light" href={`mailto:${business.email}?subject=${encodeURIComponent(t.subject)}`}>{t.review} <span aria-hidden="true">↗</span></a>
            <span className="sc-final-note">{t.final}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
