import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Salted hash of the client IP for rate limiting, or null when no salt is configured. */
export async function ipHash() {
  // Without a secret salt the hash could be reversed, so don't store anything (rate limiting is then skipped).
  const salt = process.env.IP_HASH_SALT;
  if (!salt) { console.warn("[rate-limit] IP_HASH_SALT is not set; rate limiting disabled"); return null; }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  return ip ? createHash("sha256").update(ip + salt).digest("hex") : null;
}
