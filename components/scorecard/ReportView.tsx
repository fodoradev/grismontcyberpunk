import { getScorecardCopy } from "../../content/scorecard/copy";
import { getQuestionContent } from "../../content/scorecard/questions";
import { known, site } from "../../data/site";
import { formatNumber, levelLabel, localizePath, normalizeLocale, type Locale } from "../../lib/i18n";
import { levelTone, profileBars, quadrantCells, quadrantPoint, WEB_COLORS, type Cell } from "../../lib/scorecard/chart-geometry";
import { AREAS, type FindingText, type Quadrant as QuadrantId, type ReportModel } from "../../lib/scorecard/types";

const TRACK = 240;
const TONE_FILL = { weak: WEB_COLORS.crimson, mid: WEB_COLORS.onDark, strong: WEB_COLORS.flow };

const labels = {
  en: {
    report: "Discovery Scorecard", greeting: "here's where you stand.",
    intro: "Every point below comes from something you told us.",
    download: "Download PDF", jump: "Jump to the next step",
    summary: "Your result in short", weakest: "Weakest area", firstAction: "Your first action", score: "of 4", why: "Why this matters",
    profile: "Your profile", profileTitle: "Six areas, one picture", scores: "Scores by area, 0 to 4",
    cap: "Why AI readiness is capped:", automation: "Automation", automationTitle: "Opportunity vs. readiness",
    opportunity: "Opportunity", readiness: "Readiness", ofFour: "of 4", scale: "(of 4)",
    action: "Do this:", done: "Done when:", risk: "Your biggest risk", start: "Start next week",
    wins: "Three quick wins", roadmap: "Your 90-day roadmap", order: "In the order that works",
    areas: "Area by area", meaning: "What each score means for you", focus: "Focus:",
    call: "We'll start our call here.", next: "Suggested next step",
    helpTitle: "Want help with the first quick win?", helpText: "In a free 20-minute call we go through your scores and agree the first step. No sales pitch.",
    book: "Book a 20-minute review", deeper: "Want a deeper look? Take the Advanced audit (44 questions, about 8 minutes)",
    final: "The link to delete your data is in your email.",
  },
  hu: {
    report: "Folyamat-pontozó – eredmény", greeting: "itt tartasz most.",
    intro: "Minden, amit itt olvasol, a válaszaidon alapul.",
    download: "PDF letöltése", jump: "Ugrás a következő lépéshez",
    summary: "Az eredményed röviden", weakest: "A leggyengébb terület", firstAction: "Az első teendőd", score: "a 4-ből", why: "Miért fontos?",
    profile: "Az eredményeid", profileTitle: "Hat terület, egy átfogó kép", scores: "Pontszámok területenként, 0–4 pontos skálán",
    cap: "Miért alacsonyabb az AI-felkészültségi pontszámod?", automation: "Automatizálás", automationTitle: "Lehetőségek és felkészültség",
    opportunity: "Automatizálási lehetőség", readiness: "Felkészültség", ofFour: "a 4-ből", scale: "(4 pontos skálán)",
    action: "Teendő:", done: "Akkor kész, ha:", risk: "A legnagyobb kockázat", start: "Kezdd el jövő héten",
    wins: "Három gyorsan megvalósítható javítás", roadmap: "A 90 napos ütemterved", order: "Javasolt sorrendben",
    areas: "Területenkénti értékelés", meaning: "Mit jelentenek a pontszámok a gyakorlatban?", focus: "Erre figyelj:",
    call: "Ha beszélünk, ezzel kezdjük.", next: "Javasolt következő lépés",
    helpTitle: "Segítsek az első gyors javításban?", helpText: "Egy ingyenes, 20 perces beszélgetésben átnézzük a pontszámaidat, és megbeszéljük az első lépést. Nincs értékesítési rizsa.",
    book: "Foglalok egy 20 perces átnézést", deeper: "Részletesebb képet szeretnél? Töltsd ki a Részletes folyamat-auditot (44 kérdés, kb. 8 perc)",
    final: "Az adataid törléséhez szükséges linket az e-mailben találod.",
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
            <rect width={TRACK} height="12" rx="2" fill={WEB_COLORS.line} className="sc-track" />
            {row.ghostWidth > 0 ? <rect width={row.ghostWidth} height="12" rx="2" fill={WEB_COLORS.steel} className="sc-ghost" /> : null}
            <rect width={row.width} height="12" rx="2" fill={TONE_FILL[levelTone(r.areas[row.area].level)]} className="sc-bar" />
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
            {cells.map(([key, c]) => <rect key={key} x={c.x} y={c.y} width={c.w} height={c.h} fill={key === quadrant ? WEB_COLORS.mist : WEB_COLORS.panel} stroke={WEB_COLORS.line} className={key === quadrant ? "sc-q-cell sc-q-current" : "sc-q-cell"} />)}
            <circle cx={p.x} cy={p.y} r={radius} fill={WEB_COLORS.crimson} stroke={WEB_COLORS.ink} strokeWidth="3" className="sc-q-dot" />
          </g>
        </svg>
        <figcaption><span aria-hidden="true">↑ </span>{QUADRANT_AXES.up}<br /><span aria-hidden="true">→ </span>{QUADRANT_AXES.right}</figcaption>
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

/** The verdict first: weakest area, biggest risk and the first thing to do, all from the report model. */
function Summary({ r, locale }: { r: ReportModel; locale: Locale }) {
  const { AREA_NAMES } = getQuestionContent(locale);
  const t = labels[locale];
  const weakest = AREAS.reduce((low, a) => (r.areas[a].score < r.areas[low].score ? a : low), AREAS[0]);
  const first = r.quickWins[0];
  return (
    <dl className="sc-summary" aria-label={t.summary}>
      <div><dt>{t.weakest}</dt><dd>{AREA_NAMES[weakest]}<small><b>{formatNumber(r.areas[weakest].score, locale)}</b> {t.score}</small></dd></div>
      <div><dt>{t.risk}</dt><dd>{r.biggestRisk.title}</dd></div>
      {first ? <div><dt>{t.firstAction}</dt><dd>{first.title}</dd></div> : null}
    </dl>
  );
}

/** A quick win leads with the action; the reasoning stays one click away. */
function QuickWin({ f, locale }: { f: FindingText; locale: Locale }) {
  const { AREA_NAMES } = getQuestionContent(locale);
  const t = labels[locale];
  return (
    <article className="sc-finding">
      {f.area !== "ALL" ? <div className="gm-label">{AREA_NAMES[f.area]}</div> : null}
      <h3>{f.title}</h3>
      <p className="sc-do"><b>{t.action}</b> {f.action}</p>
      <p className="sc-done"><b>{t.done}</b> {f.done}</p>
      <details className="sc-why"><summary>{t.why}</summary><p className="sc-observed">{f.observed}</p><p>{f.why}</p></details>
    </article>
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

/** `sample` renders the public sample report: no private-data notes. `pdfHref` is omitted when there is no PDF. */
export default function ReportView({ r, pdfHref, locale = normalizeLocale(r.locale), sample = false }: { r: ReportModel; pdfHref?: string; locale?: Locale; sample?: boolean }) {
  const { ROADMAP_COLUMNS, formatReportDate, freeTextLabel, reportIntro } = getScorecardCopy(locale);
  const bookingUrl = known(site.bookingUrl);
  // Until a booking link exists, the review button goes to the home page contact form.
  const booking = bookingUrl ?? localizePath(locale, "/#contact");
  const { AREA_NAMES } = getQuestionContent(locale);
  const t = labels[locale];
  const date = formatReportDate(r);
  return (
    <main id="main-content" className="sc-report" lang={locale}>
      <section className="gm-shell sc-report-head">
        <div className="gm-label">{t.report} · {date}</div>
        <h1>{r.intake.firstName}, {t.greeting}</h1>
        <p className="gm-lead">{reportIntro(r)} {t.intro}</p>
        <Summary r={r} locale={locale} />
        <div className="gm-actions"><a className="gm-cta" href={booking} {...(bookingUrl ? { target: "_blank", rel: "noopener" } : {})}>{t.book} <span aria-hidden="true">↗</span></a>{pdfHref ? <a className="gm-text-link" href={pdfHref}>{t.download} <span aria-hidden="true">↓</span></a> : null}<a className="gm-text-link" href="#next-step">{t.jump} <span aria-hidden="true">↓</span></a></div>
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
        <div className="sc-wins">{r.quickWins.map(f => <QuickWin key={f.id} f={f} locale={locale} />)}</div>
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
          <div className="gm-actions sc-help">
            <h3>{t.helpTitle}</h3>
            <p>{t.helpText}</p>
            <a className="gm-cta light" href={booking} {...(bookingUrl ? { target: "_blank", rel: "noopener" } : {})}>{t.book} <span aria-hidden="true">↗</span></a>
            <a className="sc-deeper" href={localizePath(locale, "/advanced-audit")}>{t.deeper} <span aria-hidden="true">→</span></a>
            {sample ? null : <span className="sc-final-note">{t.final}</span>}
          </div>
        </div>
      </section>
    </main>
  );
}
