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
