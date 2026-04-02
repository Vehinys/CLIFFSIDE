import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo, RESOURCES, ACTIONS, RESOURCE_LABELS, ACTION_LABELS } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateRole } from "../_actions";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "roles", "update")) redirect("/roles");

  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });
  if (!role) notFound();

  const hasPermission = (resource: string, action: string) =>
    role.permissions.some((p) => p.resource === resource && p.action === action);

  const updateWithId = updateRole.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/roles" className="text-muted hover:text-text text-sm">← Rôles</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier — {role.name}</h1>
        {role.isSystem && <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded">Système</span>}
      </div>

      <form action={updateWithId} className="rounded-lg border border-border bg-surface p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" required>Nom du rôle</Label>
            <Input id="name" name="name" defaultValue={role.name} required disabled={role.isSystem} />
          </div>
          <div>
            <Label htmlFor="color" required>Couleur</Label>
            <Input id="color" name="color" type="color" defaultValue={role.color} className="w-12 h-10 p-1 cursor-pointer" required />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" defaultValue={role.description ?? ""} />
        </div>

        <div>
          <p className="text-sm font-semibold text-text mb-3">Permissions</p>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-3 py-2 text-left font-medium text-muted">Ressource</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="px-3 py-2 text-center font-medium text-muted">{ACTION_LABELS[a]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((resource) => (
                  <tr key={resource} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-text">{RESOURCE_LABELS[resource]}</td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          name={`perm_${resource}_${action}`}
                          defaultChecked={hasPermission(resource, action)}
                          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                          aria-label={`${RESOURCE_LABELS[resource]} — ${ACTION_LABELS[action]}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/roles"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
