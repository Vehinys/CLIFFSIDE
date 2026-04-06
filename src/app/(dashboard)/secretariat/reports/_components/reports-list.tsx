"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { deleteReport, createReport, updateReport } from "../../_actions";
import { ReportModal } from "./report-modal";

interface Report {
  id: string;
  title: string;
  content: string;
  meetingDate: Date;
  imageUrl: string | null;
  createdByName: string | null;
}

interface Props {
  reports: Report[];
  canWrite: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function ReportsList({ reports, canEdit, canDelete }: Omit<Props, "canWrite">) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    const handler = () => { setEditingReport(null); setModalOpen(true); };
    window.addEventListener("reports:create", handler);
    return () => window.removeEventListener("reports:create", handler);
  }, []);

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
                    <p className="text-xs text-muted mt-0.5">Rédigé par {r.createdByName ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
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
    </div>
  );
}
