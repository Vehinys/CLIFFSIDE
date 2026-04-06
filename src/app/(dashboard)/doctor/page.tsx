import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

interface CheckResult {
  name: string;
  status: "ok" | "warn" | "error";
  value: string;
  detail?: string;
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // ── Base de données ─────────────────────────────────────────────────────
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    results.push({
      name: "Base de données",
      status: latency < 200 ? "ok" : latency < 500 ? "warn" : "error",
      value: `${latency}ms`,
      detail: latency < 200 ? "Connexion rapide" : latency < 500 ? "Latence élevée" : "Connexion lente",
    });
  } catch (e: any) {
    results.push({ name: "Base de données", status: "error", value: "Hors ligne", detail: e.message });
  }

  // ── Utilisateurs ────────────────────────────────────────────────────────
  try {
    const [total, noRole, noPassword, superAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roleId: null, isSuperAdmin: false } }),
      prisma.user.count({ where: { password: null } }),
      prisma.user.count({ where: { isSuperAdmin: true } }),
    ]);
    results.push({
      name: "Utilisateurs",
      status: noRole > 0 ? "warn" : "ok",
      value: `${total} total`,
      detail: `${superAdmins} super-admin · ${noRole} sans rôle · ${noPassword} sans mot de passe`,
    });
  } catch (e: any) {
    results.push({ name: "Utilisateurs", status: "error", value: "Erreur", detail: e.message });
  }

  // ── Rôles & permissions ──────────────────────────────────────────────────
  try {
    const [roleCount, emptyRoles, permCount] = await Promise.all([
      prisma.role.count(),
      prisma.role.count({ where: { permissions: { none: {} } } }),
      prisma.permission.count(),
    ]);
    results.push({
      name: "Rôles & Permissions",
      status: emptyRoles > 0 ? "warn" : "ok",
      value: `${roleCount} rôles · ${permCount} permissions`,
      detail: emptyRoles > 0 ? `${emptyRoles} rôle(s) sans aucune permission` : "Tous les rôles ont des permissions",
    });
  } catch (e: any) {
    results.push({ name: "Rôles & Permissions", status: "error", value: "Erreur", detail: e.message });
  }

  // ── Inventaire ──────────────────────────────────────────────────────────
  try {
    const [total, lowStock, categories] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({ where: { quantity: { lte: 0 } } }),
      prisma.inventoryCategory.count(),
    ]);
    results.push({
      name: "Inventaire",
      status: lowStock > 0 ? "warn" : "ok",
      value: `${total} articles · ${categories} catégories`,
      detail: lowStock > 0 ? `${lowStock} article(s) en rupture de stock` : "Stock OK",
    });
  } catch (e: any) {
    results.push({ name: "Inventaire", status: "error", value: "Erreur", detail: e.message });
  }

  // ── Trésorerie ──────────────────────────────────────────────────────────
  try {
    const [total, balance] = await Promise.all([
      prisma.treasuryTransaction.count(),
      prisma.treasuryTransaction.groupBy({ by: ["type"], _sum: { amount: true } }),
    ]);
    const income = balance.find((b) => b.type === "INCOME")?._sum.amount ?? 0;
    const expense = balance.find((b) => b.type === "EXPENSE")?._sum.amount ?? 0;
    const net = income - expense;
    results.push({
      name: "Trésorerie",
      status: net < 0 ? "warn" : "ok",
      value: `${total} transactions`,
      detail: `Solde : ${net >= 0 ? "+" : ""}${net.toFixed(2)} €`,
    });
  } catch (e: any) {
    results.push({ name: "Trésorerie", status: "error", value: "Erreur", detail: e.message });
  }

  // ── Secrétariat ─────────────────────────────────────────────────────────
  try {
    const [reports, tasks, tasksDone, notes, announcements] = await Promise.all([
      prisma.meetingReport.count(),
      prisma.secretariatTask.count({ where: { status: { not: "DONE" } } }),
      prisma.secretariatTask.count({ where: { status: "DONE" } }),
      prisma.sharedNote.count(),
      prisma.announcement.count(),
    ]);
    results.push({
      name: "Secrétariat",
      status: tasks > 10 ? "warn" : "ok",
      value: `${reports} CR · ${notes} notes · ${announcements} annonces`,
      detail: `${tasks} tâche(s) ouverte(s) · ${tasksDone} terminée(s)`,
    });
  } catch (e: any) {
    results.push({ name: "Secrétariat", status: "error", value: "Erreur", detail: e.message });
  }

  // ── Variables d'environnement ────────────────────────────────────────────
  const envVars = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_URL",
  ];
  const missing = envVars.filter((v) => !process.env[v]);
  results.push({
    name: "Variables d'environnement",
    status: missing.length > 0 ? "error" : "ok",
    value: missing.length === 0 ? "Toutes définies" : `${missing.length} manquante(s)`,
    detail: missing.length > 0 ? `Manquantes : ${missing.join(", ")}` : `${envVars.length} variables vérifiées`,
  });

  // ── Runtime / Build info ─────────────────────────────────────────────────
  results.push({
    name: "Environnement",
    status: "ok",
    value: process.env.NODE_ENV ?? "unknown",
    detail: `Node ${process.version} · Vercel: ${process.env.VERCEL === "1" ? "Oui" : "Non"} · Region: ${process.env.VERCEL_REGION ?? "locale"}`,
  });

  return results;
}

export default async function DoctorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isSuperAdmin) redirect("/dashboard");

  const checks = await runChecks();
  const now = new Date();

  const okCount = checks.filter((c) => c.status === "ok").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const errorCount = checks.filter((c) => c.status === "error").length;

  const globalStatus = errorCount > 0 ? "error" : warnCount > 0 ? "warn" : "ok";

  return (
    <div className="space-y-8 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard" className="text-muted hover:text-text text-sm">← Dashboard</Link>
            <span className="text-border">/</span>
            <h1 className="text-xl font-bold text-text font-mono">⚕ Doctor</h1>
          </div>
          <p className="text-sm text-muted">
            Diagnostic système — {now.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} à {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Paris" })}
          </p>
        </div>

        {/* Badge global */}
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm font-semibold ${
          globalStatus === "ok"
            ? "border-green-500/30 bg-green-500/10 text-green-400"
            : globalStatus === "warn"
            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${
            globalStatus === "ok" ? "bg-green-400" : globalStatus === "warn" ? "bg-yellow-400" : "bg-red-400"
          }`} />
          {globalStatus === "ok" ? "Système opérationnel" : globalStatus === "warn" ? "Avertissements détectés" : "Erreurs critiques"}
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "OK", count: okCount, color: "text-green-400 border-green-500/20 bg-green-500/5" },
          { label: "Avertissements", count: warnCount, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
          { label: "Erreurs", count: errorCount, color: "text-red-400 border-red-500/20 bg-red-500/5" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-3xl font-bold font-mono">{count}</p>
            <p className="text-xs mt-1 opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Checks */}
      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.name}
            className={`rounded-xl border p-4 flex items-start gap-4 transition-all ${
              check.status === "ok"
                ? "border-border bg-surface hover:border-green-500/20"
                : check.status === "warn"
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            {/* Indicateur */}
            <div className="mt-0.5 shrink-0">
              {check.status === "ok" && (
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 5l2 2 4-4" />
                  </svg>
                </div>
              )}
              {check.status === "warn" && (
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="#facc15" aria-hidden="true">
                    <path d="M5 1L9.33 8.5H.67L5 1z" />
                    <rect x="4.4" y="4" width="1.2" height="2.5" fill="#1a1a1a" />
                    <circle cx="5" cy="7.2" r=".6" fill="#1a1a1a" />
                  </svg>
                </div>
              )}
              {check.status === "error" && (
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <p className="text-sm font-semibold text-text">{check.name}</p>
                <p className={`text-xs font-mono ${
                  check.status === "ok" ? "text-green-400" : check.status === "warn" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {check.value}
                </p>
              </div>
              {check.detail && (
                <p className="text-xs text-muted mt-0.5">{check.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted/50 font-mono pt-4 border-t border-border/30">
        CLIFFSIDE Doctor · Super Admin only · {checks.length} checks exécutés
      </div>
    </div>
  );
}
