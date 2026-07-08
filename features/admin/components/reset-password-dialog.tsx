"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { resetUserPassword } from "@/features/admin/actions";
import type { AdminUserItem } from "@/features/admin/types";

type FormValues = { newPassword: string };

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { newPassword: "" } });

  useEffect(() => {
    if (open) reset({ newPassword: "" });
  }, [open, reset]);

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    startTransition(async () => {
      const result = await resetUserPassword(user.id, values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Password direset.");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Tetapkan password baru untuk {user?.name ?? "user ini"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input
              {...register("newPassword", {
                required: "Password wajib diisi",
                minLength: { value: 6, message: "Password minimal 6 karakter" },
              })}
              type="password"
              placeholder="Minimal 6 karakter"
              disabled={isPending}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-xs font-medium text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" disabled={isPending} />}
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="mr-1 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
