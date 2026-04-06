import Link from "next/link";
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

function IconWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M7 1L13 12H1L7 1z" />
      <line x1="7" y1="5.5" x2="7" y2="8" />
      <circle cx="7" cy="10" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconArrow({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      {up
        ? <path d="M6 10V2m-3 3l3-3 3 3" />
        : <path d="M6 2v8m-3-3l3 3 3-3" />
      }
    </svg>
  );
}

function StockBar({ quantity, minStock }: { quantity: number; minStock: number }) {
  const ratio = Math.min(quantity / minStock, 1);
  const pct = Math.round(ratio * 100);
  return (
    <div
      className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden"
      role="progressbar"
      aria-valuenow={quantity}
      aria-valuemin={0}
      aria-valuemax={minStock}
      aria-label={`${quantity} sur ${minStock} minimum`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${pct <= 30 ? "bg-danger" : pct <= 60 ? "bg-warning" : "bg-success"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function RecentActivity({ transactions, lowStockItems }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dernières transactions</span>
              <Link href="/treasury" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          <ul className="space-y-1">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-surface-2 transition-colors duration-150 -mx-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`shrink-0 ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                    <IconArrow up={t.type === "INCOME"} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm text-text truncate block">{t.description}</span>
                    <span className="text-xs text-muted">{formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <span className={`ml-4 shrink-0 text-sm font-mono font-semibold ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{formatMoney(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-warning"><IconWarning /></span>
                Stock bas
              </span>
              <Link href="/inventory" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          <ul className="space-y-1">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-surface-2 transition-colors duration-150 -mx-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StockBar quantity={item.quantity} minStock={item.minStock!} />
                  <div className="min-w-0">
                    <span className="text-sm text-text truncate block">{item.name}</span>
                    <Badge variant="warning" className="mt-0.5">{item.category.name}</Badge>
                  </div>
                </div>
                <span className="ml-4 shrink-0 text-sm font-mono font-semibold text-danger">
                  {item.quantity} <span className="text-muted font-normal">/ {item.minStock}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
