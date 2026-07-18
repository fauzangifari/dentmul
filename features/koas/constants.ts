export const KATEGORI_OPTIONS = [
  "Bedah Mulut",
  "Konservasi Gigi",
  "Periodonsia",
  "Ortodonsia",
  "Prostodonsia",
  "Kedokteran Gigi Anak",
  "Penyakit Mulut",
  "Lainnya",
] as const;

export const PAGE_SIZE = 10;

export const STATUS_OPTIONS = [
  { value: "MENUNGGU", label: "Menunggu" },
  { value: "DITINJAU", label: "Ditinjau" },
  { value: "MENUNGGU_ACC", label: "Menunggu ACC" },
  { value: "SELESAI", label: "Selesai" },
] as const;
