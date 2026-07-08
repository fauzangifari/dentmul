"use server"

import { z } from "zod"
import { RegisterSchema, LoginSchema } from "@/features/auth/schema"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
  try {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
      return { error: "Data tidak valid!" }
    }

    const { email, password, name, nik, tanggalLahir, alamat } = validatedFields.data

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Email sudah digunakan!" }
    }

    const existingNik = await db.user.findUnique({
      where: { nik }
    })

    if (existingNik) {
      return { error: "NIK sudah terdaftar!" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nik,
        tanggalLahir: new Date(tanggalLahir),
        alamat,
        role: "PASIEN" // Default role for public registration
      }
    })

    return { success: "Registrasi berhasil!" }
  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Terjadi kesalahan pada server." }
  }
}

export async function loginUser(values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Data login tidak valid!" }
  }

  const { email, password } = validatedFields.data

  // Tentukan tujuan redirect berdasarkan role agar tidak bergantung pada hop middleware
  const user = await db.user.findUnique({
    where: { email },
    select: { role: true },
  })
  const roleBasedTarget =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "KOAS"
        ? "/koas/dashboard"
        : "/pasien/dashboard"

  try {
    // Memanggil NextAuth signIn ("credentials")
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || roleBasedTarget
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah!" }
        default:
          return { error: "Gagal login, coba lagi nanti." }
      }
    }
    // Auth.js redirects by throwing an error, so we must rethrow it!
    throw error
  }
}

export async function logoutUser() {
  // Clear the session cookie without letting Auth.js emit an absolute
  // (NEXTAUTH_URL-pinned) redirect — that breaks when the browser origin
  // differs from NEXTAUTH_URL. Redirect relatively via next/navigation instead.
  await signOut({ redirect: false })
  redirect("/login")
}
