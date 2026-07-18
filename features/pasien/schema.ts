import { z } from "zod"

export const JENIS_KELAMIN_VALUES = ["LAKI_LAKI", "PEREMPUAN"] as const

// Field yang boleh diubah sendiri oleh pasien lewat halaman Profil.
// Nama, email, dan NIK sengaja TIDAK ada di sini — dikunci di server & UI.
// Select bisa mengirim string kosong, jadi jenisKelamin menerima "" lalu
// dinormalkan ke null di action.
export const UpdateProfileSchema = z.object({
  noTelepon: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh angka (boleh diawali +)"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().trim().min(5, "Alamat terlalu pendek"),
  jenisKelamin: z.union([z.enum(JENIS_KELAMIN_VALUES), z.literal("")]).optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
