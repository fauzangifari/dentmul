// lib/auth-guard.ts
// Guard otorisasi berbasis-DB.
//
// Kenapa baca ulang DB (bukan hanya token JWT): sesi memakai strategy "jwt",
// sehingga `role` & status akun "membeku" di token sejak login. Jika admin
// menonaktifkan user atau mengubah role-nya, token lama tetap valid sampai
// kedaluwarsa. Middleware berjalan di Edge dan TIDAK bisa akses DB, jadi ia
// tetap mengandalkan token; lapisan sebenarnya ada di sini — dipanggil dari
// setiap layout area dan setiap Server Action untuk memverifikasi ke DB.

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Role } from "@/prisma/generated/client";

export type VerifiedUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  isActive: boolean;
};

/**
 * Ambil user tepercaya dari DB berdasarkan sesi aktif. Mengembalikan null bila
 * tidak ada sesi, user tidak ditemukan, akun nonaktif, atau role tidak cocok
 * dengan `expectedRole` (bila diberikan). Tidak pernah melempar/redirect —
 * pemanggil menentukan cara menangani kegagalan.
 */
export async function getVerifiedUser(
  expectedRole?: Role
): Promise<VerifiedUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return null;
  if (expectedRole && user.role !== expectedRole) return null;

  return user;
}

/**
 * Untuk layout Server Component: redirect ke `/logout` bila gagal.
 *
 * Sengaja ke `/logout` (bukan `/login`): token bisa jadi masih valid padahal
 * user sudah nonaktif/berubah role, sehingga middleware akan memantulkan
 * kembali ke dashboard bila kita redirect ke `/login` → infinite loop. Route
 * `/logout` membersihkan cookie sesi lebih dulu, baru mengarah ke `/login`.
 */
export async function requireUserOrRedirect(
  expectedRole: Role
): Promise<VerifiedUser> {
  const user = await getVerifiedUser(expectedRole);
  if (!user) redirect("/logout");
  return user;
}

/**
 * Untuk Server Action baca yang dipanggil langsung dari Server Component
 * (mirror pola lama `requireAdmin`): melempar "Unauthorized" bila gagal.
 */
export async function requireUserOrThrow(
  expectedRole: Role
): Promise<VerifiedUser> {
  const user = await getVerifiedUser(expectedRole);
  if (!user) throw new Error("Unauthorized");
  return user;
}
