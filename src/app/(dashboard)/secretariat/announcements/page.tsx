import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { AnnouncementsList } from "./_components/announcements-list";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const { search } = await searchParams;

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const announcements = await prisma.announcement.findMany({
    ...(search ? {
      where: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
    } : {}),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Annonces</h1>
        </div>
      </div>

      <SearchInput placeholder="Rechercher une annonce…" />

      {announcements.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucune annonce pour le moment."}</p>
        </Card>
      ) : (
        <AnnouncementsList 
          announcements={announcements} 
          canWrite={canWrite} 
          canEdit={canEdit} 
          canDelete={canDelete} 
        />
      )}
    </div>
  );
}
