"use client";

import { useCallback } from "react";
import {
  useFormContext,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";
import type { SkriningFormInput } from "@/features/skrining/schema";

type Path = FieldPath<SkriningFormInput>;

/**
 * Set nilai field dari kontrol non-native (chip, odontogram, slider). Validasi
 * ulang hanya bila field (atau `revalidate`) sedang error, supaya pesan error
 * hilang saat diperbaiki tanpa memunculkan error sebelum pasien menekan
 * "Selanjutnya".
 */
export function useFieldUpdate() {
  const { setValue, trigger, getFieldState, formState } =
    useFormContext<SkriningFormInput>();
  // Membaca `errors` mendaftarkan langganan formState agar getFieldState akurat.
  void formState.errors;

  return useCallback(
    (name: Path, value: unknown, revalidate: Path | Path[] = name) => {
      setValue(name, value as never, { shouldDirty: true });
      const targets = Array.isArray(revalidate) ? revalidate : [revalidate];
      if (targets.some((t) => getFieldState(t).invalid)) {
        void trigger(targets);
      }
    },
    [setValue, trigger, getFieldState]
  );
}

/**
 * `register` untuk input teks dengan perilaku yang sama: field yang sedang
 * error divalidasi ulang tiap diketik. Tanpa ini (mode `onTouched`) pesan
 * error baru hilang saat input kehilangan fokus — yaitu saat mouse ditekan
 * pada tombol di bawahnya, sehingga tombol bergeser dan kliknya meleset.
 */
export function useFieldRegister() {
  const { register, trigger, getFieldState, formState } =
    useFormContext<SkriningFormInput>();
  void formState.errors;

  return useCallback(
    <N extends Path>(name: N, options?: RegisterOptions<SkriningFormInput, N>) =>
      register(name, {
        ...options,
        onChange: (event: unknown) => {
          options?.onChange?.(event);
          if (getFieldState(name).invalid) void trigger(name);
        },
      } as RegisterOptions<SkriningFormInput, N>),
    [register, trigger, getFieldState]
  );
}
