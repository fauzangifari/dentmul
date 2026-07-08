import * as z from "zod";

// Skema tinjauan koas — dipakai di server action `submitTinjauan`
// sebagai validasi sisi-server (defense-in-depth atas validasi form klien).
export const TinjauanSchema = z.object({
  skriningId: z.string().min(1),
  kategori: z.string().min(1, { message: "Kategori wajib dipilih" }),
  isPotensial: z.boolean(),
  catatan: z.string().optional(),
  edukasiKonten: z.string().min(10, {
    message: "Pesan edukasi/rekomendasi terlalu singkat (minimal 10 karakter).",
  }),
});

export type TinjauanInput = z.infer<typeof TinjauanSchema>;
