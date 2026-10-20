import { NextRequest, NextResponse } from "next/server";
import { localeFromPath, localizePath } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const locale = localeFromPath(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  requestHeaders.set("x-site-path", request.nextUrl.pathname + request.nextUrl.search);
  if (locale === "hu") {
    const destination = new URL(request.url);
    const path = localizePath("en", destination.pathname);
    // Only page routes get aliases: never expose localized API/asset endpoints.
    if (/^\/(?:api|_next|fonts)(?:\/|$)/.test(path) || path.startsWith("//")) return new NextResponse(null, { status: 404 });
    destination.pathname = path;
    return NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)|fonts(?:/|$)|favicon.ico|robots.txt|sitemap.xml).*)"] };
