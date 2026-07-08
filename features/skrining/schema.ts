import { z } from "zod";

export const SkriningSchema = z.object({
  keluhanUtama: z.string().min(5, "Keluhan utama harus diisi minimal 5 karakter"),
  keluhanTambahan: z.string().optional(),
  durasiKeluhan: z.string().min(1, "Durasi keluhan harus diisi (misal: '3 hari')"),
  lokasiSakit: z.string().optional(),
  skalaNyeri: z.coerce.number().min(1).max(10).optional(),
  riwayatPenyakit: z.string().optional(),
  alergiObat: z.string().optional(),
  obatRutin: z.string().optional(),
  kebiasaanBuruk: z.string().optional(),
});

export type SkriningFormValues = z.infer<typeof SkriningSchema>;
