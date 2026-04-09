"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { UserPseudo } from "@/components/ui/user-pseudo";
import { ViewModal } from "@/components/ui/view-modal";
import { updateTaskStatus, deleteTask, createTask, updateTask } from "../../_actions";
import { TaskModal } from "./task-modal";

const STATUS_META = {
  TODO:        { label: "À faire",  variant: "default"  as const },
  IN_PROGRESS: { label: "En cours", variant: "warning"  as const },
  DONE:        { label: "Terminé",  variant: "success"  as const },
};

const NEXT_STATUS: Record<"TODO" | "IN_PROGRESS" | "DONE", "TODO" | "IN_PROGRESS" | "DONE"> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedRoleId: string | null;
  assignedRoleName: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdByName: string | null;
  createdBy?: { role?: { color: string } | null } | null;
  assignedTo?: { role?: { color: string } | null } | null;
  assignedRole?: { color: string } | null;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

interface Props {
  tasks: Task[];
  members: Member[];
  roles: Role[];
  canEdit: boolean;
  canDelete: boolean;
}

export function TasksList({ tasks, members, roles, canEdit, canDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  useEffect(() => {
    const handler = () => { setEditingTask(null); setModalOpen(true); };
    window.addEventListener("tasks:create", handler);
    return () => window.removeEventListener("tasks:create", handler);
  }, []);

  const grouped = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
          <Card key={status} className="bg-surface/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Badge variant={STATUS_META[status].variant}>{STATUS_META[status].label}</Badge>
                <span className="text-muted font-normal">({grouped[status].length})</span>
              </CardTitle>
            </CardHeader>
            <div className="p-2 pt-0 h-full">
              {grouped[status].length === 0 ? (
                <p className="text-xs text-muted italic p-2">Aucune tâche.</p>
              ) : (
                <ul className="space-y-3">
                  {grouped[status].map((t) => (
                    <li
                      key={t.id}
                      className="border border-border/50 rounded-lg p-3 bg-surface-2/40 hover:border-primary/30 transition-all group flex flex-col gap-2 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="font-medium text-sm text-text text-left hover:text-primary transition-colors line-clamp-2 flex-1"
                        >
                          {t.title}
                        </button>
                        <button
                          onClick={() => setViewingTask(t)}
                          className="text-muted hover:text-primary transition-colors p-0.5 shrink-0"
                          aria-label="Tout lire"
                          title="Tout lire"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>

                      {t.description && (
                        <p className="text-xs text-muted line-clamp-3 whitespace-pre-wrap">
                          {t.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-1 mt-1">
                        {t.assignedToName && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted">
                              Personne : <UserPseudo name={t.assignedToName} color={t.assignedTo?.role?.color} className="text-inherit" />
                            </p>
                          </div>
                        )}
                        {t.assignedRoleName && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning/60 shrink-0" />
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted">
                              Rôle : <span style={t.assignedRole?.color ? { color: t.assignedRole.color } : {}}>{t.assignedRoleName}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-[9px] text-muted/60 text-right">
                        Par <UserPseudo name={t.createdByName} color={t.createdBy?.role?.color} className="text-inherit" />
                      </p>

                      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border/30">
                        {canEdit && status !== "DONE" && (
                          <form action={async () => { await updateTaskStatus(t.id, NEXT_STATUS[status]); }}>
                            <button type="submit" className="text-xs text-primary hover:underline font-medium">
                              {status === "TODO" ? "Démarrer →" : "Terminer →"}
                            </button>
                          </form>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(t)}
                              className="text-xs text-muted hover:text-text transition-colors"
                            >
                              Modifier
                            </button>
                          )}
                          {canDelete && (
                            <ConfirmDelete
                              action={deleteTask.bind(null, t.id)}
                              confirmMessage={`Supprimer la tâche "${t.title}" ?`}
                              successMessage="Tâche supprimée"
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
        members={members}
        roles={roles}
        initialData={editingTask ? {
          title: editingTask.title,
          description: editingTask.description,
          assignedToId: editingTask.assignedToId,
          assignedRoleId: editingTask.assignedRoleId,
          status: editingTask.status,
        } : undefined}
        action={editingTask ? updateTask.bind(null, editingTask.id) : createTask}
      />

      {viewingTask && (
        <ViewModal
          open={!!viewingTask}
          onOpenChange={(v) => { if (!v) setViewingTask(null); }}
          title={viewingTask.title}
          content={viewingTask.description ?? "(Aucune description)"}
          metadata={[
            viewingTask.assignedToName && `Personne : ${viewingTask.assignedToName}`,
            viewingTask.assignedRoleName && `Rôle : ${viewingTask.assignedRoleName}`,
            `Par ${viewingTask.createdByName ?? "—"}`,
            STATUS_META[viewingTask.status].label,
          ].filter(Boolean).join(" · ")}
        />
      )}
    </div>
  );
}
