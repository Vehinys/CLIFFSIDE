"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useCallback } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterParam?: string;
}

export function TableFilters({
  searchPlaceholder = "Rechercher…",
  filterOptions,
  filterParam = "type",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      // Preserve tab param if present
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams]
  );

  const activeFilter = searchParams.get(filterParam) ?? "";
  const searchValue = searchParams.get("search") ?? "";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-40">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
        >
          <circle cx="6" cy="6" r="4.5" />
          <path d="M9.5 9.5L13 13" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          defaultValue={searchValue}
          onChange={(e) => update("search", e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-9 rounded-md border border-border bg-surface-2 pl-8 pr-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          aria-label={searchPlaceholder}
        />
      </div>

      {filterOptions && filterOptions.length > 0 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => update(filterParam, "")}
            className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors cursor-pointer ${
              !activeFilter
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-2 text-muted hover:text-text hover:border-border/80"
            }`}
          >
            Tout
          </button>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update(filterParam, opt.value)}
              className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface-2 text-muted hover:text-text hover:border-border/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
