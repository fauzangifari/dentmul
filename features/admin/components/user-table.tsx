"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/features/admin/components/role-badge";
import { UserStatusBadge } from "@/features/admin/components/status-badge";
import { UserFormDialog } from "@/features/admin/components/user-form-dialog";
import { ResetPasswordDialog } from "@/features/admin/components/reset-password-dialog";
import { setUserActive } from "@/features/admin/actions";
import type { AdminUserItem } from "@/features/admin/types";
import { Pencil, KeyRound, Ban, CheckCircle2, Loader2 } from "lucide-react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function joinedAt(date: Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: localeId });
}

export function UserTable({
  items,
  currentUserId,
}: {
  items: AdminUserItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminUserItem | null>(null);
  const [resetting, setResetting] = useState<AdminUserItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleActive(user: AdminUserItem) {
    setPendingId(user.id);
    startTransition(async () => {
      const result = await setUserActive(user.id, !user.isActive);
      setPendingId(null);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Status diperbarui.");
      router.refresh();
    });
  }

  return (
    <>
      {/* ===== Desktop: table ===== */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="py-3 pr-4 pl-5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                User
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Terdaftar
              </th>
              <th className="py-3 pr-5 pl-4 text-right text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = pendingId === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-accent/40"
                >
                  <td className="py-3.5 pr-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">
                          {u.name}
                          {isSelf && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (Anda)
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3.5">
                    <UserStatusBadge isActive={u.isActive} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {joinedAt(u.createdAt)}
                  </td>
                  <td className="py-3.5 pr-5 pl-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Edit user"
                        aria-label="Edit user"
                        onClick={() => setEditing(u)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Reset password"
                        aria-label="Reset password"
                        onClick={() => setResetting(u)}
                      >
                        <KeyRound size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant={u.isActive ? "destructive" : "default"}
                        size="icon-sm"
                        title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        aria-label={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => toggleActive(u)}
                        disabled={busy || (isSelf && u.isActive)}
                      >
                        {busy ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : u.isActive ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile: card list ===== */}
      <div className="space-y-3 md:hidden">
        {items.map((u) => {
          const isSelf = u.id === currentUserId;
          const busy = pendingId === u.id;
          return (
            <div
              key={u.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {u.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (Anda)
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </div>
                </div>
                <UserStatusBadge isActive={u.isActive} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <RoleBadge role={u.role} />
                <span className="ml-auto text-xs text-muted-foreground">
                  {joinedAt(u.createdAt)}
                </span>
              </div>

              <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditing(u)}
                >
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setResetting(u)}
                >
                  <KeyRound size={14} className="mr-1" /> Reset
                </Button>
                <Button
                  variant={u.isActive ? "destructive" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleActive(u)}
                  disabled={busy || (isSelf && u.isActive)}
                >
                  {busy ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : u.isActive ? (
                    <Ban size={14} className="mr-1" />
                  ) : (
                    <CheckCircle2 size={14} className="mr-1" />
                  )}
                  {u.isActive ? "Nonaktif" : "Aktifkan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <UserFormDialog
        mode="edit"
        user={editing}
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      />
      <ResetPasswordDialog
        user={resetting}
        open={!!resetting}
        onOpenChange={(o) => {
          if (!o) setResetting(null);
        }}
      />
    </>
  );
}
