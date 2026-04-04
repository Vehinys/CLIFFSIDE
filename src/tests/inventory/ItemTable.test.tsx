import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ItemTable } from "@/app/(dashboard)/inventory/_components/ItemTable";
import type { InventoryItem } from "@/generated/prisma";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/(dashboard)/inventory/_actions", () => ({
  adjustQuantity: vi.fn(),
  deleteItem: vi.fn(),
}));

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: "item-1",
    name: "Glock 17",
    description: null,
    quantity: 10,
    unit: "unité",
    minStock: null,
    categoryId: "cat-1",
    activatedAt: null,
    expiresAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

const PAST = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);   // -30 jours
const FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // +30 jours

describe("ItemTable", () => {
  describe("affichage de base", () => {
    it("affiche le nom de l'article", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={false} />);
      expect(screen.getByText("Glock 17")).toBeInTheDocument();
    });

    it("affiche la quantité", () => {
      render(<ItemTable items={[makeItem({ quantity: 42 })]} canEdit={false} canDelete={false} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("affiche l'unité", () => {
      render(<ItemTable items={[makeItem({ unit: "caisse" })]} canEdit={false} canDelete={false} />);
      expect(screen.getByText("caisse")).toBeInTheDocument();
    });

    it("affiche '—' quand l'unité est null", () => {
      render(<ItemTable items={[makeItem({ unit: null })]} canEdit={false} canDelete={false} />);
      // '—' apparaît pour unité, activation, expiration, temps restant
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("statut badge", () => {
    it("affiche 'Permanent' quand aucune date d'expiration", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={false} />);
      expect(screen.getByText("Permanent")).toBeInTheDocument();
    });

    it("affiche 'Actif' quand non expiré et déjà activé", () => {
      render(
        <ItemTable
          items={[makeItem({ activatedAt: PAST, expiresAt: FUTURE })]}
          canEdit={false}
          canDelete={false}
        />
      );
      expect(screen.getByText("Actif")).toBeInTheDocument();
    });

    it("affiche 'Actif' quand non expiré sans date d'activation", () => {
      render(
        <ItemTable
          items={[makeItem({ expiresAt: FUTURE })]}
          canEdit={false}
          canDelete={false}
        />
      );
      expect(screen.getByText("Actif")).toBeInTheDocument();
    });

    it("affiche 'Expiré' quand la date d'expiration est passée", () => {
      render(
        <ItemTable
          items={[makeItem({ expiresAt: PAST })]}
          canEdit={false}
          canDelete={false}
        />
      );
      expect(screen.getByText("Expiré")).toBeInTheDocument();
      expect(screen.getByText("Terminé")).toBeInTheDocument();
    });

    it("affiche 'Programmé' quand activatedAt est dans le futur", () => {
      render(
        <ItemTable
          items={[makeItem({ activatedAt: FUTURE, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60) })]}
          canEdit={false}
          canDelete={false}
        />
      );
      expect(screen.getByText("Programmé")).toBeInTheDocument();
    });
  });

  describe("permissions canEdit", () => {
    it("affiche les boutons +/- quand canEdit=true", () => {
      render(<ItemTable items={[makeItem()]} canEdit={true} canDelete={false} />);
      expect(screen.getByLabelText("Ajouter 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Retirer 1")).toBeInTheDocument();
    });

    it("n'affiche pas les boutons +/- quand canEdit=false", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={false} />);
      expect(screen.queryByLabelText("Ajouter 1")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Retirer 1")).not.toBeInTheDocument();
    });

    it("affiche le lien Modifier quand canEdit=true", () => {
      render(<ItemTable items={[makeItem({ id: "abc" })]} canEdit={true} canDelete={false} />);
      const link = screen.getByText("Modifier");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/inventory/abc/edit");
    });

    it("n'affiche pas le lien Modifier quand canEdit=false", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={false} />);
      expect(screen.queryByText("Modifier")).not.toBeInTheDocument();
    });
  });

  describe("permissions canDelete", () => {
    it("affiche le bouton Supprimer quand canDelete=true", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={true} />);
      expect(screen.getByText("Supprimer")).toBeInTheDocument();
    });

    it("n'affiche pas le bouton Supprimer quand canDelete=false", () => {
      render(<ItemTable items={[makeItem()]} canEdit={false} canDelete={false} />);
      expect(screen.queryByText("Supprimer")).not.toBeInTheDocument();
    });
  });

  describe("liste vide", () => {
    it("rend un tableau sans lignes si items=[]", () => {
      const { container } = render(<ItemTable items={[]} canEdit={false} canDelete={false} />);
      expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
    });
  });

  describe("plusieurs articles", () => {
    it("rend une ligne par article", () => {
      const items = [
        makeItem({ id: "1", name: "AK-47" }),
        makeItem({ id: "2", name: "MP5" }),
        makeItem({ id: "3", name: "Deagle" }),
      ];
      render(<ItemTable items={items} canEdit={false} canDelete={false} />);
      expect(screen.getByText("AK-47")).toBeInTheDocument();
      expect(screen.getByText("MP5")).toBeInTheDocument();
      expect(screen.getByText("Deagle")).toBeInTheDocument();
    });
  });
});
