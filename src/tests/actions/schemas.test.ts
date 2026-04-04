import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Schémas extraits des actions (même définition) ────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().transform((v) => v ?? null),
  quantity: z.coerce.number().int().min(0),
  unit: z.string().optional().transform((v) => v ?? null),
  minStock: z.coerce.number().int().min(0).optional().nullable().transform((v) => v ?? null),
  categoryId: z.string().min(1, "Catégorie requise"),
  activatedAt: z.string().optional().transform((v) => (v ? new Date(v) : null)),
  expiresAt: z.string().optional().transform((v) => (v ? new Date(v) : null)),
});

const categorySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  icon: z.string().optional().transform((v) => v ?? null),
});

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().int().positive("Le montant doit être positif"),
  description: z.string().min(1, "Description requise"),
  category: z.string().optional().transform((v) => v ?? null),
});

const roleSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide"),
  description: z.string().optional(),
});

// ── itemSchema ────────────────────────────────────────────────────────────────

describe("itemSchema", () => {
  const valid = { name: "AK-47", quantity: "10", categoryId: "cat-1" };

  it("accepte un article valide minimal", () => {
    const result = itemSchema.parse(valid);
    expect(result.name).toBe("AK-47");
    expect(result.quantity).toBe(10);
  });

  it("rejette un nom vide", () => {
    expect(() => itemSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejette une quantité négative", () => {
    expect(() => itemSchema.parse({ ...valid, quantity: "-1" })).toThrow();
  });

  it("rejette une quantité décimale", () => {
    expect(() => itemSchema.parse({ ...valid, quantity: "1.5" })).toThrow();
  });

  it("rejette categoryId vide", () => {
    expect(() => itemSchema.parse({ ...valid, categoryId: "" })).toThrow();
  });

  it("transforme description absente en null", () => {
    const result = itemSchema.parse(valid);
    expect(result.description).toBeNull();
  });

  it("transforme unit absent en null", () => {
    const result = itemSchema.parse(valid);
    expect(result.unit).toBeNull();
  });

  it("parse activatedAt en Date", () => {
    const result = itemSchema.parse({ ...valid, activatedAt: "2026-01-01T00:00" });
    expect(result.activatedAt).toBeInstanceOf(Date);
  });

  it("transforme activatedAt absent en null", () => {
    const result = itemSchema.parse(valid);
    expect(result.activatedAt).toBeNull();
  });

  it("accepte minStock à 0", () => {
    const result = itemSchema.parse({ ...valid, minStock: "0" });
    expect(result.minStock).toBe(0);
  });
});

// ── categorySchema ────────────────────────────────────────────────────────────

describe("categorySchema", () => {
  it("accepte une catégorie valide", () => {
    const result = categorySchema.parse({ name: "Armes", icon: "🔫" });
    expect(result.name).toBe("Armes");
    expect(result.icon).toBe("🔫");
  });

  it("rejette un nom vide", () => {
    expect(() => categorySchema.parse({ name: "" })).toThrow();
  });

  it("transforme icon absent en null", () => {
    const result = categorySchema.parse({ name: "Véhicules" });
    expect(result.icon).toBeNull();
  });
});

// ── transactionSchema ─────────────────────────────────────────────────────────

describe("transactionSchema", () => {
  const valid = { type: "INCOME", amount: "500", description: "Vente" };

  it("accepte une transaction INCOME valide", () => {
    const result = transactionSchema.parse(valid);
    expect(result.type).toBe("INCOME");
    expect(result.amount).toBe(500);
  });

  it("accepte EXPENSE", () => {
    const result = transactionSchema.parse({ ...valid, type: "EXPENSE" });
    expect(result.type).toBe("EXPENSE");
  });

  it("rejette un type invalide", () => {
    expect(() => transactionSchema.parse({ ...valid, type: "REFUND" })).toThrow();
  });

  it("rejette un montant nul", () => {
    expect(() => transactionSchema.parse({ ...valid, amount: "0" })).toThrow();
  });

  it("rejette un montant négatif", () => {
    expect(() => transactionSchema.parse({ ...valid, amount: "-100" })).toThrow();
  });

  it("rejette un montant décimal", () => {
    expect(() => transactionSchema.parse({ ...valid, amount: "9.99" })).toThrow();
  });

  it("rejette une description vide", () => {
    expect(() => transactionSchema.parse({ ...valid, description: "" })).toThrow();
  });

  it("transforme category absent en null", () => {
    const result = transactionSchema.parse(valid);
    expect(result.category).toBeNull();
  });
});

// ── roleSchema ────────────────────────────────────────────────────────────────

describe("roleSchema", () => {
  const valid = { name: "Officier", color: "#3b82f6" };

  it("accepte un rôle valide", () => {
    const result = roleSchema.parse(valid);
    expect(result.name).toBe("Officier");
    expect(result.color).toBe("#3b82f6");
  });

  it("rejette un nom vide", () => {
    expect(() => roleSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejette une couleur sans #", () => {
    expect(() => roleSchema.parse({ ...valid, color: "3b82f6" })).toThrow();
  });

  it("rejette une couleur trop courte", () => {
    expect(() => roleSchema.parse({ ...valid, color: "#3b82f" })).toThrow();
  });

  it("rejette une couleur avec caractères invalides", () => {
    expect(() => roleSchema.parse({ ...valid, color: "#zzzzzz" })).toThrow();
  });

  it("accepte des couleurs majuscules", () => {
    const result = roleSchema.parse({ ...valid, color: "#3B82F6" });
    expect(result.color).toBe("#3B82F6");
  });

  it("accepte description optionnelle", () => {
    const result = roleSchema.parse({ ...valid, description: "Rôle intermédiaire" });
    expect(result.description).toBe("Rôle intermédiaire");
  });
});
