import * as z from "zod";

// Skema aksi ACC/tolak dosen — validasi sisi-server untuk server actions.
export const ApproveEdukasiSchema = z.object({
  skriningId: z.string().min(1),
});

export type ApproveEdukasiInput = z.infer<typeof ApproveEdukasiSchema>;

export const RejectEdukasiSchema = z.object({
  skriningId: z.string().min(1),
  // Alasan penolakan opsional (dikonfirmasi user). Ditampilkan ke koas.
  catatan: z.string().trim().max(500, "Alasan maksimal 500 karakter").optional(),
});

export type RejectEdukasiInput = z.infer<typeof RejectEdukasiSchema>;

// Skema edit profil dosen — identik dengan koas (hanya nama & nomor telepon).
export const UpdateDosenProfileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  noTelepon: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh angka (boleh diawali +)"),
});

export type UpdateDosenProfileInput = z.infer<typeof UpdateDosenProfileSchema>;
