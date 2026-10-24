export const PAGE_SIZE = 10;

// Status yang relevan di dashboard dosen: antrean yang menunggu ACC, yang
// sudah disetujui (riwayat), dan yang ditolak — dikembalikan ke koas
// (DITINJAU) dan menunggu revisi.
export const STATUS_OPTIONS = [
  { value: "MENUNGGU_ACC", label: "Menunggu ACC" },
  { value: "SELESAI", label: "Disetujui" },
  { value: "DITOLAK", label: "Ditolak" },
] as const;
