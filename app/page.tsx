import { Fragment } from "react";
import FlowArt from "../components/FlowArt";
import HomeMotion from "../components/HomeMotion";
import ProcessExplorer from "../components/ProcessExplorer";
import { homeContent } from "../content/site/home";
import { business } from "../data/business";
import { localizePath } from "../lib/i18n";
import { getLocale } from "../lib/i18n-server";
import "./home.css";

function Lines({ lines }: { lines: string[] }) {
  return <>{lines.map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>)}</>;
}

function SectionHeading({ id, heading }: { id: string; heading: { label: string; title: string[]; note: string } }) {
  return <div className="home-section-heading"><div><p className="gm-label">{heading.label}</p><h2 id={id}><Lines lines={heading.title} /></h2></div><p className="home-heading-note">{heading.note}</p></div>;
}

export default async function Home() {
  const locale = await getLocale();
  const c = homeContent[locale];
  const scorecardPath = localizePath(locale, "/scorecard");

  return (
    <main id="main-content" className="gm-home">
      <HomeMotion />
      <section className="gm-shell home-hero" id="home" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="gm-label home-eyebrow"><span aria-hidden="true" /> {c.eyebrow}</p>
          <h1 id="hero-title">{c.hero[0]}<br />{c.hero[1]}<span className="home-tangles">{c.hero[2]}<svg viewBox="0 0 370 20" aria-hidden="true"><path d="M3 13 C60 3 115 18 162 9 S260 3 367 11" /></svg></span>{c.hero[3]}</h1>
          <p className="home-intro">{c.intro}</p>
          <p className="gm-hero-text">{c.heroText}</p>
          <div className="gm-actions"><a className="gm-cta" href={scorecardPath}>{c.start} <span aria-hidden="true">↗</span></a><a className="gm-text-link" href="#services">{c.explore} <span aria-hidden="true">↓</span></a></div>
          <p className="gm-under">{c.under}</p>
        </div>
        <FlowArt locale={locale} />
      </section>
      <div className="gm-shell home-credentials" aria-label={c.credentialsLabel}>{c.credentials.map(([title, text]) => <p key={title}><strong>{title}</strong><span>{text}</span></p>)}</div>
      <section className="gm-shell home-section" id="services" aria-labelledby="services-title">
        <SectionHeading id="services-title" heading={c.servicesHeading} />
        <div className="home-services">{c.services.map(s => <article className="home-service" id={s.id} key={s.id}><div className="home-service-top"><span className="gm-label">{s.name}</span><span className="home-index" aria-hidden="true">{s.number}</span></div><h3>{s.title}</h3><p>{s.text}</p><ul>{s.items.map(item => <li key={item}>{item}</li>)}</ul><p className="home-outcome">{s.outcome}</p><a className="gm-text-link" href={`mailto:${business.email}?subject=${encodeURIComponent(s.subject)}`}>{s.link} <span aria-hidden="true">↗</span></a></article>)}</div>
      </section>
      <section className="home-method" id="method" aria-labelledby="method-title"><div className="gm-shell home-section">
        <SectionHeading id="method-title" heading={c.methodHeading} />
        <ol className="home-method-list">{c.methods.map((method, i) => <li key={method.tag}><span className="home-method-number">0{i + 1}</span><h3>{method.title}</h3><p>{method.text}</p><span className="home-method-tag">{method.tag}</span></li>)}</ol>
        <p className="home-method-foot"><span aria-hidden="true">↳</span> {c.methodFoot}</p>
      </div></section>
      <section className="gm-shell home-section" id="examples" aria-labelledby="examples-title">
        <SectionHeading id="examples-title" heading={c.examplesHeading} /><ProcessExplorer locale={locale} />
      </section>
      <section className="home-scorecard" id="scorecard" aria-labelledby="scorecard-title"><div className="gm-shell home-section">
        <SectionHeading id="scorecard-title" heading={c.scoreHeading} />
        <div className="home-score-grid"><div className="home-areas"><h3>{c.areasTitle}</h3>{c.areas.map(([title, text], i) => <details key={title}><summary><span><span className="home-area-number">0{i + 1}</span>{title}</span></summary><p>{text}</p></details>)}</div><div className="home-report"><div className="home-report-top"><span className="gm-label">{c.scoreName}</span><span className="home-free">{c.free}</span></div><h3><Lines lines={c.reportTitle} /></h3><ul>{c.reportItems.map(item => <li key={item}>{item}</li>)}</ul><a className="gm-cta" href={scorecardPath}>{c.reportStart} <span aria-hidden="true">↗</span></a><p className="home-report-note">{c.reportNote}</p></div></div><p className="home-score-note">{c.scoreNote}</p>
      </div></section>
      <section className="gm-shell home-section home-about" id="about" aria-labelledby="about-title">
        <div><p className="gm-label">{c.aboutLabel}</p><h2 id="about-title"><Lines lines={c.aboutTitle} /></h2><div className="home-notebook"><span className="gm-label">{c.notebookLabel}</span><p>{c.notebook}</p><span className="home-signature">Attila / Grismont</span></div></div><div className="home-about-copy"><p className="home-intro">{c.aboutIntro}</p>{c.aboutText.map(text => <p key={text}>{text}</p>)}<div className="home-about-facts">{c.aboutFacts.map(fact => <span key={fact}>{fact}</span>)}</div><a className="gm-text-link" href={`mailto:${business.email}`}>{c.aboutLink} <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="gm-shell home-section home-faq" id="faq" aria-labelledby="faq-title"><div><p className="gm-label">{c.faqLabel}</p><h2 id="faq-title">{c.faqTitle}</h2><p className="home-heading-note">{c.faqNote}<br /><a className="gm-text-link" href={`mailto:${business.email}`}>{c.faqLink} ↗</a></p></div><div className="home-faq-list">
        {c.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}{faq.privacyLink && <><a href={localizePath(locale, "/privacy")}>{faq.privacyLink}</a>{faq.privacySuffix}</>}</p></details>)}
      </div></section>
      <section className="home-contact" id="contact" aria-labelledby="contact-title"><div className="gm-shell home-section home-contact-grid"><div><p className="gm-label">{c.contactLabel}</p><h2 id="contact-title"><Lines lines={c.contactTitle} /></h2><p><Lines lines={c.contactText} /></p><a className="home-email" href={`mailto:${business.email}`}>{business.email} <span aria-hidden="true">↗</span></a></div><div className="home-contact-aside"><span className="home-contact-symbol" aria-hidden="true">↳</span><p>{c.contactAside}</p><a className="gm-cta light" href={scorecardPath}>{c.contactStart} <span aria-hidden="true">↗</span></a><span className="home-contact-small">{c.contactSmall}</span></div></div></section>
    </main>
  );
}
