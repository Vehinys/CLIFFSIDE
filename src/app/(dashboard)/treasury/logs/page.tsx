import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPseudo } from "@/components/ui/user-pseudo";

const ACTION_META: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" }> = {
  CREATE: { label: "Transaction créée",   variant: "success" },
  UPDATE: { label: "Modification",        variant: "default" },
  DELETE: { label: "Suppression",         variant: "danger" },
};

export default async function TreasuryLogsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "treasury", "read")) redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    where: { section: "treasury" },
    include: { user: { include: { role: { select: { color: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/treasury" className="text-muted hover:text-text text-sm">← Trésorerie</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Journal des modifications</h1>
        <span className="ml-auto text-xs text-muted">{logs.length} entrée{logs.length !== 1 ? "s" : ""}</span>
      </div>

      <Card>
        {logs.length === 0 ? (
          <p className="text-center text-muted py-8">Aucune modification enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted">Date</th>
                  <th className="pb-2 font-medium text-muted">Action</th>
                  <th className="pb-2 font-medium text-muted">Transaction</th>
                  <th className="pb-2 font-medium text-muted">Détails</th>
                  <th className="pb-2 font-medium text-muted">Par</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = ACTION_META[log.action] ?? { label: log.action, variant: "default" as const };
                  return (
                    <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="py-2.5 text-xs text-muted font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="py-2.5 font-medium text-text">{log.targetName}</td>
                      <td className="py-2.5 text-muted text-xs">{log.details ?? "—"}</td>
                      <td className="py-2.5 text-muted text-xs">
                        <UserPseudo name={log.userName} color={log.user?.role?.color} className="text-inherit" fallback={log.userId ?? "—"} />
                      </td>
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
