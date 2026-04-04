import { describe, it, expect } from "vitest";
import { canDo } from "@/lib/permissions";

describe("canDo", () => {
  it("retourne false pour permissions null", () => {
    expect(canDo(null, "inventory", "read")).toBe(false);
  });

  it("retourne false pour permissions undefined", () => {
    expect(canDo(undefined, "inventory", "read")).toBe(false);
  });

  it("retourne false pour tableau vide", () => {
    expect(canDo([], "inventory", "read")).toBe(false);
  });

  it("retourne true pour une correspondance exacte", () => {
    expect(canDo([{ resource: "inventory", action: "read" }], "inventory", "read")).toBe(true);
  });

  it("retourne false quand la ressource correspond mais pas l'action", () => {
    expect(canDo([{ resource: "inventory", action: "read" }], "inventory", "delete")).toBe(false);
  });

  it("retourne false quand l'action correspond mais pas la ressource", () => {
    expect(canDo([{ resource: "treasury", action: "read" }], "inventory", "read")).toBe(false);
  });

  it("retourne true quand la permission correcte est parmi plusieurs", () => {
    const perms = [
      { resource: "treasury", action: "read" },
      { resource: "inventory", action: "create" },
      { resource: "inventory", action: "read" },
    ];
    expect(canDo(perms, "inventory", "read")).toBe(true);
  });

  it("ne confond pas des ressources qui se ressemblent", () => {
    expect(canDo([{ resource: "inventory", action: "read" }], "inventoryX", "read")).toBe(false);
  });
});
