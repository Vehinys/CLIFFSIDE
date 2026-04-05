"use client";

interface Column<T> {
  header: string;
  accessor: (row: T) => string | number;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  filename?: string;
}

export function CsvExport<T>({ data, columns, filename = "export" }: Props<T>) {
  function download() {
    const header = columns.map((c) => `"${c.header}"`).join(";");
    const rows = data.map((row) =>
      columns.map((c) => `"${String(c.accessor(row)).replace(/"/g, '""')}"`).join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-1.5 h-9 rounded-md border border-border bg-surface-2 px-3 text-xs font-medium text-muted hover:text-text hover:border-border/80 transition-colors cursor-pointer"
      aria-label="Exporter en CSV"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M6 1v7M3 5l3 3 3-3" />
        <path d="M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" />
      </svg>
      CSV
    </button>
  );
}
