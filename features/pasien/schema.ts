import { z } from "zod"

export const JENIS_KELAMIN_VALUES = ["LAKI_LAKI", "PEREMPUAN"] as const

// Hari ini (YYYY-MM-DD) menurut WIT (UTC+9), zona paling timur Indonesia.
// Dipatok, bukan zona lokal, agar browser dan server (yang bisa berjalan di
// UTC) sepakat; memakai WIT berarti tanggal hari ini tidak pernah ditolak di
// WIB/WITA/WIT. Konsekuensinya, menjelang tengah malam di barat, tanggal besok
// masih diterima — selisih satu hari, tidak berbahaya. Indonesia tanpa DST.
const hariIniWit = () =>
  new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

/** Tanggal lahir dari `<input type="date">` — dipakai register, profil, dan admin. */
export const tanggalLahirSchema = z
  .string()
  .min(1, "Tanggal lahir wajib diisi")
  // Format YYYY-MM-DD; sekaligus menolak tanggal mustahil (30 Feb).
  .pipe(z.iso.date("Tanggal lahir tidak valid"))
  // Dibandingkan sebagai string: `new Date(v)` membacanya sebagai UTC, sehingga
  // tanggal hari ini bisa tertolak di pagi hari waktu Indonesia.
  .refine((v) => v <= hariIniWit(), "Tanggal lahir tidak boleh di masa depan")
  // Batas bawah wajar untuk menangkap salah ketik tahun (mis. 0999)
  .refine((v) => v >= "1900-01-01", "Tanggal lahir tidak valid")

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
  tanggalLahir: tanggalLahirSchema,
  alamat: z.string().trim().min(5, "Alamat terlalu pendek"),
  jenisKelamin: z.union([z.enum(JENIS_KELAMIN_VALUES), z.literal("")]).optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
