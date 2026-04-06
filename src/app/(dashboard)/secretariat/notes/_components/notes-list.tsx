"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { deleteNote, createNote, updateNote } from "../../_actions";
import { NoteModal } from "./note-modal";
import { UserPseudo } from "@/components/ui/user-pseudo";

interface Note {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  updatedAt: Date;
  createdByName: string | null;
  createdBy?: {
    role?: {
      color: string;
    } | null;
  } | null;
}

interface Props {
  notes: Note[];
  canWrite: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function NotesList({ notes, canEdit, canDelete }: Omit<Props, "canWrite">) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = () => { setEditingNote(null); setModalOpen(true); };
    window.addEventListener("notes:create", handler);
    return () => window.removeEventListener("notes:create", handler);
  }, []);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {notes.map((n) => (
          <Card key={n.id} className="flex flex-col group hover:border-primary/30 transition-all">
            <div className="flex items-start gap-4 flex-1">
              {n.imageUrl && (
                <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center p-1.5 mt-1">
                  <Image
                    src={n.imageUrl}
                    alt=""
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text group-hover:text-primary transition-colors">{n.title}</h2>
                <p className="text-xs text-muted mt-0.5">
                  <UserPseudo name={n.createdByName} color={n.createdBy?.role?.color} className="text-inherit" /> · modifié le {new Date(n.updatedAt).toLocaleDateString("fr-FR")}
                </p>
                <div className="text-sm text-text/80 mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                  {n.content}
                </div>
              </div>
            </div>
            {(canEdit || canDelete) && (
              <div className="flex gap-3 mt-4 pt-3 border-t border-border/50">
                {canEdit && (
                  <button 
                    onClick={() => handleEdit(n)}
                    className="text-xs text-muted hover:text-text transition-colors"
                  >
                    Modifier
                  </button>
                )}
                {canDelete && (
                  <ConfirmDelete
                    action={deleteNote.bind(null, n.id)}
                    confirmMessage={`Supprimer la note "${n.title}" ?`}
                    successMessage="Note supprimée"
                  />
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <NoteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingNote ? "Modifier la note" : "Nouvelle note"}
        initialData={editingNote ? {
          title: editingNote.title,
          content: editingNote.content,
          imageUrl: editingNote.imageUrl,
        } : undefined}
        action={editingNote ? updateNote.bind(null, editingNote.id) : createNote}
      />
    </div>
  );
}
