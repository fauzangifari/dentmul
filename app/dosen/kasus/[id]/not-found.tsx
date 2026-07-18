import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DosenKasusNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-20 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent text-primary">
        <FileQuestion size={32} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Kasus tidak ditemukan</h1>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Data skrining yang Anda cari tidak ada atau mungkin sudah dihapus.
      </p>
      <Button render={<Link href="/dosen/dashboard" />} size="lg" className="h-11">
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
