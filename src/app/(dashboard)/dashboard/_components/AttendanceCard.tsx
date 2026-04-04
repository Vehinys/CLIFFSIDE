import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { respondAttendance } from "../_actions";

type Attendance = {
  id: string;
  userId: string;
  userName: string | null;
  status: string;
};

interface Props {
  currentUserId: string;
  attendances: Attendance[];
}

export function AttendanceCard({ currentUserId, attendances }: Props) {
  const myAttendance = attendances.find((a) => a.userId === currentUserId);
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;

  return (
    <Card className={myAttendance ? "border-border" : "border-warning/60 bg-warning/5"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Présence ce soir — 21h00</span>
          {myAttendance && (
            <Badge variant={myAttendance.status === "PRESENT" ? "success" : "danger"}>
              {myAttendance.status === "PRESENT" ? "Présent" : "Absent"}
            </Badge>
          )}
          <span className="ml-auto text-xs font-normal text-muted">
            {presentCount} présent{presentCount !== 1 ? "s" : ""} · {absentCount} absent{absentCount !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>

      {!myAttendance && (
        <div className="mb-4 flex items-center gap-3">
          <p className="text-sm text-muted">Seras-tu là ce soir à 21h ?</p>
          <form action={respondAttendance.bind(null, "PRESENT")}>
            <Button type="submit" variant="secondary" className="border-success/40 text-success hover:bg-success/10">
              ✓ Présent
            </Button>
          </form>
          <form action={respondAttendance.bind(null, "ABSENT")}>
            <Button type="submit" variant="secondary" className="border-danger/40 text-danger hover:bg-danger/10">
              ✗ Absent
            </Button>
          </form>
        </div>
      )}

      {myAttendance && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted">
          <span>Changer ma réponse :</span>
          {myAttendance.status !== "PRESENT" && (
            <form action={respondAttendance.bind(null, "PRESENT")}>
              <button type="submit" className="text-success hover:underline text-xs">Présent</button>
            </form>
          )}
          {myAttendance.status !== "ABSENT" && (
            <form action={respondAttendance.bind(null, "ABSENT")}>
              <button type="submit" className="text-danger hover:underline text-xs">Absent</button>
            </form>
          )}
        </div>
      )}

      {attendances.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attendances.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 bg-surface-2 border border-border/50"
            >
              <span className={a.status === "PRESENT" ? "text-success" : "text-danger"}>
                {a.status === "PRESENT" ? "✓" : "✗"}
              </span>
              <span className="text-text">{a.userName ?? a.userId}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
