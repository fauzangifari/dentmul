"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
}

export function PaginationControls({ page, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="h-10"
      >
        <ChevronLeft size={16} className="mr-1" /> Sebelumnya
      </Button>
      <span className="text-sm font-medium text-muted-foreground">
        Halaman {page} dari {totalPages}
      </span>
      <Button
        variant="outline"
        size="lg"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="h-10"
      >
        Berikutnya <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  );
}
