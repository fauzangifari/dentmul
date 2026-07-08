import { z } from "zod"

export const RegisterSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nik: z.string().length(16, "NIK harus tepat 16 digit angka").regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().min(5, "Alamat terlalu pendek"),
})

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password wajib diisi"),
})
