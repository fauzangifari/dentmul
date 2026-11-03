import { z } from "zod"
import { JENIS_KELAMIN_VALUES, tanggalLahirSchema } from "@/features/pasien/schema"

export const RegisterSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nik: z.string().length(16, "NIK harus tepat 16 digit angka").regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  noTelepon: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh angka (boleh diawali +)"),
  tanggalLahir: tanggalLahirSchema,
  jenisKelamin: z.enum(JENIS_KELAMIN_VALUES, { error: "Jenis kelamin wajib dipilih" }),
  alamat: z.string().trim().min(5, "Alamat terlalu pendek"),
})

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password wajib diisi"),
})
