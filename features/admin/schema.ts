import { z } from "zod"

export const ROLE_VALUES = ["PASIEN", "KOAS", "ADMIN"] as const
export const JENIS_KELAMIN_VALUES = ["LAKI_LAKI", "PEREMPUAN"] as const

// Field demografis pasien — opsional di level tipe, wajib untuk PASIEN
// (divalidasi kondisional lewat superRefine di bawah). Select bisa mengirim
// string kosong, jadi jenisKelamin menerima "" lalu dinormalkan ke null di action.
const demografis = {
  nik: z.string().optional(),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  jenisKelamin: z.union([z.enum(JENIS_KELAMIN_VALUES), z.literal("")]).optional(),
}

function validateDemografis(
  data: { role: string; nik?: string; tanggalLahir?: string; alamat?: string },
  ctx: z.RefinementCtx
) {
  if (data.nik && !/^\d{16}$/.test(data.nik)) {
    ctx.addIssue({ code: "custom", path: ["nik"], message: "NIK harus 16 digit angka" })
  }
  if (data.role !== "PASIEN") return
  if (!data.nik?.trim()) {
    ctx.addIssue({ code: "custom", path: ["nik"], message: "NIK wajib untuk pasien" })
  }
  if (!data.tanggalLahir?.trim()) {
    ctx.addIssue({ code: "custom", path: ["tanggalLahir"], message: "Tanggal lahir wajib untuk pasien" })
  }
  if (!data.alamat?.trim()) {
    ctx.addIssue({ code: "custom", path: ["alamat"], message: "Alamat wajib untuk pasien" })
  }
}

export const CreateUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.enum(ROLE_VALUES),
    ...demografis,
  })
  .superRefine(validateDemografis)

export const UpdateUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid").transform((v) => v.trim().toLowerCase()),
    role: z.enum(ROLE_VALUES),
    isActive: z.boolean(),
    ...demografis,
  })
  .superRefine(validateDemografis)

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
