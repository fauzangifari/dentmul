export const PAGE_SIZE = 10

export const ROLE_OPTIONS = [
  { value: "PASIEN", label: "Pasien" },
  { value: "KOAS", label: "Koas" },
  { value: "ADMIN", label: "Admin" },
] as const

export const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
] as const

export const JENIS_KELAMIN_OPTIONS = [
  { value: "LAKI_LAKI", label: "Laki-laki" },
  { value: "PEREMPUAN", label: "Perempuan" },
] as const
