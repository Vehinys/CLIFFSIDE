"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { UserPseudo } from "@/components/ui/user-pseudo";
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
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdByName: string | null;
  createdBy?: { role?: { color: string } | null } | null;
  assignedTo?: { role?: { color: string } | null } | null;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  tasks: Task[];
  members: Member[];
  canEdit: boolean;
  canDelete: boolean;
}

export function TasksList({ tasks, members, canEdit, canDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
                      className="border border-border/50 rounded-lg p-3 bg-surface-2/40 hover:border-primary/30 transition-all group flex flex-col gap-2"
                    >
                      <button 
                        onClick={() => handleEdit(t)}
                        className="font-medium text-sm text-text text-left hover:text-primary transition-colors line-clamp-2"
                      >
                        {t.title}
                      </button>
                      
                      {t.description && (
                        <p className="text-xs text-muted line-clamp-3 whitespace-pre-wrap">
                          {t.description}
                        </p>
                      )}
                      
                      {t.assignedToName && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                          <p className="text-[10px] uppercase font-bold tracking-wider text-muted">
                            Assigné à : <UserPseudo name={t.assignedToName} color={t.assignedTo?.role?.color} className="text-inherit" />
                          </p>
                        </div>
                      )}
                      
                      <p className="text-[9px] text-muted/60 absolute bottom-1 right-2 group-hover:block transition-all">
                        Par <UserPseudo name={t.createdByName} color={t.createdBy?.role?.color} className="text-inherit" />
                      </p>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
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
        title={editingTask ? "Détails de la tâche" : "Nouvelle tâche"}
        members={members}
        initialData={editingTask ? {
          title: editingTask.title,
          description: editingTask.description,
          assignedToId: editingTask.assignedToId,
          status: editingTask.status,
        } : undefined}
        action={editingTask ? updateTask.bind(null, editingTask.id) : createTask}
      />
    </div>
  );
}
