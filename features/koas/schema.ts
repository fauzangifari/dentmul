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

// Skema edit profil koas — dipakai di server action `updateOwnKoasProfile`
// sebagai validasi sisi-server (defense-in-depth atas validasi form klien).
// Hanya nama & nomor telepon yang boleh diubah koas; email dikunci di server & UI.
export const UpdateKoasProfileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  noTelepon: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh angka (boleh diawali +)"),
});

export type UpdateKoasProfileInput = z.infer<typeof UpdateKoasProfileSchema>;
