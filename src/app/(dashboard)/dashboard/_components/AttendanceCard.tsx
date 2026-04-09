import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { respondAttendance } from "../_actions";
import { UserPseudo } from "@/components/ui/user-pseudo";

type Attendance = {
  id: string;
  userId: string;
  userName: string | null;
  status: string;
  user?: {
    role?: {
      color: string;
    } | null;
  } | null;
};

interface Props {
  currentUserId: string;
  attendances: Attendance[];
}

function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 6l2.5 2.5L9 3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M2 2l6 6M8 2L2 8" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" />
      <path d="M6.5 3.5v3l2 1.5" />
    </svg>
  );
}

function IconClockSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="5" r="4" />
      <path d="M5 2.5v2.5l1.5 1" />
    </svg>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Présent",
  ABSENT: "Absent",
  LATE: "En retard",
};

export function AttendanceCard({ currentUserId, attendances }: Props) {
  const myAttendance = attendances.find((a) => a.userId === currentUserId);
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const lateCount = attendances.filter((a) => a.status === "LATE").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;

  return (
    <Card className={myAttendance ? "border-border" : "border-warning/50 bg-warning/5"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-muted"><IconClock /></span>
            Présence ce soir — 21h00
          </span>
          {myAttendance && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${
                myAttendance.status === "PRESENT"
                  ? "bg-success/10 text-success border-success/30"
                  : myAttendance.status === "LATE"
                  ? "bg-warning/10 text-warning border-warning/30"
                  : "bg-danger/10 text-danger border-danger/30"
              }`}
            >
              {myAttendance.status === "PRESENT" ? <IconCheck /> : myAttendance.status === "LATE" ? <IconClockSmall /> : <IconX />}
              {STATUS_LABELS[myAttendance.status] ?? myAttendance.status}
            </span>
          )}
          <span className="ml-auto text-xs font-normal text-muted whitespace-nowrap">
            <span className="text-success">{presentCount}</span>
            {" "}présent{presentCount !== 1 ? "s" : ""}
            {lateCount > 0 && (
              <> · <span className="text-warning">{lateCount}</span>{" "}en retard</>
            )}
            {" "}·{" "}
            <span className="text-danger">{absentCount}</span>
            {" "}absent{absentCount !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>

      {!myAttendance && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <p className="text-sm text-muted">Seras-tu là ce soir à 21h ?</p>
          <form action={respondAttendance.bind(null, "PRESENT")}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="border-success/40 text-success hover:bg-success/10 hover:border-success/60 gap-1.5"
            >
              <IconCheck />
              Présent
            </Button>
          </form>
          <form action={respondAttendance.bind(null, "LATE")}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="border-warning/40 text-warning hover:bg-warning/10 hover:border-warning/60 gap-1.5"
            >
              <IconClockSmall />
              En retard
            </Button>
          </form>
          <form action={respondAttendance.bind(null, "ABSENT")}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="border-danger/40 text-danger hover:bg-danger/10 hover:border-danger/60 gap-1.5"
            >
              <IconX />
              Absent
            </Button>
          </form>
        </div>
      )}

      {myAttendance && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted flex-wrap">
          <span>Changer ma réponse :</span>
          {myAttendance.status !== "PRESENT" && (
            <form action={respondAttendance.bind(null, "PRESENT")}>
              <button type="submit" className="cursor-pointer text-success hover:text-success/70 transition-colors">
                Présent
              </button>
            </form>
          )}
          {myAttendance.status !== "LATE" && (
            <form action={respondAttendance.bind(null, "LATE")}>
              <button type="submit" className="cursor-pointer text-warning hover:text-warning/70 transition-colors">
                En retard
              </button>
            </form>
          )}
          {myAttendance.status !== "ABSENT" && (
            <form action={respondAttendance.bind(null, "ABSENT")}>
              <button type="submit" className="cursor-pointer text-danger hover:text-danger/70 transition-colors">
                Absent
              </button>
            </form>
          )}
        </div>
      )}

      {attendances.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attendances.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-colors ${
                a.status === "PRESENT"
                  ? "bg-success/5 border-success/20 text-success/80"
                  : a.status === "LATE"
                  ? "bg-warning/5 border-warning/20 text-warning/80"
                  : "bg-danger/5 border-danger/20 text-danger/80"
              }`}
            >
              {a.status === "PRESENT" ? <IconCheck /> : a.status === "LATE" ? <IconClockSmall /> : <IconX />}
              <UserPseudo name={a.userName} color={a.user?.role?.color} className="text-inherit" fallback={a.userId} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
