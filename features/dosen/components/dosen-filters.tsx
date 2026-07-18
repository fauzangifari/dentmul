"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

/**
 * Filter pencarian dashboard dosen. Mempertahankan param `status` (antrean vs
 * riwayat) yang di-set lewat kartu statistik, dan mereset `page` saat mencari.
 */
export function DosenFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function pushWith(nextSearch: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    else params.delete("search");
    params.delete("page");
    startTransition(() => {
      router.push(`/dosen/dashboard?${params.toString()}`);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushWith(search);
  }

  const hasSearch = (searchParams.get("search") ?? "") !== "";

  function reset() {
    setSearch("");
    pushWith("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
    >
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama pasien atau keluhan..."
          className="h-11 border-transparent bg-muted/60 pl-10 focus-visible:bg-card"
          aria-label="Cari pasien"
        />
      </div>
      {hasSearch && (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={reset}
          title="Hapus pencarian"
          aria-label="Hapus pencarian"
          className="h-11 w-11 shrink-0"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <X size={18} />
          )}
        </Button>
      )}
    </form>
  );
}
