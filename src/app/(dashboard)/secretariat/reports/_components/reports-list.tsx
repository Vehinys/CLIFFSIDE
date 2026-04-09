"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { ViewModal } from "@/components/ui/view-modal";
import { deleteReport, createReport, updateReport } from "../../_actions";
import { ReportModal } from "./report-modal";
import { UserPseudo } from "@/components/ui/user-pseudo";

interface Report {
  id: string;
  title: string;
  content: string;
  meetingDate: Date;
  imageUrl: string | null;
  createdByName: string | null;
  createdBy?: {
    role?: {
      color: string;
    } | null;
  } | null;
}

interface Props {
  reports: Report[];
  canEdit: boolean;
  canDelete: boolean;
  search?: string;
}

export function ReportsList({ reports, canEdit, canDelete, search }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  useEffect(() => {
    const handler = () => { setEditingReport(null); setModalOpen(true); };
    window.addEventListener("reports:create", handler);
    return () => window.removeEventListener("reports:create", handler);
  }, []);

  if (reports.length === 0) {
    return (
      <>
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucun compte-rendu pour le moment."}</p>
        </Card>
        <ReportModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Nouveau compte-rendu"
          action={createReport}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start gap-4">
              {r.imageUrl && (
                <div className="shrink-0 w-48 h-48 rounded-lg border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center p-2">
                  <Image
                    src={r.imageUrl}
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
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-text">{r.title}</h2>
                      <span className="text-xs text-muted border border-border rounded px-2 py-0.5">
                        {new Date(r.meetingDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Rédigé par <UserPseudo name={r.createdByName} color={r.createdBy?.role?.color} className="text-inherit" />
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setViewingReport(r)}
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
                        onClick={() => { setEditingReport(r); setModalOpen(true); }}
                        className="text-xs text-muted hover:text-text transition-colors"
                      >
                        Modifier
                      </button>
                    )}
                    {canDelete && (
                      <ConfirmDelete
                        action={deleteReport.bind(null, r.id)}
                        confirmMessage={`Êtes-vous sûr de vouloir supprimer le compte-rendu "${r.title}" ?`}
                        successMessage="Compte-rendu supprimé"
                      />
                    )}
                  </div>
                </div>
                <div className="text-sm text-text/80 mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                  {r.content}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingReport ? "Modifier le compte-rendu" : "Nouveau compte-rendu"}
        initialData={editingReport ? {
          title: editingReport.title,
          content: editingReport.content,
          meetingDate: new Date(editingReport.meetingDate).toISOString().split("T")[0] || "",
          imageUrl: editingReport.imageUrl,
        } : undefined}
        action={editingReport ? updateReport.bind(null, editingReport.id) : createReport}
      />

      <ViewModal
        open={!!viewingReport}
        onOpenChange={(v) => { if (!v) setViewingReport(null); }}
        title={viewingReport?.title ?? ""}
        content={viewingReport?.content ?? ""}
        imageUrl={viewingReport?.imageUrl}
        metadata={viewingReport ? `Réunion du ${new Date(viewingReport.meetingDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} · Rédigé par ${viewingReport.createdByName ?? "—"}` : undefined}
      />
    </div>
  );
}
