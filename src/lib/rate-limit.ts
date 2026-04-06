/**
 * Rate limiter in-memory simple.
 * Suffisant pour déploiement Vercel single-instance (petite équipe GTA RP).
 * Clé = identifiant (IP + action), max = nb tentatives, windowMs = fenêtre ms.
 */
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
