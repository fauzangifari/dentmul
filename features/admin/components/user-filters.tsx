"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "@/features/admin/constants";

const ALL = "__all__";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const role = searchParams.get("role") ?? ALL;
  const status = searchParams.get("status") ?? ALL;

  function pushParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "" || value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Setiap perubahan filter kembali ke halaman 1
    params.delete("page");
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search });
  }

  const hasActiveFilter =
    (searchParams.get("search") ?? "") !== "" || role !== ALL || status !== ALL;

  function resetAll() {
    setSearch("");
    startTransition(() => {
      router.push("/admin/users");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
      <form onSubmit={onSearchSubmit} className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau NIK..."
          className="h-11 border-transparent bg-muted/60 pl-10 focus-visible:bg-card"
          aria-label="Cari user"
        />
      </form>

      <div className="flex gap-3">
        <Select value={role} onValueChange={(v) => pushParams({ role: v })}>
          <SelectTrigger className="h-11 flex-1 sm:w-40 sm:flex-none" aria-label="Filter role">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua Role</SelectItem>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => pushParams({ status: v })}>
          <SelectTrigger className="h-11 flex-1 sm:w-40 sm:flex-none" aria-label="Filter status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={resetAll}
            title="Hapus filter"
            aria-label="Hapus semua filter"
            className="h-11 w-11 shrink-0"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <X size={18} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
