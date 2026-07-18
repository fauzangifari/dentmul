"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Stethoscope } from "lucide-react";
import { mulaiTinjauKasus } from "@/features/koas/actions";

/**
 * Memicu transisi MENUNGGU → DITINJAU secara eksplisit (bukan otomatis saat
 * render). Setelah sukses, refresh agar Server Component menampilkan formulir
 * tinjauan.
 */
export function MulaiTinjauButton({ skriningId }: { skriningId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await mulaiTinjauKasus(skriningId);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Kasus ini belum ditinjau. Mulai tinjauan untuk membuka formulir kategori
        dan edukasi.
      </p>
      <Button
        onClick={handleClick}
        disabled={loading}
        size="lg"
        className="h-12 w-full text-base"
      >
        {loading ? (
          <>
            <Loader2 className="mr-1 animate-spin" size={18} />
            Memulai...
          </>
        ) : (
          <>
            <Stethoscope className="mr-1" size={18} />
            Mulai Tinjau
          </>
        )}
      </Button>
    </div>
  );
}
