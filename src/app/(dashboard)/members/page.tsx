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
import { UserPseudo } from "@/components/ui/user-pseudo";
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
      {/* ── En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-border/40 relative">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent blur-xl -z-10 rounded-full" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-text to-muted/70 drop-shadow-sm">
            Membres & Rôles
          </h1>
          <p className="text-sm font-medium text-muted/80 mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            {activeTab === "members"
              ? `${users.length} compte${users.length !== 1 ? "s" : ""} enregistré${users.length !== 1 ? "s" : ""}`
              : `${roles.length} rôle${roles.length !== 1 ? "s" : ""} configuré${roles.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
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
      <div className="mb-6 relative">
        <nav className="inline-flex gap-2 p-1 bg-surface-2/40 backdrop-blur-md rounded-xl border border-border/50" aria-label="Sections Membres & Rôles">
          {canReadMembers && (
            <Link
              href="/members"
              aria-current={activeTab === "members" ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
                activeTab === "members"
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02]"
                  : "text-muted hover:text-text hover:bg-surface-2/80"
              )}
            >
              Membres
              <span className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold transition-colors",
                activeTab === "members" ? "bg-white/20 text-white" : "bg-surface text-muted"
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
                "relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
                activeTab === "roles"
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02]"
                  : "text-muted hover:text-text hover:bg-surface-2/80"
              )}
            >
              Rôles & Permissions
              <span className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold transition-colors",
                activeTab === "roles" ? "bg-white/20 text-white" : "bg-surface text-muted"
              )} aria-label={`${roles.length} rôles`}>
                {roles.length}
              </span>
            </Link>
          )}
        </nav>
      </div>

      {/* ── Onglet Membres ──────────────────────────────────────────────────── */}
      {activeTab === "members" && (
        <Card className="border-border/40 shadow-xl bg-surface/60 backdrop-blur-lg overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 ring-1 ring-border/50 shadow-inner">
                <span className="text-2xl opacity-50">👥</span>
              </div>
              <p className="text-lg font-medium text-text">Aucun compte</p>
              <p className="text-muted mt-1 max-w-sm">Il n'y a actuellement aucun utilisateur inscrit dans la base de données.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Liste des membres — {users.length} compte{users.length !== 1 ? "s" : ""}</caption>
                <thead>
                  <tr className="border-b border-border/50 bg-surface-2/30 text-left">
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
                        className="border-b border-border/30 last:border-0 hover:bg-primary/5 transition-all duration-200 group/row"
                      >
                        <td className="py-4 pl-4 pr-2 font-medium text-text group-hover/row:text-primary transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-surface-2 to-surface border border-border/50 flex items-center justify-center text-xs font-bold shadow-sm">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            {u.email}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-muted group-hover/row:text-text/80 transition-colors">
                          <UserPseudo name={u.name} color={u.role?.color} />
                        </td>
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
        <Card className="border-border/40 shadow-xl bg-surface/60 backdrop-blur-lg overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 ring-1 ring-border/50 shadow-inner">
                <span className="text-2xl opacity-50">🛡️</span>
              </div>
              <p className="text-lg font-medium text-text">Aucun rôle</p>
              <p className="text-muted mt-1 max-w-sm">Configurez des rôles pour attribuer des permissions spécifiques aux membres.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-1">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <caption className="sr-only">Liste des rôles — {roles.length} rôle{roles.length !== 1 ? "s" : ""}</caption>
                <thead>
                  <tr className="text-left px-4">
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
                      className="bg-surface-2/30 hover:bg-surface-2/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-border/30 hover:ring-primary/30 rounded-xl group/role hidden sm:table-row"
                      style={{ display: "table-row" }}
                    >
                      <td className="py-4 pl-4 pr-3 rounded-l-xl">
                        <div className="flex flex-col gap-1.5">
                          <Badge color={r.color} className="w-fit shadow-sm">{r.name}</Badge>
                          {r.description && (
                            <p className="text-xs text-muted/70 line-clamp-1 group-hover/role:text-muted transition-colors">{r.description}</p>
                          )}
                        </div>
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
