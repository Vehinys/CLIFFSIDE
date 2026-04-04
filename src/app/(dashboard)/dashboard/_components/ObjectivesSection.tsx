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

export function ObjectivesSection({
  todayObjectives,
  tomorrowObjectives,
  canWrite,
  canUpdate,
  canDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Aujourd'hui */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Objectifs du jour
            <span className="ml-auto text-xs font-normal text-muted">
              {todayObjectives.filter((o) => o.done).length}/{todayObjectives.length}
            </span>
          </CardTitle>
        </CardHeader>
        {todayObjectives.length === 0 ? (
          <p className="text-sm text-muted italic mb-3">Aucun objectif pour aujourd&apos;hui.</p>
        ) : (
          <ul className="space-y-1.5 mb-3">
            {todayObjectives.map((obj) => (
              <li key={obj.id} className="flex items-center gap-2 text-sm">
                {canUpdate ? (
                  <form action={toggleObjectiveDone.bind(null, obj.id, !obj.done)}>
                    <button
                      type="submit"
                      className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
                        obj.done ? "bg-success border-success" : "border-border hover:border-primary"
                      }`}
                      aria-label={obj.done ? "Marquer non fait" : "Marquer fait"}
                    />
                  </form>
                ) : (
                  <span className={`w-4 h-4 rounded border flex-shrink-0 ${obj.done ? "bg-success border-success" : "border-border"}`} />
                )}
                <span className={obj.done ? "line-through text-muted" : "text-text"}>{obj.content}</span>
                {canDelete && (
                  <form action={deleteObjective.bind(null, obj.id)} className="ml-auto">
                    <button type="submit" className="text-muted hover:text-danger text-xs" aria-label="Supprimer">✕</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {canWrite && (
          <form action={createObjective} className="flex gap-2 mt-1">
            <input type="hidden" name="day" value="today" />
            <Input name="content" placeholder="Nouvel objectif…" className="h-8 text-xs" required />
            <Button type="submit" className="h-8 text-xs px-3 flex-shrink-0">Ajouter</Button>
          </form>
        )}
      </Card>

      {/* Demain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Objectifs de demain
            <span className="ml-auto text-xs font-normal text-muted">
              {tomorrowObjectives.filter((o) => o.done).length}/{tomorrowObjectives.length}
            </span>
          </CardTitle>
        </CardHeader>
        {tomorrowObjectives.length === 0 ? (
          <p className="text-sm text-muted italic mb-3">Aucun objectif pour demain.</p>
        ) : (
          <ul className="space-y-1.5 mb-3">
            {tomorrowObjectives.map((obj) => (
              <li key={obj.id} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded border flex-shrink-0 ${obj.done ? "bg-success border-success" : "border-border"}`} />
                <span className="text-text">{obj.content}</span>
                {canDelete && (
                  <form action={deleteObjective.bind(null, obj.id)} className="ml-auto">
                    <button type="submit" className="text-muted hover:text-danger text-xs" aria-label="Supprimer">✕</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {canWrite && (
          <form action={createObjective} className="flex gap-2 mt-1">
            <input type="hidden" name="day" value="tomorrow" />
            <Input name="content" placeholder="Objectif pour demain…" className="h-8 text-xs" required />
            <Button type="submit" className="h-8 text-xs px-3 flex-shrink-0">Ajouter</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
