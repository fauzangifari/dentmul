"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Opsi } from "@/features/skrining/constants";

/** Blok pertanyaan: label (+ tanda wajib), petunjuk, isi, dan pesan error. */
export function Question({
  label,
  required,
  hint,
  error,
  labelId,
  htmlFor,
  className,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  /** id label — dipakai `aria-labelledby` pada grup chip. */
  labelId?: string;
  /** id input — bila pertanyaan berisi input tunggal. */
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const LabelTag = htmlFor ? "label" : "span";
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="space-y-1">
        <LabelTag
          id={labelId}
          htmlFor={htmlFor}
          className="block text-[15px] font-semibold text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </LabelTag>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const chipBase =
  "min-h-11 border-[1.5px] px-4 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

function chipClass(selected: boolean, shape: "pill" | "tile", invalid?: boolean) {
  return cn(
    chipBase,
    shape === "pill" ? "rounded-full" : "rounded-xl text-left",
    selected
      ? "border-primary bg-accent font-semibold text-accent-foreground"
      : cn(
          "bg-card font-medium text-foreground/80 hover:border-primary/50 hover:bg-accent/40",
          invalid ? "border-destructive/60" : "border-input"
        )
  );
}

type GroupLayout = "wrap" | "grid-2" | "grid-3" | "stack";

const layoutClass: Record<GroupLayout, string> = {
  wrap: "flex flex-wrap gap-2",
  "grid-2": "grid grid-cols-1 gap-2 sm:grid-cols-2",
  "grid-3": "grid grid-cols-2 gap-2 sm:grid-cols-3",
  stack: "flex flex-col gap-2",
};

type BaseProps = {
  options: readonly Opsi[];
  labelledBy?: string;
  ariaLabel?: string;
  layout?: GroupLayout;
  shape?: "pill" | "tile";
  invalid?: boolean;
  className?: string;
};

const ARAH_PANAH: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * Semantik radio untuk pilihan tunggal berbentuk tombol: `role="radio"` +
 * `aria-checked`, satu tab stop per grup (roving tabindex), dan tombol panah
 * untuk pindah sekaligus memilih — seperti radio bawaan browser.
 */
export function useRadioGroup<V extends string>(
  values: readonly V[],
  value: V | null | undefined,
  onSelect: (value: V) => void
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checked = value == null ? -1 : values.indexOf(value);
  const tabStop = checked >= 0 ? checked : 0;

  return (i: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    role: "radio" as const,
    "aria-checked": i === checked,
    tabIndex: i === tabStop ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const arah = ARAH_PANAH[e.key];
      if (!arah) return;
      e.preventDefault();
      const next = (i + arah + values.length) % values.length;
      refs.current[next]?.focus();
      onSelect(values[next]);
    },
  });
}

/** Pilihan tunggal. Klik ulang pilihan aktif untuk membatalkan bila `allowDeselect`. */
export function ChipGroup<V extends string>({
  options,
  value,
  onChange,
  allowDeselect = true,
  labelledBy,
  ariaLabel,
  layout = "wrap",
  shape = "pill",
  invalid,
  className,
}: BaseProps & {
  value: V | undefined | null;
  onChange: (value: V | undefined) => void;
  allowDeselect?: boolean;
}) {
  const radio = useRadioGroup(
    options.map((o) => o.value as V),
    value,
    onChange
  );
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn(layoutClass[layout], className)}
    >
      {options.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            {...radio(i)}
            onClick={() =>
              onChange(selected && allowDeselect ? undefined : (o.value as V))
            }
            className={chipClass(selected, shape, invalid)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Pilihan ganda. Opsi di `exclusive` (mis. "Tidak ada") membatalkan opsi lain,
 * dan memilih opsi lain membatalkan opsi eksklusif.
 */
export function ChipMultiGroup<V extends string>({
  options,
  value,
  onChange,
  exclusive = [],
  labelledBy,
  ariaLabel,
  layout = "wrap",
  shape = "pill",
  invalid,
  className,
}: BaseProps & {
  value: readonly V[] | undefined;
  onChange: (value: V[]) => void;
  exclusive?: readonly string[];
}) {
  const current = value ?? [];

  const toggle = (v: V) => {
    if (current.includes(v)) {
      onChange(current.filter((c) => c !== v));
    } else if (exclusive.includes(v)) {
      onChange([v]);
    } else {
      onChange([...current.filter((c) => !exclusive.includes(c)), v]);
    }
  };

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={cn(layoutClass[layout], className)}
    >
      {options.map((o) => {
        const selected = current.includes(o.value as V);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(o.value as V)}
            className={chipClass(selected, shape, invalid)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** id stabil untuk pasangan label ↔ grup. */
export function useQuestionId(prefix: string) {
  return `${prefix}-${useId()}`;
}
