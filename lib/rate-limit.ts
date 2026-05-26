/**
 * Rate limiting MUY simple en memoria — sirve para dev y para el primer deploy.
 *
 * Limitaciones:
 *   - Se resetea en cada cold start de la función serverless
 *   - No se comparte entre instancias en Fluid Compute
 *
 * Para producción seria (cuando empiece a tener tráfico real), reemplazar
 * por Upstash Redis (https://upstash.com) o Vercel KV vía Marketplace:
 *
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.fixedWindow(15, "1 d"),
 *   });
 *   const { success } = await ratelimit.limit(ip);
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

const PER_DAY = Number(process.env.RATE_LIMIT_PER_DAY ?? 15);
const WINDOW_MS = 24 * 60 * 60 * 1000;

export function rateLimit(ip: string): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || existing.resetAt < now) {
    const bucket = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, bucket);
    return { ok: true, remaining: PER_DAY - 1, resetAt: bucket.resetAt };
  }

  if (existing.count >= PER_DAY) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: PER_DAY - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
