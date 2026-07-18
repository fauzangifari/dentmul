export const PAGE_SIZE = 10;

// Status yang relevan di dashboard dosen: antrean yang menunggu ACC & yang
// sudah disetujui (riwayat). Penolakan mengembalikan kasus ke koas (DITINJAU),
// jadi tidak muncul di sini.
export const STATUS_OPTIONS = [
  { value: "MENUNGGU_ACC", label: "Menunggu ACC" },
  { value: "SELESAI", label: "Disetujui" },
] as const;
