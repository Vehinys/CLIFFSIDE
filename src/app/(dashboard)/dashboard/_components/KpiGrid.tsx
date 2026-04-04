import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

interface Props {
  memberCount: number | null;
  itemCount: number | null;
  currentBalance: number | null;
}

export function KpiGrid({ memberCount, itemCount, currentBalance }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {memberCount !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Comptes inscrits</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-text">{memberCount}</p>
        </Card>
      )}
      {itemCount !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Articles inventaire</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-text">{itemCount}</p>
        </Card>
      )}
      {currentBalance !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Solde trésorerie</CardTitle>
          </CardHeader>
          <p className={`text-3xl font-bold ${currentBalance >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(currentBalance)}
          </p>
        </Card>
      )}
    </div>
  );
}
