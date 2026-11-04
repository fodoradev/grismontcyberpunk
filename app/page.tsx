import type { Metadata } from "next";
import FlowArt from "../components/FlowArt";
import FlowMark from "../components/FlowMark";
import HomeMotion from "../components/HomeMotion";
import HoursCalculator from "../components/HoursCalculator";
import MethodSteps from "../components/MethodSteps";
import NightCity, { FlowSamurai, HankoMark } from "../components/NightCity";
import ProcessExplorer from "../components/ProcessExplorer";
import ScorecardShowcase from "../components/ScorecardShowcase";
import StickyCta from "../components/StickyCta";
import VisualSlot, { VisualBackdrop } from "../components/VisualSlot";
import ContactForm from "../components/ContactForm";
import { getHomeContent, getHomeMeta } from "../content/site/home";
import { business } from "../data/business";
import { known, site } from "../data/site";
import { getBackdrop, getVisual, type VisualId } from "../data/visuals";
import type { OfferId } from "../data/offers";
import { localizePath } from "../lib/i18n";
import { getLocale } from "../lib/i18n-server";
import { sampleReport } from "../lib/scorecard/sample";
import { AREAS } from "../lib/scorecard/types";
import "./home.css";

const OFFER_ART: Record<OfferId, VisualId> = { training: "offerTraining", workshop: "offerWorkshop", programme: "offerProgramme", sprint: "offerDelivery" };

export async function generateMetadata(): Promise<Metadata> {
  const meta = getHomeMeta(await getLocale());
  return { title: { absolute: meta.title }, description: meta.description, openGraph: { title: meta.ogTitle, description: meta.ogDescription } };
}

export default async function Home() {
  const locale = await getLocale();
  const c = getHomeContent(locale);
  const scorecardPath = localizePath(locale, "/scorecard");
  const bookingUrl = known(site.bookingUrl);
  // Until a booking link exists, "book a call" leads to the contact form (project convention).
  const booking = bookingUrl ?? "#contact";
  const bookingIsExternal = Boolean(bookingUrl);
  const sample = sampleReport(locale);
  // Numbered sections are counted at render time, so a hidden [PROOF] section leaves no gap.
  let n = 0;
  const label = (text: string) => `${String(++n).padStart(2, "0")} / ${text}`;

  return (
    <main id="main-content" className="gm-home">
      <HomeMotion />

      <section className="home-hero-band" id="home" aria-labelledby="hero-title">
        <div className="home-atmos" aria-hidden="true"><VisualBackdrop id="heroCity" priority />{getBackdrop("heroCity") ? null : <NightCity sun={false} />}</div>
        <div className="gm-shell home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">{c.hero.eyebrow}</p>
          <h1 id="hero-title">{c.hero.title[0]}<span className="home-tangles">{c.hero.title[1]}<svg viewBox="0 0 370 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 20 C24 -8 52 46 78 20 S56 -6 40 18 S96 48 128 20 S176 -8 160 16 S212 44 240 20 S284 6 306 20 H370" /></svg></span>{c.hero.title[2]}</h1>
          <p className="gm-hero-text">{c.hero.sub}</p>
          <div className="gm-actions"><a className="gm-cta" href={scorecardPath}>{c.hero.start} <span aria-hidden="true">↗</span></a><a className="gm-text-link" href={booking} {...(bookingIsExternal ? { target: "_blank", rel: "noopener" } : {})}>{c.hero.book} <span aria-hidden="true">{bookingIsExternal ? "↗" : "↓"}</span></a></div>
          <p className="gm-under">{c.hero.under}</p>
          <div className="home-person"><VisualSlot id="portrait" locale={locale} className="home-person-photo" /><span><strong>{business.firstName}, {c.hero.person}</strong><span>{c.hero.personNote}</span></span></div>
        </div>
        <div className="home-hero-stage">{known(getVisual("samurai", locale).src) ? <VisualSlot id="samurai" locale={locale} className="home-hero-visual" priority /> : <div className="gm-visual home-hero-visual" role="img" aria-label={getVisual("samurai", locale).alt}><FlowSamurai /></div>}<span className="home-nagare" aria-hidden="true" lang="ja">流れ<HankoMark className="home-nagare-hanko" size="0.34em" /></span></div>
      </div></section>

      <div className="gm-shell home-credentials" aria-label={c.strip.label}>{c.strip.items.map(([title, text]) => <p key={title}><strong>{title}</strong><span>{text}</span></p>)}</div>

      <section className="gm-shell home-section home-problems" id="problems" aria-labelledby="problems-title">
        <div className="home-lead"><p className="gm-label">{label(c.problems.label)}</p><h2 id="problems-title">{c.problems.title}</h2><p>{c.problems.intro}</p></div>
        <ProcessExplorer problems={c.problems.cards} labels={c.problems.labels} scoreHref={scorecardPath} />
        <p className="home-section-foot"><span aria-hidden="true">↳</span> {c.problems.closing}</p>
      </section>

      <section className="home-calc-band" aria-labelledby="calculator-title"><VisualBackdrop id="calcBackdrop" /><div className="gm-shell home-section">
        <HoursCalculator copy={c.calculator} href={scorecardPath} locale={locale} />
      </div></section>

      <section className="home-method-band" id="method" aria-labelledby="method-title"><VisualBackdrop id="methodBackdrop" /><div className="gm-shell home-section home-method">
        <div className="home-method-body">
          <div className="home-method-pin">
            <p className="gm-label">{label(c.method.label)}</p>
            <h2 id="method-title">{c.method.title}</h2>
            <p className="home-method-intro">{c.method.intro}</p>
            <FlowArt locale={locale} caption={c.hero.tagline} />
          </div>
          <div>
            <MethodSteps steps={c.method.steps} />
            <p className="home-method-foot"><span aria-hidden="true">↳</span> {c.method.closing}</p>
          </div>
        </div>
      </div></section>

      <section className="home-scorecard" id="scorecard" aria-labelledby="scorecard-title"><div className="gm-shell home-section">
        <div className="home-lead home-lead-wide"><p className="gm-label">{label(c.scorecard.label)}</p><h2 id="scorecard-title">{c.scorecard.title}</h2><p>{c.scorecard.intro}</p></div>
        <ScorecardShowcase
          scores={AREAS.map(area => sample.areas[area].score)}
          copy={{ areasTitle: c.scorecard.areasTitle, areas: c.scorecard.areas, previewLabel: c.scorecard.preview.label, previewCompany: c.scorecard.preview.company, riskLabel: c.scorecard.preview.risk, risk: sample.biggestRisk.title, winLabel: c.scorecard.preview.win, win: sample.quickWins[0].title, scale: c.scorecard.preview.scale }}
        >
          <div className="home-report-offer">
            <p className="home-report-get">{c.scorecard.youGet}</p>
            <ul>{c.scorecard.items.map(item => <li key={item}>{item}</li>)}</ul>
            <a className="gm-cta" href={scorecardPath}>{c.scorecard.cta} <span aria-hidden="true">↗</span></a>
            <p className="home-report-note">{c.scorecard.small}</p>
            {site.sampleReportPublished ? <a className="gm-text-link home-report-sample" href={localizePath(locale, "/scorecard/sample")}>{c.scorecard.sample} <span aria-hidden="true">↗</span></a> : null}
          </div>
        </ScorecardShowcase>
      </div></section>

      <section className="gm-shell home-section" id="services" aria-labelledby="services-title">
        <div className="home-lead"><p className="gm-label">{label(c.services.label)}</p><h2 id="services-title">{c.services.title}</h2><p>{c.services.intro}</p></div>
        <aside className="home-launch" aria-label={c.services.launch.title}><strong>{c.services.launch.title}</strong><p>{c.services.launch.text}</p>{c.services.placesLeft ? <span className="home-launch-left">{c.services.placesLeft}</span> : null}</aside>
        <div className="home-services">{c.services.cards.map(s => (
          <article className={`home-service${s.label ? " home-service-featured" : ""}`} id={s.id} key={s.id}>
            <VisualSlot id={OFFER_ART[s.id]} locale={locale} className="home-service-visual" />
            <div className="home-service-main">
              <span className="gm-label">{s.label ?? s.name}</span>
              <h3>{s.title}</h3>
              <p>{s.label ? <><strong>{s.name}.</strong> </> : null}{s.text}</p>
              {s.topics || s.guarantee ? <div className="home-service-detail">
                {s.topics ? <><span className="home-service-sub">{s.topicsLabel}</span><ul>{s.topics.map(t => <li key={t}>{t}</li>)}</ul></> : null}
                {s.guarantee ? <p className="home-guarantee">{s.guarantee}</p> : null}
              </div> : null}
            </div>
            <div className="home-service-buy">
              <p className="home-price"><s aria-label={`${c.services.regularLabel}: ${s.price.regular}`}>{s.price.regular}</s> <strong aria-label={`${c.services.launchLabel}: ${s.price.launch}`}>{s.price.launch}</strong><span>{s.price.note}</span></p>
              <a className="gm-text-link" href="#contact" data-interest={s.id}>{s.cta} <span aria-hidden="true">↓</span></a>
            </div>
          </article>
        ))}</div>
        <p className="home-section-foot"><span aria-hidden="true">↳</span> {c.services.notSure} <a className="gm-text-link" href={scorecardPath}>{c.services.notSureLink} <span aria-hidden="true">↗</span></a></p>
      </section>

      {c.proof ? (
        <section className="gm-shell home-section" id="proof" aria-labelledby="proof-title">
          <div className="home-lead"><p className="gm-label">{label(c.proof.label)}</p><h2 id="proof-title">{c.proof.title}</h2><p>{c.proof.intro}</p></div>
          <div className="home-proof">{c.proof.cases.map(cs => (
            <article key={cs.title} className="home-proof-card"><h3>{cs.title}</h3><dl><dt>{c.proof!.problem}</dt><dd>{cs.problem}</dd><dt>{c.proof!.action}</dt><dd>{cs.action}</dd><dt>{c.proof!.result}</dt><dd className="home-proof-result">{cs.result}</dd></dl>
              {cs.slug ? <a className="gm-text-link" href={localizePath(locale, `/work/case-studies/${cs.slug}`)}>{c.proof!.read} <span aria-hidden="true">↗</span></a> : null}</article>
          ))}</div>
          {c.proof.testimonial ? <figure className="home-testimonial"><blockquote>{c.proof.testimonial.quote}</blockquote><figcaption>— {c.proof.testimonial.name}</figcaption></figure> : null}
        </section>
      ) : null}

      <section className="home-about-band" id="about" aria-labelledby="about-title"><div className="gm-shell home-section home-about">
        <div className="home-about-visual">
          <VisualSlot id="portrait" locale={locale} className="home-photo" />
          {getVisual("training", locale).src ? <VisualSlot id="training" locale={locale} className="home-photo-training" /> : null}
        </div>
        <div className="home-about-copy">
          <p className="gm-label">{label(c.about.label)}</p>
          <h2 id="about-title">{c.about.title}</h2>
          {c.about.paragraphs.map((text, i) => <p key={text} className={i === 0 ? "home-intro" : undefined}>{text}</p>)}
          <ul className="home-about-facts">{c.about.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
          {c.about.timelineRows.length ? <table className="home-timeline"><caption>{c.about.timeline.caption}</caption><thead><tr><th scope="col">{c.about.timeline.years}</th><th scope="col">{c.about.timeline.role}</th><th scope="col">{c.about.timeline.result}</th></tr></thead><tbody>{c.about.timelineRows.map(row => <tr key={row.years + row.role}><td>{row.years}</td><td>{row.role}</td><td>{row.result}</td></tr>)}</tbody></table> : null}
          {c.about.links.length ? <p className="home-about-links">{c.about.links.map(link => <a key={link.href} className="gm-text-link" href={link.href} target="_blank" rel="noopener">{link.text} <span aria-hidden="true">↗</span></a>)}</p> : null}
        </div>
        <figure className="home-notebook"><figcaption className="gm-label">{c.about.notebookLabel}</figcaption><blockquote>{c.about.notebook}</blockquote></figure>
      </div></section>

      <section className="gm-shell home-section home-next" id="next" aria-labelledby="next-title">
        <div className="home-lead"><p className="gm-label">{c.next.label}</p><h2 id="next-title">{c.next.title}</h2></div>
        <ol className="home-next-list">{c.next.steps.map((step, i) => <li key={step.title}><span className="home-method-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </section>

      <section className="gm-shell home-section home-faq" id="faq" aria-labelledby="faq-title"><div><p className="gm-label">{c.faq.label}</p><h2 id="faq-title">{c.faq.title}</h2><p className="home-heading-note">{c.faq.note}<br /><a className="gm-text-link" href={`mailto:${business.email}`}>{c.faq.link} <span aria-hidden="true">↗</span></a></p></div><div className="home-faq-list">
        {c.faq.items.map(faq => <details key={faq.question} name="home-faq"><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </div></section>

      <section className="home-contact" id="contact" aria-labelledby="contact-title"><div className="home-atmos" aria-hidden="true"><VisualBackdrop id="contactBackdrop" />{getBackdrop("contactBackdrop") ? null : <NightCity seed={23} />}</div><div className="gm-shell home-section home-contact-grid">
        <div><p className="gm-label">{c.contact.label}</p><h2 id="contact-title">{c.contact.title}</h2><p>{c.contact.text}</p><ContactForm locale={locale} /></div>
        <div className="home-contact-aside"><FlowMark className="home-contact-mark" />
          {bookingUrl ? <><p>{c.contact.preferTalk}</p><a className="gm-cta light" href={bookingUrl} target="_blank" rel="noopener">{c.contact.book} <span aria-hidden="true">↗</span></a></> : null}
          <p>{c.contact.email}: <a className="home-email-small" href={`mailto:${business.email}`}>{business.email}</a></p>
          <p>{c.contact.orStart} <a className="home-email-small" href={scorecardPath}>{c.contact.scorecard}</a>{locale === "hu" ? "." : <span aria-hidden="true"> ↗</span>}</p>
        </div>
      </div></section>

      <StickyCta href={scorecardPath} label={c.hero.sticky} note={c.hero.stickyNote} />
    </main>
  );
}
