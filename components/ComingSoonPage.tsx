import { getBusiness } from "../data/business";
import { localizePath, type Locale } from "../lib/i18n";
import styles from "./ComingSoonPage.module.css";

type Props = { title: string; intro: string; detail: string; locale?: Locale };

export default function ComingSoonPage({ title, intro, detail, locale = "en" }: Props) {
  const business = getBusiness(locale);
  const hu = locale === "hu";
  return (
    <main id="main-content" className={`gm-shell ${styles.page}`}>
      <a className={`gm-text-link ${styles.back}`} href={localizePath(locale, "/")}>{hu ? "← Vissza a Grismont főoldalára" : "← Back to Grismont"}</a>
      <div className={styles.layout}>
        <div>
          <span className={`gm-label ${styles.status}`}>{hu ? "Hamarosan" : "Coming soon"}</span>
          <h1>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.detail}>{detail}</p>
          <p className={styles.note}>{hu ? "Valami konkrétat keresel? " : "Looking for something specific? "}<a href={`mailto:${business.email}`}>{hu ? "Írj Attilának ↗" : "Ask Attila ↗"}</a></p>
        </div>
        <aside className={styles.available} aria-labelledby="available-title">
          <span className="gm-label">{hu ? "Már elérhető" : "Available now"}</span>
          <h2 id="available-title">{hu ? "Dolgozzunk azon, ami lassítja a munkádat." : "Let’s work on what’s slowing you down."}</h2>
          <p>{hu ? "Képzés, workshop és megvalósítás már most is kérhető. Hozz egy folyamatot, egy csapatot vagy egy feladatot, amelyen javítani szeretnél." : "Training, workshops and delivery are available today. Bring a process, a team or a task you want to improve."}</p>
          <a className="gm-cta" href={localizePath(locale, "/#services")}>{hu ? "Nézd meg az elérhető szolgáltatásokat" : "Explore current services"} <span aria-hidden="true">↗</span></a>
          <a className={`gm-text-link ${styles.scorecard}`} href={localizePath(locale, "/scorecard")}>{hu ? "Vagy kezdd az ingyenes folyamatfelmérővel" : "Or start with the free scorecard"} <span aria-hidden="true">→</span></a>
        </aside>
      </div>
    </main>
  );
}
