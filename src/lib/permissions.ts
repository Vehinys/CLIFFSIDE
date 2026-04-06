type Permission = { resource: string; action: string };

/**
 * Vérifie si un utilisateur a la permission d'effectuer une action sur une ressource.
 * Usage: canDo(session.user.permissions, "inventory", "create")
 */
export function canDo(
  permissions: Permission[] | undefined | null,
  resource: string,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Toutes les ressources et actions disponibles pour la matrice de permissions.
 */
export const RESOURCES = [
  "dashboard",
  "objectives",
  "secretariat",
  "members",
  "inventory",
  "perishables",
  "treasury",
  "roles",
] as const;

export const ACTIONS = ["read", "create", "update", "delete"] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];

export const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard:   "Dashboard",
  objectives:  "Objectifs du jour",
  secretariat: "Secrétariat",
  members:     "Membres",
  inventory:   "Inventaire",
  perishables: "Périssables",
  treasury:    "Trésorerie",
  roles:       "Rôles & Permissions",
};

export const ACTION_LABELS: Record<Action, string> = {
  read: "Voir",
  create: "Créer",
  update: "Modifier",
  delete: "Supprimer",
};
