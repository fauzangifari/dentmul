"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { chipClass } from "@/features/skrining/components/chip-group";

const KETENTUAN = [
  "Saya menggunakan situs web ini secara sukarela dan dapat berhenti kapan saja tanpa konsekuensi apa pun.",
  "Keluhan saya akan ditanggapi oleh dokter gigi muda di bawah supervisi dosen, dan saran yang diberikan tidak menggantikan pemeriksaan langsung.",
  "Data yang saya isi dijaga kerahasiaannya dan hanya digunakan untuk keperluan layanan dan penelitian, tanpa mencantumkan identitas saya.",
  "Penjelasan mengenai penelitian telah disampaikan oleh peneliti yang mengundang saya.",
] as const;

/**
 * Isi layar Persetujuan Penggunaan yang wajib disetujui pasien sebelum mengisi
 * skrining. Kartu & judul dirender halaman agar sama dengan langkah lain.
 */
export function PersetujuanPenggunaan({ onSetuju }: { onSetuju: () => void }) {
  const [dicentang, setDicentang] = useState(false);

  return (
    <>
      <div className="space-y-4 text-base leading-relaxed text-foreground">
        <p>
          Situs web ini merupakan prototipe layanan teledentistry yang
          dikembangkan untuk keperluan penelitian di Fakultas Kedokteran Gigi
          Universitas Mulawarman. Dengan menggunakan situs web ini, saya
          memahami dan menyetujui bahwa:
        </p>
        <ol className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-primary">
          {KETENTUAN.map((butir) => (
            <li key={butir} className="pl-1">
              {butir}
            </li>
          ))}
        </ol>
      </div>

      <label
        className={cn(
          chipClass(dicentang, "tile"),
          "flex cursor-pointer items-start gap-3 py-3 text-[15px] has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        )}
      >
        <input
          type="checkbox"
          checked={dicentang}
          onChange={(e) => setDicentang(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary outline-none"
        />
        <span>Saya telah membaca dan menyetujui ketentuan di atas.</span>
      </label>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          disabled={!dicentang}
          onClick={onSetuju}
          className="h-12 w-full text-base sm:w-auto sm:px-6"
        >
          Setuju dan Lanjutkan <ChevronRight className="ml-1" size={18} />
        </Button>
      </div>
    </>
  );
}
