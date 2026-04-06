import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// On réimporte le module après chaque test pour vider le store in-memory
// (le store est un module-level Map — on mock Date.now pour contrôler le temps)

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  async function getCheckRateLimit() {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    return checkRateLimit;
  }

  it("autorise la première tentative", async () => {
    const checkRateLimit = await getCheckRateLimit();
    expect(checkRateLimit("ip:login", 5, 60_000)).toBe(true);
  });

  it("autorise jusqu'à max tentatives inclusif", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key = "ip:test-max";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000)).toBe(true);
    }
  });

  it("bloque la (max+1)ème tentative", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key = "ip:test-block";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    expect(checkRateLimit(key, 5, 60_000)).toBe(false);
  });

  it("réinitialise après la fenêtre de temps", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key = "ip:test-reset";
    // Sature la limite
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    expect(checkRateLimit(key, 5, 60_000)).toBe(false);

    // Avance le temps au-delà de la fenêtre
    vi.advanceTimersByTime(60_001);

    // Doit être réinitialisé
    expect(checkRateLimit(key, 5, 60_000)).toBe(true);
  });

  it("isole les clés différentes (pas de contamination)", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key1 = "ip:user-A:login";
    const key2 = "ip:user-B:login";

    // Sature uniquement la clé 1
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key1, 3, 60_000);
    }
    expect(checkRateLimit(key1, 3, 60_000)).toBe(false);

    // La clé 2 ne doit pas être affectée
    expect(checkRateLimit(key2, 3, 60_000)).toBe(true);
  });

  it("max=1 — bloque dès la deuxième tentative", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key = "ip:strict";
    expect(checkRateLimit(key, 1, 60_000)).toBe(true);
    expect(checkRateLimit(key, 1, 60_000)).toBe(false);
  });

  it("réinitialise exactement à la frontière de la fenêtre", async () => {
    const checkRateLimit = await getCheckRateLimit();
    const key = "ip:boundary";
    checkRateLimit(key, 1, 1_000);
    expect(checkRateLimit(key, 1, 1_000)).toBe(false);

    // Exactement à la frontière (resetAt <= now)
    vi.advanceTimersByTime(1_000);
    expect(checkRateLimit(key, 1, 1_000)).toBe(true);
  });
});
