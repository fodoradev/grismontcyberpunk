export type Locale = "en" | "hu";

export const normalizeLocale = (value: unknown): Locale => value === "hu" ? "hu" : "en";
export const localeFromPath = (path: string): Locale => /^\/hu(?:\/|[?#]|$)/.test(path) ? "hu" : "en";

export function localizePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const stripped = path.replace(/^\/hu(?=\/|[?#]|$)/, "") || "/";
  const plain = stripped.startsWith("/") ? stripped : `/${stripped}`;
  if (locale === "en") return plain;
  if (plain === "/") return "/hu";
  return `/hu${plain.startsWith("/?") || plain.startsWith("/#") ? plain.slice(1) : plain.startsWith("/") ? plain : `/${plain}`}`;
}

export const formatNumber = (value: number, locale: Locale) => value.toLocaleString(locale === "hu" ? "hu-HU" : "en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const levels: Record<string, string> = { "Ad hoc": "Eseti", "Person-dependent": "Személyfüggő", "Documented": "Dokumentált", "Managed": "Szabályozott", "Improving": "Folyamatosan fejlődő" };
export const levelLabel = (level: string, locale: Locale) => locale === "hu" ? levels[level] ?? level : level;
