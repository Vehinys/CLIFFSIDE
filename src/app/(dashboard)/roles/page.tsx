import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteRole } from "./_actions";

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "roles", "read")) redirect("/dashboard");

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true, permissions: true } } },
    orderBy: { name: "asc" },
  });

  const canWrite = canDo(session.user.permissions, "roles", "create");
  const canEdit = canDo(session.user.permissions, "roles", "update");
  const canDelete = canDo(session.user.permissions, "roles", "delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Rôles & Permissions</h1>
          <p className="text-sm text-muted mt-1">{roles.length} rôle{roles.length !== 1 ? "s" : ""}</p>
        </div>
        {canWrite && <Link href="/roles/new"><Button>+ Nouveau rôle</Button></Link>}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted">Rôle</th>
              <th className="pb-3 font-medium text-muted">Permissions</th>
              <th className="pb-3 font-medium text-muted">Membres</th>
              <th className="pb-3 font-medium text-muted">Type</th>
              {(canEdit || canDelete) && <th className="pb-3" />}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-b border-border/50 last:border-0">
                <td className="py-3">
                  <Badge color={r.color}>{r.name}</Badge>
                  {r.description && <p className="text-xs text-muted mt-0.5">{r.description}</p>}
                </td>
                <td className="py-3 text-muted">{r._count.permissions} permission{r._count.permissions !== 1 ? "s" : ""}</td>
                <td className="py-3 text-muted">{r._count.users}</td>
                <td className="py-3">
                  {r.isSystem ? <Badge variant="warning">Système</Badge> : <Badge variant="default">Custom</Badge>}
                </td>
                {(canEdit || canDelete) && (
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && <Link href={`/roles/${r.id}`} className="text-xs text-muted hover:text-text">Modifier</Link>}
                      {canDelete && !r.isSystem && (
                        <form action={deleteRole.bind(null, r.id)}>
                          <button type="submit" className="text-xs text-danger hover:text-red-400">Supprimer</button>
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
