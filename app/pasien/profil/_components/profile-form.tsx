"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Lock } from "lucide-react";
import { updateOwnProfile } from "@/features/pasien/actions";

const JENIS_KELAMIN_OPTIONS = [
  { value: "LAKI_LAKI", label: "Laki-laki" },
  { value: "PEREMPUAN", label: "Perempuan" },
] as const;

type ProfileFormValues = {
  noTelepon: string;
  tanggalLahir: string;
  alamat: string;
  jenisKelamin: "" | "LAKI_LAKI" | "PEREMPUAN";
};

type ProfileUser = {
  name: string;
  email: string;
  nik: string | null;
  noTelepon: string;
  tanggalLahir: string;
  alamat: string;
  jenisKelamin: "" | "LAKI_LAKI" | "PEREMPUAN";
};

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      noTelepon: user.noTelepon,
      tanggalLahir: user.tanggalLahir,
      alamat: user.alamat,
      jenisKelamin: user.jenisKelamin,
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateOwnProfile(values);
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
          <ReadonlyRow label="Nama Lengkap" value={user.name} />
          <ReadonlyRow label="Email" value={user.email} />
          <ReadonlyRow label="NIK" value={user.nik ?? "—"} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Nama, email, dan NIK tidak dapat diubah sendiri. Hubungi admin bila ada
          kesalahan data.
        </p>
      </section>

      {/* ===== Data yang bisa diubah ===== */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          Data yang Bisa Diubah
        </h2>

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

        <Field label="Tanggal Lahir" error={errors.tanggalLahir?.message}>
          <Input
            {...register("tanggalLahir", {
              required: "Tanggal lahir wajib diisi",
            })}
            type="date"
            disabled={isPending}
          />
        </Field>

        <Field label="Jenis Kelamin">
          <Controller
            control={control}
            name="jenisKelamin"
            render={({ field }) => (
              <Select
                value={field.value || null}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_KELAMIN_OPTIONS.map((j) => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Alamat" error={errors.alamat?.message}>
          <textarea
            {...register("alamat", {
              required: "Alamat wajib diisi",
              minLength: { value: 5, message: "Alamat terlalu pendek" },
            })}
            className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
            placeholder="Alamat tempat tinggal saat ini"
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
