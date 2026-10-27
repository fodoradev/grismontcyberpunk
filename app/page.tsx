import { Fragment } from "react";
import type { Metadata } from "next";
import FlowArt from "../components/FlowArt";
import HomeMotion from "../components/HomeMotion";
import ProcessExplorer from "../components/ProcessExplorer";
import ContactForm from "../components/ContactForm";
import { getHomeContent, getHomeMeta } from "../content/site/home";
import { business } from "../data/business";
import { known, site } from "../data/site";
import { localizePath } from "../lib/i18n";
import { getLocale } from "../lib/i18n-server";
import "./home.css";

export async function generateMetadata(): Promise<Metadata> {
  const meta = getHomeMeta(await getLocale());
  return { title: { absolute: meta.title }, description: meta.description, openGraph: { title: meta.ogTitle, description: meta.ogDescription } };
}

function SectionHeading({ id, label, title, note }: { id: string; label: string; title: string; note?: string }) {
  return <div className="home-section-heading"><div><p className="gm-label">{label}</p><h2 id={id}>{title}</h2></div>{note ? <p className="home-heading-note">{note}</p> : null}</div>;
}

export default async function Home() {
  const locale = await getLocale();
  const c = getHomeContent(locale);
  const scorecardPath = localizePath(locale, "/scorecard");
  const bookingUrl = known(site.bookingUrl);
  // Until a booking link exists, "book a call" leads to the contact form (project convention).
  const booking = bookingUrl ?? "#contact";
  const bookingIsExternal = Boolean(bookingUrl);
  // Numbered sections are counted at render time, so a hidden [PROOF] section leaves no gap.
  let n = 0;
  const label = (text: string) => `${String(++n).padStart(2, "0")} / ${text}`;

  return (
    <main id="main-content" className="gm-home">
      <HomeMotion />
      <section className="gm-shell home-hero" id="home" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="gm-label home-eyebrow"><span aria-hidden="true" /> {c.hero.eyebrow}</p>
          <h1 id="hero-title">{c.hero.title[0]}<span className="home-tangles">{c.hero.title[1]}<svg viewBox="0 0 370 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 13 C60 3 115 18 162 9 S260 3 367 11" /></svg></span>{c.hero.title[2]}</h1>
          <p className="gm-hero-text">{c.hero.sub}</p>
          <div className="gm-actions"><a className="gm-cta" href={scorecardPath}>{c.hero.start} <span aria-hidden="true">↗</span></a><a className="gm-text-link" href={booking} {...(bookingIsExternal ? { target: "_blank", rel: "noopener" } : {})}>{c.hero.book} <span aria-hidden="true">{bookingIsExternal ? "↗" : "↓"}</span></a></div>
          <p className="gm-under">{c.hero.under}</p>
        </div>
        <FlowArt locale={locale} caption={c.hero.tagline} />
      </section>
      <div className="gm-shell home-credentials" aria-label={c.strip.label}>{c.strip.items.map(([title, text]) => <p key={title}><strong>{title}</strong><span>{text}</span></p>)}</div>

      <section className="gm-shell home-section" id="problems" aria-labelledby="problems-title">
        <SectionHeading id="problems-title" label={label(c.problems.label)} title={c.problems.title} note={c.problems.intro} />
        <ProcessExplorer problems={c.problems.cards} labels={c.problems.labels} />
        <p className="home-section-foot"><span aria-hidden="true">↳</span> {c.problems.closing}</p>
      </section>

      <section className="gm-shell home-section" id="services" aria-labelledby="services-title">
        <SectionHeading id="services-title" label={label(c.services.label)} title={c.services.title} note={c.services.intro} />
        <aside className="home-launch" aria-label={c.services.launch.title}><strong>{c.services.launch.title}</strong><p>{c.services.launch.text}</p>{c.services.placesLeft ? <span className="home-launch-left">{c.services.placesLeft}</span> : null}</aside>
        <div className="home-services">{c.services.cards.map((s, i) => (
          <article className={`home-service${s.label ? " home-service-featured" : ""}`} id={s.id} key={s.id}>
            <div className="home-service-top"><span className="gm-label">{s.label ?? s.name}</span><span className="home-index" aria-hidden="true">0{i + 1}</span></div>
            <h3>{s.title}</h3>
            <p>{s.label ? <><strong>{s.name}.</strong> </> : null}{s.text}</p>
            <div className="home-service-detail">
              {s.topics ? <><span className="home-service-sub">{s.topicsLabel}</span><ul>{s.topics.map(t => <li key={t}>{t}</li>)}</ul></> : null}
              {s.guarantee ? <p className="home-guarantee">{s.guarantee}</p> : null}
            </div>
            <p className="home-price"><s aria-label={`${c.services.regularLabel}: ${s.price.regular}`}>{s.price.regular}</s> <strong aria-label={`${c.services.launchLabel}: ${s.price.launch}`}>{s.price.launch}</strong><span>{s.price.note}</span></p>
            <a className="gm-text-link" href="#contact" data-interest={s.id}>{s.cta} <span aria-hidden="true">↓</span></a>
          </article>
        ))}</div>
        <p className="home-section-foot"><span aria-hidden="true">↳</span> {c.services.notSure} <a className="gm-text-link" href={scorecardPath}>{c.services.notSureLink} <span aria-hidden="true">↗</span></a></p>
      </section>

      <section className="home-method" id="method" aria-labelledby="method-title"><div className="gm-shell home-section">
        <SectionHeading id="method-title" label={label(c.method.label)} title={c.method.title} note={c.method.intro} />
        <ol className="home-method-list">{c.method.steps.map((step, i) => <li key={step.tag}><span className="home-method-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><span className="home-method-tag">{step.tag}</span></li>)}</ol>
        <p className="home-method-foot"><span aria-hidden="true">↳</span> {c.method.closing}</p>
      </div></section>

      {c.proof ? (
        <section className="gm-shell home-section" id="proof" aria-labelledby="proof-title">
          <SectionHeading id="proof-title" label={label(c.proof.label)} title={c.proof.title} note={c.proof.intro} />
          <div className="home-proof">{c.proof.cases.map(cs => (
            <article key={cs.title} className="home-proof-card"><h3>{cs.title}</h3><dl><dt>{c.proof!.problem}</dt><dd>{cs.problem}</dd><dt>{c.proof!.action}</dt><dd>{cs.action}</dd><dt>{c.proof!.result}</dt><dd className="home-proof-result">{cs.result}</dd></dl>
              {cs.slug ? <a className="gm-text-link" href={localizePath(locale, `/work/case-studies/${cs.slug}`)}>{c.proof!.read} <span aria-hidden="true">↗</span></a> : null}</article>
          ))}</div>
          {c.proof.testimonial ? <figure className="home-testimonial"><blockquote>{c.proof.testimonial.quote}</blockquote><figcaption>— {c.proof.testimonial.name}</figcaption></figure> : null}
        </section>
      ) : null}

      <section className="home-scorecard" id="scorecard" aria-labelledby="scorecard-title"><div className="gm-shell home-section">
        <SectionHeading id="scorecard-title" label={label(c.scorecard.label)} title={c.scorecard.title} note={c.scorecard.intro} />
        <div className="home-score-grid">
          <div className="home-areas"><h3>{c.scorecard.areasTitle}</h3>{c.scorecard.areas.map(([title, text], i) => <details key={title}><summary><span><span className="home-area-number">0{i + 1}</span>{title}</span></summary><p>{text}</p></details>)}</div>
          <div className="home-report"><div className="home-report-top"><span className="gm-label">{c.scorecard.name}</span><span className="home-free">{c.scorecard.free}</span></div><h3>{c.scorecard.youGet}</h3><ul>{c.scorecard.items.map(item => <li key={item}>{item}</li>)}</ul><a className="gm-cta" href={scorecardPath}>{c.scorecard.cta} <span aria-hidden="true">↗</span></a><p className="home-report-note">{c.scorecard.small}</p>{site.sampleReportPublished ? <a className="gm-text-link home-report-sample" href={localizePath(locale, "/scorecard/sample")}>{c.scorecard.sample} <span aria-hidden="true">↗</span></a> : null}</div>
        </div>
      </div></section>

      <section className="gm-shell home-section home-about" id="about" aria-labelledby="about-title">
        <div><p className="gm-label">{label(c.about.label)}</p><h2 id="about-title">{c.about.title}</h2>
          {c.about.photo ? <img className="home-photo" src={c.about.photo} alt={c.about.photoAlt(c.about.name)} width={480} height={560} /> : null}
          <div className="home-notebook"><span className="gm-label">{c.about.notebookLabel}</span><p>{c.about.notebook}</p><span className="home-signature">{business.firstName} / Grismont</span></div></div>
        <div className="home-about-copy">
          {c.about.paragraphs.map((text, i) => <p key={text} className={i === 0 ? "home-intro" : undefined}>{text}</p>)}
          <div className="home-about-facts">{c.about.facts.map(fact => <span key={fact}>{fact}</span>)}</div>
          {c.about.timelineRows.length ? <table className="home-timeline"><caption>{c.about.timeline.caption}</caption><thead><tr><th scope="col">{c.about.timeline.years}</th><th scope="col">{c.about.timeline.role}</th><th scope="col">{c.about.timeline.result}</th></tr></thead><tbody>{c.about.timelineRows.map(row => <tr key={row.years + row.role}><td>{row.years}</td><td>{row.role}</td><td>{row.result}</td></tr>)}</tbody></table> : null}
          {c.about.links.length ? <p className="home-about-links">{c.about.links.map(link => <a key={link.href} className="gm-text-link" href={link.href} target="_blank" rel="noopener">{link.text} <span aria-hidden="true">↗</span></a>)}</p> : null}
        </div>
      </section>

      <section className="gm-shell home-section home-next" id="next" aria-labelledby="next-title">
        <div><p className="gm-label">{c.next.label}</p><h2 id="next-title">{c.next.title}</h2></div>
        <ol className="home-next-list">{c.next.steps.map((step, i) => <li key={step.title}><span className="home-method-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </section>

      <section className="gm-shell home-section home-faq" id="faq" aria-labelledby="faq-title"><div><p className="gm-label">{c.faq.label}</p><h2 id="faq-title">{c.faq.title}</h2><p className="home-heading-note">{c.faq.note}<br /><a className="gm-text-link" href={`mailto:${business.email}`}>{c.faq.link} ↗</a></p></div><div className="home-faq-list">
        {c.faq.items.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </div></section>

      <section className="home-contact" id="contact" aria-labelledby="contact-title"><div className="gm-shell home-section home-contact-grid">
        <div><p className="gm-label">{c.contact.label}</p><h2 id="contact-title">{c.contact.title}</h2><p>{c.contact.text}</p><ContactForm locale={locale} /></div>
        <div className="home-contact-aside"><span className="home-contact-symbol" aria-hidden="true">↳</span>
          {bookingUrl ? <><p>{c.contact.preferTalk}</p><a className="gm-cta light" href={bookingUrl} target="_blank" rel="noopener">{c.contact.book} <span aria-hidden="true">↗</span></a></> : null}
          <p>{c.contact.email}: <a className="home-email-small" href={`mailto:${business.email}`}>{business.email}</a></p>
          <p>{c.contact.orStart} <a className="home-email-small" href={scorecardPath}>{c.contact.scorecard}</a>{locale === "hu" ? "." : " ↗"}</p>
        </div>
      </div></section>
    </main>
  );
}
