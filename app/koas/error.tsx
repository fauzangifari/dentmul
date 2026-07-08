"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KoasError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-20 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle size={32} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Terjadi kesalahan</h1>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Kami tidak dapat memuat data saat ini. Silakan coba lagi beberapa saat.
      </p>
      <Button onClick={() => unstable_retry()} size="lg" className="h-11">
        <RotateCw size={16} className="mr-1" /> Coba Lagi
      </Button>
    </div>
  );
}
