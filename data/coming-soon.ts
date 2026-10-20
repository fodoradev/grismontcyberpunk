import { localizePath, type Locale } from "../lib/i18n";

export const comingSoonPages = {
  courses: {
    href: "/courses",
    label: "Online courses",
    title: "Online courses.",
    intro: "Learn about process improvement, automation and AI in your own time.",
    detail: "This is where future courses will live. Course details and enrolment aren’t available yet; they’ll appear here when they’re ready.",
  },
  downloads: {
    href: "/downloads",
    label: "Digital downloads",
    title: "Digital downloads.",
    intro: "A place for resources you can download and put to work.",
    detail: "Downloadable products will be collected here, with a clear explanation of what each one helps you do. There are no products or download links available here yet.",
  },
  caseStudies: {
    href: "/work/case-studies",
    label: "Case studies",
    title: "Case studies.",
    intro: "The problem, the decisions and what changed along the way.",
    detail: "This space will hold selected project stories: what needed to improve, how the work was approached and what happened next. No case studies have been published here yet.",
  },
  apps: {
    href: "/work/apps",
    label: "Apps built",
    title: "Apps I’ve built.",
    intro: "A closer look at the applications behind the work.",
    detail: "This is where I’ll share applications I’ve built, the problems they address and how they work. App details and demos haven’t been published here yet.",
  },
} as const;

type ComingSoonPages = { [Key in keyof typeof comingSoonPages]: { [Field in keyof typeof comingSoonPages[Key]]: string } };

const huPages: ComingSoonPages = {
  courses: {
    href: "/courses",
    label: "Online képzések",
    title: "Online képzések.",
    intro: "Tanulj a folyamatfejlesztésről, az automatizálásról és a mesterséges intelligenciáról a saját időbeosztásod szerint.",
    detail: "Hamarosan itt találod az online képzéseket. A részletek és a jelentkezés még nem elérhetők; amint elkészülnek, itt lesznek.",
  },
  downloads: {
    href: "/downloads",
    label: "Letölthető anyagok",
    title: "Letölthető anyagok.",
    intro: "Segédanyagok, amelyeket letölthetsz, és a munkádban is használhatsz.",
    detail: "Itt gyűjtjük majd össze a letölthető anyagokat, és mindegyiknél leírjuk, miben segít. Egyelőre még nincs letölthető anyag.",
  },
  caseStudies: {
    href: "/work/case-studies",
    label: "Esettanulmányok",
    title: "Esettanulmányok.",
    intro: "Mi volt a probléma, mit döntöttünk, és mi változott.",
    detail: "Itt mutatunk majd be néhány kiválasztott projektet: min kellett javítani, hogyan közelítettük meg a feladatot, és mi lett az eredmény. Egyelőre még nincs közzétett esettanulmány.",
  },
  apps: {
    href: "/work/apps",
    label: "Elkészült alkalmazások",
    title: "Alkalmazások, amelyeket készítettem.",
    intro: "Ismerd meg közelebbről az alkalmazásokat, amelyeket a munkám során készítettem.",
    detail: "Itt mutatom majd be az általam készített alkalmazásokat: milyen problémákra adnak választ, és hogyan működnek. A részletes leírások és a bemutatók még nem elérhetők.",
  },
};

export function getComingSoonPages(locale: Locale): ComingSoonPages {
  const pages = locale === "hu" ? huPages : comingSoonPages;
  return {
    courses: { ...pages.courses, href: localizePath(locale, pages.courses.href) },
    downloads: { ...pages.downloads, href: localizePath(locale, pages.downloads.href) },
    caseStudies: { ...pages.caseStudies, href: localizePath(locale, pages.caseStudies.href) },
    apps: { ...pages.apps, href: localizePath(locale, pages.apps.href) },
  };
}
