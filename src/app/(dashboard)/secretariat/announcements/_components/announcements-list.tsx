"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { ViewModal } from "@/components/ui/view-modal";
import { deleteAnnouncement, createAnnouncement, updateAnnouncement } from "../../_actions";
import { AnnouncementModal } from "./announcement-modal";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  createdByName: string | null;
  createdBy?: {
    role?: {
      color: string;
    } | null;
  } | null;
}

interface Props {
  announcements: Announcement[];
  canEdit: boolean;
  canDelete: boolean;
  search?: string;
}

export function AnnouncementsList({ announcements, canEdit, canDelete, search }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const handler = () => { setEditingAnnouncement(null); setModalOpen(true); };
    window.addEventListener("announcements:create", handler);
    return () => window.removeEventListener("announcements:create", handler);
  }, []);

  if (announcements.length === 0) {
    return (
      <>
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucune annonce pour le moment."}</p>
        </Card>
        <AnnouncementModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Nouvelle annonce"
          action={createAnnouncement}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id} className="group hover:border-primary/30 transition-all">
            <div className="flex items-start gap-4">
              {a.imageUrl && (
                <div className="shrink-0 w-48 h-48 rounded-lg border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center p-2">
                  <Image
                    src={a.imageUrl}
                    alt=""
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-start">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-text group-hover:text-primary transition-colors">{a.title}</h2>
                    <p className="text-xs text-muted mt-0.5">
                      {a.createdByName ?? "—"} · {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setViewingAnnouncement(a)}
                      className="text-muted hover:text-primary transition-colors p-1"
                      aria-label="Tout lire"
                      title="Tout lire"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => { setEditingAnnouncement(a); setModalOpen(true); }}
                        className="text-xs text-muted hover:text-text transition-colors"
                      >
                        Modifier
                      </button>
                    )}
                    {canDelete && (
                      <ConfirmDelete
                        action={deleteAnnouncement.bind(null, a.id)}
                        confirmMessage={`Supprimer l'annonce "${a.title}" ?`}
                        successMessage="Annonce supprimée"
                      />
                    )}
                  </div>
                </div>
                <div className="text-sm text-text/80 mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                  {a.content}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnnouncementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingAnnouncement ? "Modifier l'annonce" : "Nouvelle annonce"}
        initialData={editingAnnouncement ? {
          title: editingAnnouncement.title,
          content: editingAnnouncement.content,
          imageUrl: editingAnnouncement.imageUrl,
        } : undefined}
        action={editingAnnouncement ? updateAnnouncement.bind(null, editingAnnouncement.id) : createAnnouncement}
      />

      <ViewModal
        open={!!viewingAnnouncement}
        onOpenChange={(v) => { if (!v) setViewingAnnouncement(null); }}
        title={viewingAnnouncement?.title ?? ""}
        content={viewingAnnouncement?.content ?? ""}
        imageUrl={viewingAnnouncement?.imageUrl}
        metadata={viewingAnnouncement ? `${viewingAnnouncement.createdByName ?? "—"} · ${new Date(viewingAnnouncement.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}` : undefined}
      />
    </div>
  );
}
