"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterChip = {
  id: string;
  /** Filter name / title. When `value` is set, rendered with stronger contrast. */
  label: React.ReactNode;
  /** Optional value shown after the title (e.g. "Active"). */
  value?: React.ReactNode;
};

type FilterChipsProps = {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onResetAll?: () => void;
  className?: string;
};

function FilterChips({
  filters,
  onRemove,
  onResetAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div
      data-slot="filter-chips"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <span data-slot="filter-chips-summary">
        {filters.length} active filter{filters.length === 1 ? "" : "s"}
      </span>
      {filters.map((filter) => {
        const removeLabel =
          typeof filter.label === "string"
            ? filter.value != null
              ? `${filter.label}: ${String(filter.value)}`
              : filter.label
            : "filter";

        return (
          <Badge
            key={filter.id}
            variant="secondary"
            data-slot="filter-chip"
            className="gap-1 rounded-sm pr-0.5 font-normal"
          >
            <span
              data-slot="filter-chip-content"
              className="inline-flex min-w-0 items-center gap-1"
            >
              {filter.value != null ? (
                <>
                  <span data-slot="filter-chip-key">{filter.label}</span>
                  <span data-slot="filter-chip-sep" aria-hidden>
                    :
                  </span>
                  <span data-slot="filter-chip-value">{filter.value}</span>
                </>
              ) : (
                <span data-slot="filter-chip-value">{filter.label}</span>
              )}
            </span>
            <button
              type="button"
              data-slot="filter-chip-remove"
              aria-label={`Remove ${removeLabel}`}
              onClick={() => onRemove(filter.id)}
            >
              <X aria-hidden className="size-3" />
            </button>
          </Badge>
        );
      })}
      {onResetAll ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          data-slot="filter-chips-reset"
          className="h-auto p-0"
          onClick={onResetAll}
        >
          Reset all
        </Button>
      ) : null}
    </div>
  );
}

export { FilterChips };
export type { FilterChipsProps, FilterChip };
