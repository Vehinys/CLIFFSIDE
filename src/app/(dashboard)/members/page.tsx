import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { deleteUserAccount, updateUserRole } from "./_actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "members", "read")) redirect("/dashboard");

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  const canEdit = canDo(session.user.permissions, "members", "update") || canDo(session.user.permissions, "roles", "update");
  const canDelete = canDo(session.user.permissions, "members", "delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Membres (Comptes Inscrits)</h1>
          <p className="text-sm text-muted mt-1">
            {users.length} compte{users.length !== 1 ? "s" : ""} gérant la plateforme
          </p>
        </div>
      </div>

      <Card>
        {users.length === 0 ? (
          <p className="text-center text-muted py-8">Aucun compte utilisateur inscrit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted">Email</th>
                  <th className="pb-3 font-medium text-muted">Pseudo</th>
                  <th className="pb-3 font-medium text-muted">Rôle & Accès (Dashboard)</th>
                  <th className="pb-3 font-medium text-muted">Inscrit le</th>
                  {(canEdit || canDelete) && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const updateRoleWithId = updateUserRole.bind(null, u.id);
                  return (
                    <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="py-3 font-semibold text-text">{u.email}</td>
                      <td className="py-3 text-muted">{u.name ?? "—"}</td>
                      <td className="py-3">
                        {canEdit ? (
                          <form action={updateRoleWithId} className="flex items-center gap-2">
                            <Select name="roleId" defaultValue={u.roleId ?? ""} className="w-48 bg-transparent h-8 text-xs">
                              <option value="" className="text-muted">En attente (Bloqué)</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </Select>
                            <Button type="submit" size="sm" variant="secondary" className="h-8 px-3 text-xs">Sauver</Button>
                          </form>
                        ) : (
                          <Badge color={u.role?.color ?? "default"}>{u.role?.name ?? "Aucun rôle"}</Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted text-xs">{formatDate(u.createdAt)}</td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {canDelete && (
                              <ConfirmDelete
                                action={deleteUserAccount.bind(null, u.id)}
                                label="Retirer ce compte"
                                confirmMessage={`Retirer le compte de "${u.name ?? u.email}" ? Cette action est irréversible.`}
                              />
                            )}
                          </div>
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
    </div>
  );
}
