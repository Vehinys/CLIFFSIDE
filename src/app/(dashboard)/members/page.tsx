import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { deleteUserAccount, updateUserRole } from "./_actions";
import { deleteRole } from "../roles/_actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { RoleOrderButtons } from "./_components/role-order-buttons";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canReadMembers = canDo(session.user.permissions, "members", "read");
  const canReadRoles = canDo(session.user.permissions, "roles", "read");
  if (!canReadMembers && !canReadRoles) redirect("/dashboard");

  const { tab: rawTab } = await searchParams;
  const activeTab: "members" | "roles" =
    rawTab === "roles" && canReadRoles ? "roles" : canReadMembers ? "members" : "roles";

  // ── Données ────────────────────────────────────────────────────────────────
  const [users, roles] = await Promise.all([
    canReadMembers
      ? prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    canReadMembers || canReadRoles
      ? prisma.role.findMany({
          include: { _count: { select: { users: true, permissions: true } } },
          orderBy: { position: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const canEditMembers =
    canDo(session.user.permissions, "members", "update") ||
    canDo(session.user.permissions, "roles", "update");
  const canDeleteMembers = canDo(session.user.permissions, "members", "delete");

  const canWriteRoles = canDo(session.user.permissions, "roles", "create");
  const canEditRoles = canDo(session.user.permissions, "roles", "update");
  const canDeleteRoles = canDo(session.user.permissions, "roles", "delete");

  return (
    <div className="space-y-0">
      {/* ── En-tête ─────────���───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text">Membres &amp; Rôles</h1>
          <p className="text-sm text-muted mt-1">
            {activeTab === "members"
              ? `${users.length} compte${users.length !== 1 ? "s" : ""} enregistré${users.length !== 1 ? "s" : ""}`
              : `${roles.length} rôle${roles.length !== 1 ? "s" : ""} configuré${roles.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "members" && (
            <Link href="/members/logs">
              <Button variant="secondary" size="sm">Journal</Button>
            </Link>
          )}
          {activeTab === "roles" && (
            <>
              <Link href="/roles/logs">
                <Button variant="secondary" size="sm">Journal</Button>
              </Link>
              {canWriteRoles && (
                <Link href="/roles/new">
                  <Button size="sm">+ Nouveau rôle</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Onglets ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-0 -mb-px" aria-label="Sections Membres & Rôles">
          {canReadMembers && (
            <Link
              href="/members"
              aria-current={activeTab === "members" ? "page" : undefined}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap",
                activeTab === "members"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text hover:border-border"
              )}
            >
              Membres
              <span className={cn(
                "ml-2 rounded-full px-1.5 py-0.5 text-xs",
                activeTab === "members" ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted"
              )} aria-label={`${users.length} membres`}>
                {users.length}
              </span>
            </Link>
          )}
          {canReadRoles && (
            <Link
              href="/members?tab=roles"
              aria-current={activeTab === "roles" ? "page" : undefined}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap",
                activeTab === "roles"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text hover:border-border"
              )}
            >
              Rôles &amp; Permissions
              <span className={cn(
                "ml-2 rounded-full px-1.5 py-0.5 text-xs",
                activeTab === "roles" ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted"
              )} aria-label={`${roles.length} rôles`}>
                {roles.length}
              </span>
            </Link>
          )}
        </nav>
      </div>

      {/* ── Onglet Membres ─────────────────────────���────────────────────────── */}
      {activeTab === "members" && (
        <Card>
          {users.length === 0 ? (
            <p className="text-center text-muted py-8">Aucun compte utilisateur inscrit.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Liste des membres — {users.length} compte{users.length !== 1 ? "s" : ""}</caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted">Email</th>
                    <th className="pb-3 font-medium text-muted">Pseudo</th>
                    <th className="pb-3 font-medium text-muted">Rôle</th>
                    <th className="pb-3 font-medium text-muted">Inscrit le</th>
                    {(canEditMembers || canDeleteMembers) && <th className="pb-3" />}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const updateRoleWithId = updateUserRole.bind(null, u.id);
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors duration-150"
                      >
                        <td className="py-3 font-semibold text-text">{u.email}</td>
                        <td className="py-3 text-muted">{u.name ?? "—"}</td>
                        <td className="py-3">
                          {canEditMembers ? (
                            <form action={updateRoleWithId} className="flex items-center gap-2">
                              <Select
                                name="roleId"
                                defaultValue={u.roleId ?? ""}
                                className="w-44 h-8 text-xs"
                              >
                                <option value="">— En attente —</option>
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </Select>
                              <Button type="submit" size="sm" variant="secondary" className="h-8 px-3 text-xs shrink-0">
                                Sauver
                              </Button>
                            </form>
                          ) : (
                            <Badge color={u.role?.color ?? undefined}>
                              {u.role?.name ?? "Aucun rôle"}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-muted text-xs">{formatDate(u.createdAt)}</td>
                        {(canEditMembers || canDeleteMembers) && (
                          <td className="py-3 text-right">
                            {canDeleteMembers && !u.isSuperAdmin && (
                              <ConfirmDelete
                                action={deleteUserAccount.bind(null, u.id)}
                                label="Retirer"
                                confirmMessage={`Retirer le compte de "${u.name ?? u.email}" ? Cette action est irréversible.`}
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Onglet Rôles ────────────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <Card>
          {roles.length === 0 ? (
            <p className="text-center text-muted py-8">Aucun rôle configuré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Liste des rôles — {roles.length} rôle{roles.length !== 1 ? "s" : ""}</caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted">Rôle</th>
                    <th className="pb-3 font-medium text-muted">Permissions</th>
                    <th className="pb-3 font-medium text-muted">Membres</th>
                    <th className="pb-3 font-medium text-muted">Type</th>
                    <th className="pb-3 font-medium text-muted text-center">Ordre</th>
                    {(canEditRoles || canDeleteRoles) && <th className="pb-3" />}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors duration-150"
                    >
                      <td className="py-3">
                        <Badge color={r.color}>{r.name}</Badge>
                        {r.description && (
                          <p className="text-xs text-muted mt-0.5">{r.description}</p>
                        )}
                      </td>
                      <td className="py-3 text-muted tabular-nums">
                        {r._count.permissions}
                        <span className="text-muted/50"> perm.</span>
                      </td>
                      <td className="py-3 text-muted tabular-nums">
                        {r._count.users}
                        <span className="text-muted/50"> membre{r._count.users !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="py-3">
                        {r.isSystem
                          ? <Badge variant="warning">Système</Badge>
                          : <Badge variant="default">Custom</Badge>}
                      </td>
                      <td className="py-3 w-12 text-center align-middle">
                        {canEditRoles ? (
                          <div className="flex justify-center">
                            <RoleOrderButtons
                              roleId={r.id}
                              isFirst={i === 0}
                              isLast={i === roles.length - 1}
                            />
                          </div>
                        ) : (
                          <span className="text-muted text-xs">{r.position}</span>
                        )}
                      </td>
                      {(canEditRoles || canDeleteRoles) && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {canEditRoles && (
                              <Link
                                href={`/roles/${r.id}`}
                                className="text-xs text-muted hover:text-text transition-colors"
                              >
                                Modifier
                              </Link>
                            )}
                            {canDeleteRoles && !r.isSystem && (
                              <ConfirmDelete
                                action={deleteRole.bind(null, r.id)}
                                confirmMessage={`Supprimer le rôle "${r.name}" ?`}
                              />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
