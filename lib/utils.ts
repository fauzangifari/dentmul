import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Menghitung usia (dalam tahun) dari tanggal lahir.
 * Mengembalikan "-" jika tanggal lahir tidak tersedia.
 */
export function calculateAge(dateOfBirth: Date | null | undefined): number | "-" {
  if (!dateOfBirth) return "-"
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

/**
 * Membuat URL wa.me dari nomor telepon Indonesia.
 * "08123..." / "+628123..." / "628123..." → "https://wa.me/628123..."
 * Mengembalikan null jika nomor kosong/tidak valid.
 */
export function toWhatsappLink(
  noTelepon: string | null | undefined
): string | null {
  if (!noTelepon) return null
  let digits = noTelepon.replace(/\D/g, "")
  if (digits.startsWith("0")) digits = "62" + digits.slice(1)
  else if (!digits.startsWith("62")) digits = "62" + digits
  if (digits.length < 10) return null
  return `https://wa.me/${digits}`
}
