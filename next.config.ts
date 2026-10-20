import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Keep the incoming origin intact for same-origin language rewrites, including 127.0.0.1.
  skipProxyUrlNormalize: true,
  // @react-pdf/renderer runs its own React reconciler; keep it out of the server bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
  // The PDF embeds the site fonts, read from disk at runtime.
  outputFileTracingIncludes: { "/scorecard/**": ["./public/fonts/*.ttf"], "/api/cron/**": ["./public/fonts/*.ttf"] },
  async headers() { return [{ source: "/:path*", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
  ] }, ...["/scorecard/:kind(s|r|delete)/:path*", "/hu/scorecard/:kind(s|r|delete)/:path*"].map(source => ({ source, headers: [
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    { key: "Cache-Control", value: "private, no-store" }
  ] }))]; }
};
export default config;
