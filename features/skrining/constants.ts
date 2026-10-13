// Daftar opsi formulir skrining v2 (anamnesis terstruktur).
// `value` = kode yang disimpan di DB (String), `label` = teks untuk pasien.
// Menambah opsi cukup di sini — tidak perlu migrasi database.

export type Opsi = { readonly value: string; readonly label: string };

export const STEPS = [
  "Jenis dan Lokasi",
  "Detail Keluhan",
  "Riwayat Medis",
  "Foto Mulut",
  "Review dan Kirim",
] as const;

export const MAX_KELUHAN = 5;

// ---------------------------------------------------------------------------
// Langkah 1 — Jenis & lokasi keluhan
// ---------------------------------------------------------------------------

export const PENGISI_OPTIONS = [
  { value: "PASIEN_SENDIRI", label: "Saya sendiri" },
  { value: "ORANG_TUA_WALI", label: "Orang tua atau wali pasien" },
] as const;

/** `singkat` dipakai untuk label ringkas di daftar kasus, mis. "Gigi sakit · 46". */
export const JENIS_KELUHAN_OPTIONS = [
  { value: "GIGI_SAKIT", label: "Gigi sakit atau ngilu", singkat: "Gigi sakit" },
  { value: "GIGI_BERLUBANG", label: "Gigi berlubang", singkat: "Gigi berlubang" },
  { value: "GIGI_PATAH", label: "Gigi patah atau retak", singkat: "Gigi patah" },
  { value: "GIGI_GOYANG", label: "Gigi goyang", singkat: "Gigi goyang" },
  { value: "GUSI_BENGKAK", label: "Gusi bengkak", singkat: "Gusi bengkak" },
  { value: "GUSI_BERDARAH", label: "Gusi berdarah", singkat: "Gusi berdarah" },
  { value: "SARIAWAN", label: "Sariawan atau luka di mulut", singkat: "Sariawan" },
  { value: "BENJOLAN", label: "Benjolan di mulut", singkat: "Benjolan" },
  { value: "BAU_MULUT", label: "Bau mulut", singkat: "Bau mulut" },
  { value: "SUSUNAN_TIDAK_RAPI", label: "Susunan gigi tidak rapi", singkat: "Gigi tidak rapi" },
  { value: "GIGI_TIRUAN", label: "Gigi tiruan bermasalah", singkat: "Gigi tiruan" },
  { value: "LAINNYA", label: "Lainnya", singkat: "Lainnya" },
] as const;

export const AREA_OPTIONS = [
  { value: "GIGI", label: "Gigi" },
  { value: "GUSI", label: "Gusi" },
  { value: "LIDAH", label: "Lidah" },
  { value: "PIPI_DALAM", label: "Pipi bagian dalam" },
  { value: "LANGIT_LANGIT", label: "Langit-langit" },
  { value: "DASAR_MULUT", label: "Dasar mulut (bawah lidah)" },
  { value: "BIBIR", label: "Bibir" },
  { value: "SENDI_RAHANG", label: "Sendi rahang (depan telinga)" },
  { value: "WAJAH_LEHER", label: "Wajah atau leher" },
] as const;

/** Area yang lokasinya dipilih lewat odontogram. */
export const AREA_ODONTOGRAM = ["GIGI", "GUSI"] as const;
/** Area yang lokasinya dipilih lewat gambar wajah (sisi kanan/kiri). */
export const AREA_WAJAH = ["SENDI_RAHANG", "WAJAH_LEHER"] as const;

export const JENIS_GIGI_OPTIONS = [
  { value: "DEWASA", label: "Gigi dewasa" },
  { value: "SUSU", label: "Gigi susu (anak)" },
] as const;

export const REGIO_RAHANG_OPTIONS = [
  { value: "ATAS", label: "Rahang atas" },
  { value: "BAWAH", label: "Rahang bawah" },
] as const;

export const REGIO_SISI_OPTIONS = [
  { value: "KANAN", label: "Sisi kanan" },
  { value: "KIRI", label: "Sisi kiri" },
] as const;

export const REGIO_SEGMEN_OPTIONS = [
  { value: "DEPAN", label: "Gigi depan" },
  { value: "BELAKANG", label: "Gigi belakang (geraham)" },
] as const;

/**
 * Titik jaringan lunak. `area` = bagian mulut induknya (dipakai untuk menjaga
 * titik & bagian tetap konsisten). `grid` = posisi pada gambar mulut (tampak
 * depan, dicerminkan: sisi kiri gambar = sisi kanan pasien).
 */
export const TITIK_JARINGAN_LUNAK_OPTIONS = [
  { value: "BIBIR_ATAS", label: "Bibir atas", area: "BIBIR", grid: "col-start-2 row-start-1" },
  { value: "LANGIT_LANGIT", label: "Langit-langit", area: "LANGIT_LANGIT", grid: "col-start-2 row-start-2" },
  { value: "PIPI_KANAN", label: "Pipi dalam kanan", area: "PIPI_DALAM", grid: "col-start-1 row-start-3" },
  { value: "LIDAH", label: "Lidah", area: "LIDAH", grid: "col-start-2 row-start-3" },
  { value: "PIPI_KIRI", label: "Pipi dalam kiri", area: "PIPI_DALAM", grid: "col-start-3 row-start-3" },
  { value: "DASAR_MULUT", label: "Dasar mulut", area: "DASAR_MULUT", grid: "col-start-2 row-start-4" },
  { value: "BIBIR_BAWAH", label: "Bibir bawah", area: "BIBIR", grid: "col-start-2 row-start-5" },
] as const;

/** Bagian mulut induk dari sebuah titik jaringan lunak. */
export function areaDariTitik(titik: string | null | undefined) {
  return TITIK_JARINGAN_LUNAK_OPTIONS.find((t) => t.value === titik)?.area;
}

/** Bagian mulut yang hanya punya satu titik (mis. Lidah) langsung menunjuk titiknya. */
export const AREA_KE_TITIK: Partial<Record<string, string>> = Object.fromEntries(
  AREA_OPTIONS.flatMap((a) => {
    const titik = TITIK_JARINGAN_LUNAK_OPTIONS.filter((t) => t.area === a.value);
    return titik.length === 1 ? [[a.value, titik[0].value]] : [];
  })
);

export const SISI_WAJAH_OPTIONS = [
  { value: "KANAN", label: "Sisi kanan" },
  { value: "KIRI", label: "Sisi kiri" },
  { value: "KEDUA", label: "Kedua sisi" },
] as const;

/** `singkat` dipakai di ringkasan keluhan utama pada Langkah 2. */
export const SEBARAN_OPTIONS = [
  { value: "SATU_TITIK", label: "Hanya di satu titik", singkat: "di satu titik" },
  { value: "MENYEBAR", label: "Menyebar ke sekitarnya", singkat: "menyebar" },
  {
    value: "MENJALAR",
    label: "Menjalar ke tempat lain (telinga, kepala, leher)",
    singkat: "menjalar",
  },
] as const;

// ---------------------------------------------------------------------------
// Langkah 2 — Detail keluhan (untuk keluhan utama)
// ---------------------------------------------------------------------------

export const DURASI_SATUAN_OPTIONS = [
  { value: "HARI", label: "Hari", hari: 1 },
  { value: "MINGGU", label: "Minggu", hari: 7 },
  { value: "BULAN", label: "Bulan", hari: 30 },
  { value: "TAHUN", label: "Tahun", hari: 365 },
] as const;

export const ONSET_OPTIONS = [
  { value: "TIBA_TIBA", label: "Tiba-tiba" },
  { value: "PERLAHAN", label: "Perlahan-lahan" },
  { value: "TIDAK_INGAT", label: "Tidak ingat" },
] as const;

export const PERKEMBANGAN_OPTIONS = [
  { value: "MAKIN_PARAH", label: "Makin parah" },
  { value: "TETAP", label: "Tetap sama" },
  { value: "MEMBAIK", label: "Membaik" },
  { value: "HILANG_TIMBUL", label: "Hilang timbul" },
] as const;

export const RIWAYAT_PERAWATAN_OPTIONS = [
  { value: "DITAMBAL", label: "Ditambal" },
  { value: "PSA", label: "Perawatan saluran akar" },
  { value: "MAHKOTA", label: "Dipasang mahkota" },
  { value: "GIGI_DEKAT_DICABUT", label: "Gigi di dekatnya dicabut" },
  { value: "BELUM_PERNAH", label: "Belum pernah" },
  { value: "TIDAK_TAHU", label: "Tidak tahu" },
] as const;
export const RIWAYAT_PERAWATAN_EKSKLUSIF = ["BELUM_PERNAH", "TIDAK_TAHU"];

export const JENIS_NYERI_OPTIONS = [
  { value: "NGILU", label: "Ngilu" },
  { value: "BERDENYUT", label: "Berdenyut" },
  { value: "TAJAM", label: "Tajam atau menusuk" },
  { value: "TUMPUL", label: "Tumpul atau pegal" },
] as const;

export const POLA_NYERI_OPTIONS = [
  { value: "SPONTAN", label: "Muncul sendiri tanpa sebab" },
  { value: "DIPICU", label: "Hanya saat dipicu" },
] as const;

export const PEMICU_NYERI_OPTIONS = [
  { value: "DINGIN", label: "Dingin" },
  { value: "PANAS", label: "Panas" },
  { value: "MANIS", label: "Manis" },
  { value: "MENGUNYAH", label: "Saat mengunyah atau menggigit" },
  { value: "MENYIKAT", label: "Saat menyikat gigi" },
] as const;

export const LAMA_NYERI_PEMICU_OPTIONS = [
  { value: "DETIK", label: "Hilang dalam beberapa detik" },
  { value: "MENIT", label: "Bertahan beberapa menit atau lebih" },
] as const;

export const WAKTU_NYERI_OPTIONS = [
  { value: "PAGI", label: "Pagi" },
  { value: "SIANG", label: "Siang" },
  { value: "MALAM", label: "Malam" },
  { value: "SEPANJANG_HARI", label: "Sepanjang hari" },
] as const;
export const WAKTU_NYERI_EKSKLUSIF = ["SEPANJANG_HARI"];

export const YA_TIDAK_OPTIONS = [
  { value: "YA", label: "Ya" },
  { value: "TIDAK", label: "Tidak" },
] as const;

export const DAMPAK_OPTIONS = [
  { value: "MAKAN", label: "Makan atau mengunyah" },
  { value: "BICARA", label: "Berbicara" },
  { value: "TIDUR", label: "Tidur" },
  { value: "SEKOLAH_KERJA", label: "Sekolah atau bekerja" },
  { value: "TIDAK_MENGGANGGU", label: "Tidak mengganggu" },
] as const;
export const DAMPAK_EKSKLUSIF = ["TIDAK_MENGGANGGU"];

export const UPAYA_OPTIONS = [
  { value: "MINUM_OBAT", label: "Minum obat" },
  { value: "HERBAL", label: "Obat herbal atau pengobatan rumahan" },
  { value: "KE_DOKTER_LAIN", label: "Sudah ke dokter atau dokter gigi lain" },
  { value: "BELUM", label: "Belum melakukan apa pun" },
] as const;
export const UPAYA_EKSKLUSIF = ["BELUM"];

export const GEJALA_LAIN_OPTIONS = [
  { value: "GUSI_BENGKAK", label: "Gusi di sekitarnya bengkak" },
  { value: "NANAH", label: "Keluar rasa tidak enak atau nanah" },
  { value: "GIGI_TINGGI", label: "Gigi terasa lebih tinggi saat menggigit" },
  { value: "SAKIT_DIKETUK", label: "Sakit saat gigi diketuk" },
  { value: "BENJOLAN_RAHANG", label: "Benjolan di bawah rahang" },
  { value: "TIDAK_ADA", label: "Tidak ada" },
] as const;
export const GEJALA_LAIN_EKSKLUSIF = ["TIDAK_ADA"];

/** Pemeriksaan tanda bahaya — semua wajib dijawab Ya/Tidak. */
export const TANDA_BAHAYA = [
  {
    value: "BENGKAK_MENYEBAR",
    label: "Apakah bengkak menyebar sampai pipi, bawah mata, rahang, atau leher?",
    singkat: "bengkak menyebar ke pipi/rahang/leher",
  },
  {
    value: "SULIT_BUKA_MULUT",
    label: "Apakah Anda sulit membuka mulut?",
    singkat: "sulit membuka mulut",
  },
  {
    value: "SULIT_MENELAN_NAPAS",
    label: "Apakah Anda sulit menelan atau bernapas?",
    singkat: "sulit menelan atau bernapas",
  },
  { value: "DEMAM", label: "Apakah Anda demam?", singkat: "demam" },
  {
    value: "PERDARAHAN",
    label: "Apakah ada perdarahan yang tidak berhenti?",
    singkat: "perdarahan tidak berhenti",
  },
  {
    value: "KEBAS",
    label: "Apakah bibir, dagu, atau lidah terasa kebas atau mati rasa?",
    singkat: "bibir/dagu/lidah kebas",
  },
  {
    value: "TRAUMA",
    label: "Apakah keluhan terjadi setelah kecelakaan atau benturan keras di wajah?",
    singkat: "setelah kecelakaan/benturan wajah",
  },
] as const;

export type TandaBahayaKode = (typeof TANDA_BAHAYA)[number]["value"];

/** Tempat rujukan bila ada tanda bahaya — dipakai di form & halaman hasil. */
export const RUJUKAN_DARURAT =
  "RSGM Unmul (Senin sampai Jumat, 08.00 sampai 16.00 WITA) atau IGD terdekat";

// ---------------------------------------------------------------------------
// Helper label
// ---------------------------------------------------------------------------

export function labelOf(
  options: readonly Opsi[],
  value: string | null | undefined
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function labelsOf(
  options: readonly Opsi[],
  values: readonly string[] | null | undefined
): string[] {
  return (values ?? []).map((v) => labelOf(options, v));
}
