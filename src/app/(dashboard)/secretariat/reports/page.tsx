import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { ReportsList } from "./_components/reports-list";
import { NewReportButton } from "../_components/new-item-buttons";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const { search } = await searchParams;

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const reports = await prisma.meetingReport.findMany({
    ...(search ? {
      where: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
    } : {}),
    include: {
      createdBy: {
        include: { role: { select: { color: true } } }
      }
    },
    orderBy: { meetingDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Comptes-rendus</h1>
        </div>
        {canWrite && <NewReportButton />}
      </div>

      <SearchInput placeholder="Rechercher un compte-rendu…" />

      <ReportsList
        reports={reports}
        canEdit={canEdit}
        canDelete={canDelete}
        search={search}
      />
    </div>
  );
}
