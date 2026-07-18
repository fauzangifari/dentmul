"use server"

import { db } from "@/lib/db"
import { getVerifiedUser } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { UpdateProfileSchema, type UpdateProfileInput } from "@/features/pasien/schema"

/**
 * Update profil milik pasien yang sedang login.
 *
 * Guard keamanan (Server Actions bisa dipanggil via POST langsung, bukan hanya
 * lewat UI): wajib sesi PASIEN, dan update SELALU menargetkan `session.user.id`
 * — id tidak pernah diterima dari client. Hanya field kontak/demografis yang
 * ditulis; name/email/nik/role/isActive tidak pernah disentuh.
 */
export async function updateOwnProfile(values: UpdateProfileInput) {
  try {
    const pasien = await getVerifiedUser("PASIEN")
    if (!pasien) {
      return { error: "Unauthorized" }
    }

    const parsed = UpdateProfileSchema.safeParse(values)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" }
    }

    const { noTelepon, tanggalLahir, alamat, jenisKelamin } = parsed.data

    await db.user.update({
      where: { id: pasien.id },
      data: {
        noTelepon,
        tanggalLahir: new Date(tanggalLahir),
        alamat,
        jenisKelamin: jenisKelamin || null,
      },
    })

    revalidatePath("/pasien/profil")
    return { success: "Profil berhasil diperbarui!" }
  } catch (error) {
    console.error("updateOwnProfile Error:", error)
    return { error: "Terjadi kesalahan pada server." }
  }
}
