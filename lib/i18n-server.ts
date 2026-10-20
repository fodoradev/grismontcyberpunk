import { headers } from "next/headers";
import { normalizeLocale } from "./i18n";

export async function getLocale() {
  return normalizeLocale((await headers()).get("x-site-locale"));
}

export async function getPublicPath() {
  return (await headers()).get("x-site-path") || "/";
}
