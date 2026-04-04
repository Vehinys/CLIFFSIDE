import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";

type Transaction = Prisma.TreasuryTransactionGetPayload<object>;
type LowStockItem = Prisma.InventoryItemGetPayload<{ include: { category: true } }>;

interface Props {
  transactions: Transaction[];
  lowStockItems: LowStockItem[];
}

export function RecentActivity({ transactions, lowStockItems }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {transactions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Dernières transactions</CardTitle></CardHeader>
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-text">{t.description}</span>
                  <span className="ml-2 text-xs text-muted">{formatDate(t.createdAt)}</span>
                </div>
                <span className={t.type === "INCOME" ? "text-success font-medium" : "text-danger font-medium"}>
                  {t.type === "INCOME" ? "+" : "-"}{formatMoney(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>⚠ Stock bas</CardTitle></CardHeader>
          <ul className="space-y-2">
            {lowStockItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-text">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{item.category.name}</Badge>
                  <span className="text-danger font-medium">{item.quantity} / {item.minStock}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
