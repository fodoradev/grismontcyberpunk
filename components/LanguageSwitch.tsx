"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { localizePath, type Locale } from "../lib/i18n";

function currentPublicPath() {
  const hash = window.location.hash === "#home" ? "" : window.location.hash;
  return window.location.pathname + window.location.search + hash;
}

export default function LanguageSwitch({ locale, path }: { locale: Locale; path: string }) {
  const pathname = usePathname();
  const [publicPath, setPublicPath] = useState(path);
  useEffect(() => {
    const syncPath = () => setPublicPath(currentPublicPath());
    syncPath();
    window.addEventListener("hashchange", syncPath);
    window.addEventListener("popstate", syncPath);
    return () => {
      window.removeEventListener("hashchange", syncPath);
      window.removeEventListener("popstate", syncPath);
    };
  }, [pathname]);
  return <nav className="gm-language" aria-label={locale === "hu" ? "Nyelvválasztás" : "Language"}>
    {(["en", "hu"] as const).map(target => target === locale
      ? <span key={target} lang={target} aria-current="true" aria-label={target === "hu" ? "Magyar" : "English"}>{target.toUpperCase()}</span>
      : <a key={target} lang={target} hrefLang={target} href={localizePath(target, publicPath)} aria-label={target === "hu" ? "Magyar" : "English"} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const href = localizePath(target, currentPublicPath());
        const change = new CustomEvent("grismont:language-change", { cancelable: true, detail: { href, locale: target } });
        if (!window.dispatchEvent(change)) event.preventDefault();
        else event.currentTarget.href = href;
      }}>{target.toUpperCase()}</a>)}
  </nav>;
}
