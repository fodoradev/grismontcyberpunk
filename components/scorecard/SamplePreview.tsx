import { getQuestionContent } from "../../content/scorecard/questions";
import { formatNumber, type Locale } from "../../lib/i18n";
import { levelTone } from "../../lib/scorecard/chart-geometry";
import { sampleReport } from "../../lib/scorecard/sample";
import { AREAS } from "../../lib/scorecard/types";

/** Real output of the report engine on the fictional sample answers (lib/scorecard/sample.ts), so the preview can't overpromise. */
export default function SamplePreview({ locale, sampleHref, sampleLabel }: { locale: Locale; sampleHref?: string; sampleLabel: string }) {
  const hu = locale === "hu";
  const r = sampleReport(locale);
  const { AREA_NAMES } = getQuestionContent(locale);
  return (
    <figure className="sc-preview">
      <figcaption className="gm-label">{hu ? "Minta: kitalált cég eredménye" : "Sample: a fictional company's result"}</figcaption>
      <ul className="sc-preview-bars">
        {AREAS.map(area => (
          <li key={area}><span>{AREA_NAMES[area]}</span><i aria-hidden="true"><b data-tone={levelTone(r.areas[area].level)} style={{ width: `${r.areas[area].score / 4 * 100}%` }} /></i><em>{formatNumber(r.areas[area].score, locale)}</em></li>
        ))}
      </ul>
      <p className="sc-preview-risk"><strong>{hu ? "Legnagyobb kockázat: " : "Biggest risk: "}</strong>{r.biggestRisk.title}</p>
      {sampleHref ? <a className="gm-text-link sc-preview-link" href={sampleHref}>{sampleLabel} <span aria-hidden="true">↗</span></a> : null}
    </figure>
  );
}
