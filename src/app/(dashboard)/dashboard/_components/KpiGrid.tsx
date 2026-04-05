import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

interface Props {
  memberCount: number | null;
  itemCount: number | null;
  currentBalance: number | null;
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="7" cy="5.5" r="3" />
      <path d="M1 16c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="14" cy="5.5" r="2.5" />
      <path d="M14 11c2 0 3.5 1.5 3.5 3.5" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1.5 5.5L9 1.5l7.5 4v7L9 16.5l-7.5-4v-7z" />
      <path d="M1.5 5.5L9 9.5l7.5-4" />
      <line x1="9" y1="9.5" x2="9" y2="16.5" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1" y="4" width="16" height="12" rx="1.5" />
      <path d="M1 8h16" />
      <circle cx="13.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  href: string;
  accentColor?: string;
}

function KpiCard({ title, value, icon, href, accentColor = "bg-primary" }: KpiCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="relative overflow-hidden transition-colors duration-150 hover:border-border group-hover:bg-surface-2/50 cursor-pointer">
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentColor} opacity-40 group-hover:opacity-80 transition-opacity duration-150`} />
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
          <span className="text-muted/40 group-hover:text-muted/70 transition-colors duration-150">{icon}</span>
        </div>
        <p className="text-3xl font-bold font-mono text-text">{value}</p>
        <p className="mt-3 flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors duration-150">
          Voir détails <IconChevron />
        </p>
      </Card>
    </Link>
  );
}

export function KpiGrid({ memberCount, itemCount, currentBalance }: Props) {
  const balanceColor =
    currentBalance === null
      ? "text-text"
      : currentBalance >= 0
      ? "text-success"
      : "text-danger";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {memberCount !== null && (
        <KpiCard
          title="Comptes inscrits"
          value={memberCount}
          icon={<IconUsers />}
          href="/members"
          accentColor="bg-primary"
        />
      )}
      {itemCount !== null && (
        <KpiCard
          title="Articles inventaire"
          value={itemCount}
          icon={<IconBox />}
          href="/inventory"
          accentColor="bg-warning"
        />
      )}
      {currentBalance !== null && (
        <Link href="/treasury" className="block group">
          <Card className="relative overflow-hidden transition-colors duration-150 hover:border-border group-hover:bg-surface-2/50 cursor-pointer">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 opacity-40 group-hover:opacity-80 transition-opacity duration-150 ${currentBalance >= 0 ? "bg-success" : "bg-danger"}`} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Solde trésorerie</p>
              <span className="text-muted/40 group-hover:text-muted/70 transition-colors duration-150"><IconWallet /></span>
            </div>
            <p className={`text-3xl font-bold font-mono ${balanceColor}`}>{formatMoney(currentBalance)}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors duration-150">
              Voir détails <IconChevron />
            </p>
          </Card>
        </Link>
      )}
    </div>
  );
}
