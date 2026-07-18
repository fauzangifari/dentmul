"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { createUser, updateUser } from "@/features/admin/actions";
import { ROLE_OPTIONS, JENIS_KELAMIN_OPTIONS } from "@/features/admin/constants";
import type { AdminUserItem } from "@/features/admin/types";

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: "PASIEN" | "KOAS" | "DOSEN" | "ADMIN";
  isActive: boolean;
  nik: string;
  tanggalLahir: string;
  alamat: string;
  jenisKelamin: "" | "LAKI_LAKI" | "PEREMPUAN";
};

const EMPTY: UserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "PASIEN",
  isActive: true,
  nik: "",
  tanggalLahir: "",
  alamat: "",
  jenisKelamin: "",
};

function toDateInput(d: Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  user?: AdminUserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({ defaultValues: EMPTY });

  const role = watch("role");
  const isPasien = role === "PASIEN";

  // Sinkronkan nilai form setiap kali dialog dibuka.
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive,
        nik: user.nik ?? "",
        tanggalLahir: toDateInput(user.tanggalLahir),
        alamat: user.alamat ?? "",
        jenisKelamin: user.jenisKelamin ?? "",
      });
    } else {
      reset(EMPTY);
    }
  }, [open, mode, user, reset]);

  const onSubmit = (values: UserFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createUser(values)
          : await updateUser(user!.id, values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Berhasil disimpan.");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah User Baru" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat akun baru dan tentukan role-nya."
              : "Perbarui data akun user ini."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[62vh] space-y-4 overflow-y-auto px-1 py-1">
            <Field label="Nama Lengkap" error={errors.name?.message}>
              <Input
                {...register("name", { required: "Nama wajib diisi" })}
                placeholder="Nama lengkap"
                disabled={isPending}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <Input
                {...register("email", { required: "Email wajib diisi" })}
                type="email"
                placeholder="nama@email.com"
                disabled={isPending}
                autoComplete="off"
              />
            </Field>

            {mode === "create" && (
              <Field label="Password" error={errors.password?.message}>
                <Input
                  {...register("password", {
                    required: "Password wajib diisi",
                    minLength: { value: 6, message: "Password minimal 6 karakter" },
                  })}
                  type="password"
                  placeholder="Minimal 6 karakter"
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </Field>
            )}

            <Field label="Role">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {isPasien && (
              <>
                <Field label="NIK" error={errors.nik?.message}>
                  <Input
                    {...register("nik")}
                    inputMode="numeric"
                    placeholder="16 digit NIK"
                    disabled={isPending}
                  />
                </Field>

                <Field label="Tanggal Lahir" error={errors.tanggalLahir?.message}>
                  <Input
                    {...register("tanggalLahir")}
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
                    {...register("alamat")}
                    className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                    placeholder="Alamat tempat tinggal"
                    disabled={isPending}
                  />
                </Field>
              </>
            )}

            {mode === "edit" && (
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                    <div className="min-w-0">
                      <Label className="text-sm font-medium">Akun Aktif</Label>
                      <p className="text-xs text-muted-foreground">
                        Nonaktifkan untuk memblokir login user ini.
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </div>
                )}
              />
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose
              render={<Button type="button" variant="outline" disabled={isPending} />}
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="mr-1 animate-spin" />}
              {mode === "create" ? "Buat User" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
