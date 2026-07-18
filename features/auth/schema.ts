import { z } from "zod"

export const RegisterSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nik: z.string().length(16, "NIK harus tepat 16 digit angka").regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  noTelepon: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh angka (boleh diawali +)"),
  tanggalLahir: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid")
    // Tanggal lahir tidak boleh melewati hari ini
    .refine((v) => new Date(v) <= new Date(), "Tanggal lahir tidak boleh di masa depan")
    // Batas bawah wajar untuk menangkap salah ketik tahun (mis. 0999)
    .refine((v) => new Date(v) >= new Date("1900-01-01"), "Tanggal lahir tidak valid"),
  alamat: z.string().min(5, "Alamat terlalu pendek"),
})

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password wajib diisi"),
})
