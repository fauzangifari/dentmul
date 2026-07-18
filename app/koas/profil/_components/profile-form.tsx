"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { updateOwnKoasProfile } from "@/features/koas/actions";

type KoasProfileFormValues = {
  name: string;
  noTelepon: string;
};

type KoasProfileUser = {
  name: string;
  email: string;
  noTelepon: string;
};

export function KoasProfileForm({ user }: { user: KoasProfileUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KoasProfileFormValues>({
    defaultValues: {
      name: user.name,
      noTelepon: user.noTelepon,
    },
  });

  const onSubmit = (values: KoasProfileFormValues) => {
    startTransition(async () => {
      const result = await updateOwnKoasProfile(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Profil berhasil diperbarui!");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ===== Data identitas (read-only) ===== */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Data Identitas
          </h2>
          <Lock size={14} className="text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <ReadonlyRow label="Email" value={user.email} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Email tidak dapat diubah sendiri. Hubungi admin bila ada kesalahan
          data.
        </p>
      </section>

      {/* ===== Data yang bisa diubah ===== */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          Data yang Bisa Diubah
        </h2>

        <Field label="Nama Lengkap" error={errors.name?.message}>
          <Input
            {...register("name", {
              required: "Nama wajib diisi",
              minLength: { value: 3, message: "Nama minimal 3 karakter" },
            })}
            placeholder="Nama lengkap Anda"
            disabled={isPending}
          />
        </Field>

        <Field label="No Telepon" error={errors.noTelepon?.message}>
          <Input
            {...register("noTelepon", {
              required: "Nomor telepon wajib diisi",
              minLength: { value: 10, message: "Nomor telepon minimal 10 digit" },
              maxLength: { value: 15, message: "Nomor telepon maksimal 15 digit" },
              pattern: {
                value: /^\+?[0-9]+$/,
                message: "Nomor telepon hanya boleh angka (boleh diawali +)",
              },
            })}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            disabled={isPending}
          />
        </Field>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 size={16} className="mr-1 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
