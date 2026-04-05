import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createObjective, toggleObjectiveDone, deleteObjective } from "../_actions";

type Objective = {
  id: string;
  content: string;
  done: boolean;
};

interface Props {
  todayObjectives: Objective[];
  tomorrowObjectives: Objective[];
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function IconDelete() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M2 2l8 8M10 2L2 10" />
    </svg>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${done} sur ${total} objectifs complétés`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-success" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted flex-shrink-0">{done}/{total}</span>
    </div>
  );
}

interface ObjectiveListProps {
  objectives: Objective[];
  canUpdate: boolean;
  canDelete: boolean;
  day: "today" | "tomorrow";
  canWrite: boolean;
  placeholder: string;
}

function ObjectiveList({ objectives, canUpdate, canDelete, day, canWrite, placeholder }: ObjectiveListProps) {
  const doneCount = objectives.filter((o) => o.done).length;

  return (
    <>
      <ProgressBar done={doneCount} total={objectives.length} />

      {objectives.length === 0 ? (
        <p className="text-sm text-muted italic mb-3">Aucun objectif{day === "today" ? " pour aujourd\u2019hui" : " pour demain"}.</p>
      ) : (
        <ul className="space-y-1 mb-3">
          {objectives.map((obj) => (
            <li key={obj.id} className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-surface-2 transition-colors duration-150 -mx-1.5 group">
              {canUpdate ? (
                <form action={toggleObjectiveDone.bind(null, obj.id, !obj.done)}>
                  <button
                    type="submit"
                    className={`w-4 h-4 rounded border flex-shrink-0 transition-colors cursor-pointer ${
                      obj.done ? "bg-success border-success" : "border-border hover:border-primary"
                    }`}
                    aria-label={obj.done ? "Marquer non fait" : "Marquer fait"}
                  />
                </form>
              ) : (
                <span className={`w-4 h-4 rounded border flex-shrink-0 ${obj.done ? "bg-success border-success" : "border-border"}`} />
              )}
              <span className={`text-sm flex-1 ${obj.done ? "line-through text-muted" : "text-text"}`}>
                {obj.content}
              </span>
              {canDelete && (
                <form action={deleteObjective.bind(null, obj.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="submit"
                    className="cursor-pointer text-muted hover:text-danger transition-colors p-0.5 rounded"
                    aria-label="Supprimer l'objectif"
                  >
                    <IconDelete />
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {canWrite && (
        <form action={createObjective} className="flex gap-2 mt-1">
          <input type="hidden" name="day" value={day} />
          <Input name="content" placeholder={placeholder} className="h-8 text-xs" required />
          <Button type="submit" size="sm" className="flex-shrink-0">Ajouter</Button>
        </form>
      )}
    </>
  );
}

export function ObjectivesSection({
  todayObjectives,
  tomorrowObjectives,
  canWrite,
  canUpdate,
  canDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Objectifs du jour
          </CardTitle>
        </CardHeader>
        <ObjectiveList
          objectives={todayObjectives}
          canUpdate={canUpdate}
          canDelete={canDelete}
          day="today"
          canWrite={canWrite}
          placeholder="Nouvel objectif…"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Objectifs de demain
          </CardTitle>
        </CardHeader>
        <ObjectiveList
          objectives={tomorrowObjectives}
          canUpdate={canUpdate}
          canDelete={canDelete}
          day="tomorrow"
          canWrite={canWrite}
          placeholder="Objectif pour demain…"
        />
      </Card>
    </div>
  );
}
