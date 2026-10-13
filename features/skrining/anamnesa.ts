// Logika murni anamnesis terstruktur (skrining v2) — dipakai server (submit)
// dan UI (review pasien, kartu anamnesa koas/dosen). Tidak menyentuh DB.

import { KATEGORI_OPTIONS } from "@/features/koas/constants";
import {
  AREA_ODONTOGRAM,
  AREA_OPTIONS,
  AREA_WAJAH,
  DAMPAK_OPTIONS,
  DURASI_SATUAN_OPTIONS,
  GEJALA_LAIN_OPTIONS,
  JENIS_KELUHAN_OPTIONS,
  JENIS_NYERI_OPTIONS,
  LAMA_NYERI_PEMICU_OPTIONS,
  ONSET_OPTIONS,
  PEMICU_NYERI_OPTIONS,
  PERKEMBANGAN_OPTIONS,
  REGIO_RAHANG_OPTIONS,
  REGIO_SEGMEN_OPTIONS,
  REGIO_SISI_OPTIONS,
  RIWAYAT_PERAWATAN_OPTIONS,
  SEBARAN_OPTIONS,
  SISI_WAJAH_OPTIONS,
  TANDA_BAHAYA,
  TITIK_JARINGAN_LUNAK_OPTIONS,
  UPAYA_OPTIONS,
  WAKTU_NYERI_OPTIONS,
  labelOf,
  labelsOf,
} from "@/features/skrining/constants";

// ---------------------------------------------------------------------------
// Tipe data (bentuk kolom DB — cocok untuk hasil Prisma maupun hasil normalisasi)
// ---------------------------------------------------------------------------

export type KeluhanData = {
  jenis: string[];
  jenisLainnya: string | null;
  area: string;
  jenisGigi: string | null;
  gigi: number[];
  tidakYakin: boolean;
  regioRahang: string | null;
  regioSisi: string | null;
  regioSegmen: string | null;
  titikJaringanLunak: string | null;
  sisiWajah: string | null;
  sebaran: string;
  cerita: string;
};

export type AnamnesaData = {
  skalaNyeri: number | null;
  durasiAngka: number | null;
  durasiSatuan: string | null;
  onset: string | null;
  perkembangan: string | null;
  riwayatPerawatan: string[];
  jenisNyeri: string | null;
  polaNyeri: string | null;
  pemicuNyeri: string[];
  lamaNyeriPemicu: string | null;
  waktuNyeri: string[];
  nyeriBangunTidur: boolean | null;
  dampak: string[];
  upaya: string[];
  keteranganObat: string | null;
  gejalaLain: string[];
  tandaBahaya: string[];
  keluhan: KeluhanData[];
};

export type Prioritas = "SEGERA" | "EVALUASI_LESI" | "RUTIN";

// ---------------------------------------------------------------------------
// Odontogram — notasi FDI
// ---------------------------------------------------------------------------

const NAMA_GIGI_DEWASA: Record<number, string> = {
  1: "gigi seri tengah",
  2: "gigi seri samping",
  3: "gigi taring",
  4: "geraham kecil pertama",
  5: "geraham kecil kedua",
  6: "geraham besar pertama",
  7: "geraham besar kedua",
  8: "geraham bungsu",
};

const NAMA_GIGI_SUSU: Record<number, string> = {
  1: "gigi seri tengah",
  2: "gigi seri samping",
  3: "gigi taring",
  4: "geraham susu pertama",
  5: "geraham susu kedua",
};

// Kuadran FDI: 1/5 atas kanan, 2/6 atas kiri, 3/7 bawah kiri, 4/8 bawah kanan
// (kanan/kiri dari sisi pasien).
const KUADRAN_ATAS = [1, 2, 5, 6];
const KUADRAN_KANAN = [1, 4, 5, 8];

function range(a: number, b: number) {
  const out: number[] = [];
  if (a <= b) for (let i = a; i <= b; i++) out.push(i);
  else for (let i = a; i >= b; i--) out.push(i);
  return out;
}

/**
 * Susunan gigi per baris untuk digambar seperti melihat mulut orang yang
 * berhadapan: baris kiri gambar = sisi kanan pasien.
 */
export const ODONTOGRAM = {
  DEWASA: {
    atasKanan: range(18, 11),
    atasKiri: range(21, 28),
    bawahKanan: range(48, 41),
    bawahKiri: range(31, 38),
  },
  SUSU: {
    atasKanan: range(55, 51),
    atasKiri: range(61, 65),
    bawahKanan: range(85, 81),
    bawahKiri: range(71, 75),
  },
} as const;

const GIGI_DEWASA = new Set<number>(Object.values(ODONTOGRAM.DEWASA).flat());
const GIGI_SUSU = new Set<number>(Object.values(ODONTOGRAM.SUSU).flat());

export function isGigiValid(code: number, jenisGigi: string | null) {
  if (jenisGigi === "SUSU") return GIGI_SUSU.has(code);
  if (jenisGigi === "DEWASA") return GIGI_DEWASA.has(code);
  return GIGI_DEWASA.has(code) || GIGI_SUSU.has(code);
}

/** Nama awam gigi, mis. 46 → "geraham besar pertama bawah kanan". */
export function namaGigi(code: number) {
  if (!isGigiValid(code, null)) return `gigi ${code}`;
  const q = Math.floor(code / 10);
  const p = code % 10;
  const nama = q >= 5 ? NAMA_GIGI_SUSU[p] : NAMA_GIGI_DEWASA[p];
  const rahang = KUADRAN_ATAS.includes(q) ? "atas" : "bawah";
  const sisi = KUADRAN_KANAN.includes(q) ? "kanan" : "kiri";
  return `${nama ?? `gigi ${code}`} ${rahang} ${sisi}`;
}

/** Regio sebuah gigi dalam kode yang sama dengan pilihan "tidak yakin". */
export function regioGigi(code: number) {
  const q = Math.floor(code / 10);
  const p = code % 10;
  return {
    rahang: KUADRAN_ATAS.includes(q) ? "ATAS" : "BAWAH",
    sisi: KUADRAN_KANAN.includes(q) ? "KANAN" : "KIRI",
    segmen: p <= 3 ? "DEPAN" : "BELAKANG",
  } as const;
}

/** Apakah gigi termasuk regio yang dipilih pasien saat "tidak yakin". */
export function cocokRegio(
  code: number,
  regio: Pick<KeluhanData, "regioRahang" | "regioSisi" | "regioSegmen">
) {
  if (!regio.regioRahang && !regio.regioSisi && !regio.regioSegmen) return false;
  const r = regioGigi(code);
  if (regio.regioRahang && regio.regioRahang !== r.rahang) return false;
  if (regio.regioSisi && regio.regioSisi !== r.sisi) return false;
  if (regio.regioSegmen && regio.regioSegmen !== r.segmen) return false;
  return true;
}

/** Semua gigi pada odontogram yang masuk regio pilihan pasien (mode "tidak yakin"). */
export function gigiDalamRegio(
  jenisGigi: "DEWASA" | "SUSU",
  regio: Pick<KeluhanData, "regioRahang" | "regioSisi" | "regioSegmen">
) {
  return Object.values(ODONTOGRAM[jenisGigi])
    .flat()
    .filter((c) => cocokRegio(c, regio));
}

/** Istilah klinis regio dari kumpulan gigi, mis. "regio posterior kanan bawah". */
export function regioKlinis(codes: number[]) {
  if (codes.length === 0) return "";
  const regio = codes.map(regioGigi);
  const sama = <K extends keyof (typeof regio)[number]>(k: K) =>
    regio.every((r) => r[k] === regio[0][k]) ? regio[0][k] : null;
  const segmen = sama("segmen");
  const sisi = sama("sisi");
  const rahang = sama("rahang");
  const parts = [
    segmen === "DEPAN" ? "anterior" : segmen === "BELAKANG" ? "posterior" : null,
    sisi?.toLowerCase(),
    rahang?.toLowerCase(),
  ].filter(Boolean);
  return parts.length ? `regio ${parts.join(" ")}` : "";
}

// ---------------------------------------------------------------------------
// Label & lokasi
// ---------------------------------------------------------------------------

const lower = (s: string) => s.toLowerCase();

function joinDan(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

export function isAreaOdontogram(area: string | null | undefined) {
  return (AREA_ODONTOGRAM as readonly string[]).includes(area ?? "");
}

export function isAreaWajah(area: string | null | undefined) {
  return (AREA_WAJAH as readonly string[]).includes(area ?? "");
}

export function jenisKeluhanLabels(k: Pick<KeluhanData, "jenis" | "jenisLainnya">) {
  return k.jenis.map((j) =>
    j === "LAINNYA" && k.jenisLainnya
      ? k.jenisLainnya
      : labelOf(JENIS_KELUHAN_OPTIONS, j)
  );
}

/** Regio pilihan pasien dalam bahasa awam, mis. "rahang bawah, sisi kanan". */
export function regioPasienText(
  k: Pick<KeluhanData, "regioRahang" | "regioSisi" | "regioSegmen">
) {
  return [
    labelOf(REGIO_RAHANG_OPTIONS, k.regioRahang),
    labelOf(REGIO_SISI_OPTIONS, k.regioSisi),
    labelOf(REGIO_SEGMEN_OPTIONS, k.regioSegmen),
  ]
    .filter(Boolean)
    .map(lower)
    .join(", ");
}

/** Lokasi singkat untuk label daftar kasus, mis. "46", "lidah", "sendi rahang kanan". */
export function lokasiSingkat(k: KeluhanData) {
  if (isAreaOdontogram(k.area)) {
    const prefix = k.area === "GUSI" ? "gusi " : "";
    if (!k.tidakYakin && k.gigi.length > 0) return prefix + k.gigi.join(", ");
    const regio = regioPasienText(k);
    return regio ? `${lower(labelOf(AREA_OPTIONS, k.area))} ${regio}` : lower(labelOf(AREA_OPTIONS, k.area));
  }
  if (isAreaWajah(k.area)) {
    const area = k.area === "SENDI_RAHANG" ? "sendi rahang" : "wajah/leher";
    if (k.sisiWajah === "KEDUA") return `${area} kedua sisi`;
    return k.sisiWajah ? `${area} ${lower(k.sisiWajah)}` : area;
  }
  return lower(
    labelOf(TITIK_JARINGAN_LUNAK_OPTIONS, k.titikJaringanLunak) ||
      labelOf(AREA_OPTIONS, k.area)
  );
}

/** Label pendek satu keluhan, mis. "Gigi sakit · 46". */
export function labelKeluhan(k: KeluhanData) {
  const first = k.jenis[0];
  const jenis =
    first === "LAINNYA" && k.jenisLainnya
      ? k.jenisLainnya
      : JENIS_KELUHAN_OPTIONS.find((o) => o.value === first)?.singkat ?? "Keluhan";
  const lokasi = lokasiSingkat(k);
  return lokasi ? `${jenis} · ${lokasi}` : jenis;
}

/** Lokasi lengkap dalam bahasa awam (untuk pasien & kolom `lokasiSakit`). */
export function formatLokasi(k: KeluhanData) {
  const area = labelOf(AREA_OPTIONS, k.area);
  if (isAreaOdontogram(k.area)) {
    if (!k.tidakYakin && k.gigi.length > 0) {
      const gigi = k.gigi.map((c) => `${c} (${namaGigi(c)})`).join(", ");
      return k.area === "GUSI" ? `Gusi di sekitar gigi ${gigi}` : `Gigi ${gigi}`;
    }
    const regio = regioPasienText(k);
    return regio ? `${area} di ${regio} — tidak yakin giginya yang mana` : area;
  }
  if (isAreaWajah(k.area)) {
    const sisi = labelOf(SISI_WAJAH_OPTIONS, k.sisiWajah);
    return sisi ? `${area}, ${lower(sisi)}` : area;
  }
  return labelOf(TITIK_JARINGAN_LUNAK_OPTIONS, k.titikJaringanLunak) || area;
}

/** Lokasi dengan istilah klinis (untuk ringkasan koas/dosen). */
export function lokasiKlinis(k: KeluhanData) {
  if (isAreaOdontogram(k.area) && !k.tidakYakin && k.gigi.length > 0) {
    const regio = regioKlinis(k.gigi);
    const gigi = `gigi ${k.gigi.join(", ")}${regio ? ` (${regio})` : ""}`;
    return k.area === "GUSI" ? `gusi sekitar ${gigi}` : gigi;
  }
  if (isAreaOdontogram(k.area) && k.tidakYakin) {
    const jenisGigi = k.jenisGigi === "SUSU" ? "SUSU" : "DEWASA";
    const regio = regioKlinis(gigiDalamRegio(jenisGigi, k));
    const area = lower(labelOf(AREA_OPTIONS, k.area));
    return regio ? `${area} ${regio} (pasien tidak yakin giginya)` : area;
  }
  return lower(formatLokasi(k));
}

export function formatDurasi(angka: number | null, satuan: string | null) {
  if (!angka || !satuan) return "";
  return `${angka} ${lower(labelOf(DURASI_SATUAN_OPTIONS, satuan))}`;
}

export function durasiHari(angka: number | null, satuan: string | null) {
  const faktor = DURASI_SATUAN_OPTIONS.find((o) => o.value === satuan)?.hari;
  return angka && faktor ? angka * faktor : 0;
}

// ---------------------------------------------------------------------------
// Prioritas & saran kategori
// ---------------------------------------------------------------------------

const JENIS_LESI = ["SARIAWAN", "BENJOLAN"];
const GEJALA_INFEKSI = ["GUSI_BENGKAK", "NANAH"];
const BATAS_LESI_HARI = 14;

type DataPrioritas = Pick<
  AnamnesaData,
  "skalaNyeri" | "nyeriBangunTidur" | "gejalaLain" | "tandaBahaya" | "durasiAngka" | "durasiSatuan"
> & { keluhan: Pick<KeluhanData, "jenis">[] };

/** Skrining yang diisi dengan formulir terstruktur (v2) dan punya data keluhan. */
export function isAnamnesaTerstruktur(s: { versiForm: number; keluhan: readonly unknown[] }) {
  return s.versiForm >= 2 && s.keluhan.length > 0;
}

/**
 * Prioritas yang dipakai tampilan & hitungan. Skrining lama (v1) dengan nyeri
 * berat tetap dianggap SEGERA walau kolom `prioritas`-nya belum ter-backfill
 * (mis. dibuat oleh kode lama setelah migrasi, atau dari seed).
 */
export function prioritasEfektif(s: {
  versiForm: number;
  prioritas: Prioritas;
  skalaNyeri: number | null;
}): Prioritas {
  if (s.versiForm < 2 && (s.skalaNyeri ?? 0) >= 7) return "SEGERA";
  return s.prioritas;
}

/** Alasan-alasan urgensi; urutan = urutan tampil di badge. */
export function alasanPrioritas(d: DataPrioritas): { prioritas: Prioritas; alasan: string[] } {
  const segera: string[] = [];
  if (d.tandaBahaya.length > 0) {
    const labels = d.tandaBahaya.map(
      (kode) => TANDA_BAHAYA.find((t) => t.value === kode)?.singkat ?? kode
    );
    segera.push(`tanda bahaya: ${labels.join(", ")}`);
  }
  if ((d.skalaNyeri ?? 0) >= 7) segera.push(`skala nyeri ${d.skalaNyeri}`);
  const infeksi = d.gejalaLain.filter((g) => GEJALA_INFEKSI.includes(g));
  if (d.nyeriBangunTidur && infeksi.length > 0) {
    const tanda = infeksi.map((g) => (g === "GUSI_BENGKAK" ? "bengkak" : "nanah"));
    segera.push(`nyeri membangunkan tidur disertai ${joinDan(tanda)}`);
  }
  if (segera.length > 0) return { prioritas: "SEGERA", alasan: segera };

  // Durasi hanya diisi untuk keluhan utama, jadi aturan lesi hanya berlaku bila
  // sariawan/benjolan adalah keluhan utama (keluhan tambahan tak punya durasi).
  const lesiUtama = d.keluhan[0]?.jenis.some((j) => JENIS_LESI.includes(j)) ?? false;
  if (lesiUtama && durasiHari(d.durasiAngka, d.durasiSatuan) >= BATAS_LESI_HARI) {
    return {
      prioritas: "EVALUASI_LESI",
      alasan: ["sariawan/benjolan tidak sembuh selama 2 minggu atau lebih"],
    };
  }
  return { prioritas: "RUTIN", alasan: [] };
}

export function hitungPrioritas(d: DataPrioritas): Prioritas {
  return alasanPrioritas(d).prioritas;
}

type Kategori = (typeof KATEGORI_OPTIONS)[number];

/** Saran kategori awal untuk koas (tetap bisa diganti di form tinjauan). */
export function saranKategori(d: Pick<AnamnesaData, "tandaBahaya" | "keluhan">): Kategori {
  const k = d.keluhan[0];
  if (!k) return "Lainnya";
  const has = (...kode: string[]) => k.jenis.some((j) => kode.includes(j));

  if (d.tandaBahaya.includes("TRAUMA") || d.tandaBahaya.includes("BENGKAK_MENYEBAR")) {
    return "Bedah Mulut";
  }
  if (k.jenisGigi === "SUSU") return "Kedokteran Gigi Anak";
  if (has("SARIAWAN", "BENJOLAN")) return "Penyakit Mulut";
  if (k.area === "WAJAH_LEHER") return "Bedah Mulut";
  if (k.area === "SENDI_RAHANG" || has("GIGI_TIRUAN")) return "Prostodonsia";
  if (has("SUSUNAN_TIDAK_RAPI")) return "Ortodonsia";
  if (k.area === "GUSI") return "Periodonsia";
  if (has("GIGI_SAKIT", "GIGI_BERLUBANG", "GIGI_PATAH")) return "Konservasi Gigi";
  if (has("GUSI_BENGKAK", "GUSI_BERDARAH", "GIGI_GOYANG", "BAU_MULUT")) return "Periodonsia";
  if (!isAreaOdontogram(k.area)) return "Penyakit Mulut";
  return "Lainnya";
}

// ---------------------------------------------------------------------------
// Skala nyeri
// ---------------------------------------------------------------------------

export type TingkatNyeri = "TIDAK_SAKIT" | "RINGAN" | "SEDANG" | "BERAT";

/** Satu-satunya sumber ambang skala nyeri (slider pasien & PainPill koas). */
export function tingkatNyeri(skala: number): TingkatNyeri {
  if (skala >= 7) return "BERAT";
  if (skala >= 4) return "SEDANG";
  if (skala >= 1) return "RINGAN";
  return "TIDAK_SAKIT";
}

// ---------------------------------------------------------------------------
// Teks turunan
// ---------------------------------------------------------------------------

/**
 * Kalimat "Karakter nyeri", mis. "Berdenyut, spontan, malam hari, membangunkan
 * tidur". String kosong bila nyeri ada tetapi detailnya tidak dijawab.
 */
export function karakterNyeri(d: AnamnesaData) {
  if (!d.skalaNyeri) return "Tidak ada rasa sakit";
  const parts: string[] = [];
  if (d.jenisNyeri) parts.push(labelOf(JENIS_NYERI_OPTIONS, d.jenisNyeri));
  if (d.polaNyeri === "SPONTAN") parts.push("spontan");
  if (d.polaNyeri === "DIPICU") {
    const pemicu = labelsOf(PEMICU_NYERI_OPTIONS, d.pemicuNyeri).map(lower);
    parts.push(pemicu.length ? `dipicu ${pemicu.join(", ")}` : "saat dipicu");
    if (d.lamaNyeriPemicu) parts.push(lower(labelOf(LAMA_NYERI_PEMICU_OPTIONS, d.lamaNyeriPemicu)));
  }
  if (d.waktuNyeri.length) {
    const waktu = labelsOf(WAKTU_NYERI_OPTIONS, d.waktuNyeri).map(lower);
    parts.push(d.waktuNyeri.includes("SEPANJANG_HARI") ? "sepanjang hari" : `${joinDan(waktu)} hari`);
  }
  if (d.nyeriBangunTidur === true) parts.push("membangunkan tidur");
  if (d.nyeriBangunTidur === false) parts.push("tidak membangunkan tidur");
  const text = parts.join(", ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export function riwayatPerawatanText(d: Pick<AnamnesaData, "riwayatPerawatan">) {
  if (d.riwayatPerawatan.includes("BELUM_PERNAH")) return "Belum pernah dirawat";
  if (d.riwayatPerawatan.includes("TIDAK_TAHU")) return "Tidak tahu";
  const labels = labelsOf(RIWAYAT_PERAWATAN_OPTIONS, d.riwayatPerawatan);
  return labels.length ? labels.join(", ") : "-";
}

export function dampakText(d: Pick<AnamnesaData, "dampak">) {
  if (d.dampak.includes("TIDAK_MENGGANGGU")) return "Tidak mengganggu kegiatan";
  const labels = labelsOf(DAMPAK_OPTIONS, d.dampak).map(lower);
  return labels.length ? `Mengganggu ${joinDan(labels)}` : "-";
}

export function upayaText(d: Pick<AnamnesaData, "upaya" | "keteranganObat">) {
  if (d.upaya.includes("BELUM")) return "Belum melakukan apa pun";
  const parts = d.upaya.map((u) =>
    u === "MINUM_OBAT" && d.keteranganObat
      ? `${labelOf(UPAYA_OPTIONS, u)} (${d.keteranganObat})`
      : labelOf(UPAYA_OPTIONS, u)
  );
  return parts.length ? parts.join("; ") : "-";
}

export function gejalaLainLabels(d: Pick<AnamnesaData, "gejalaLain">) {
  return labelsOf(
    GEJALA_LAIN_OPTIONS,
    d.gejalaLain.filter((g) => g !== "TIDAK_ADA")
  );
}

export function tandaBahayaLabels(d: Pick<AnamnesaData, "tandaBahaya">) {
  return d.tandaBahaya.map(
    (kode) => TANDA_BAHAYA.find((t) => t.value === kode)?.singkat ?? kode
  );
}

/** Paragraf "Ringkasan otomatis" untuk koas/dosen (tidak disimpan di DB). */
export function buildRingkasan(d: AnamnesaData) {
  const [utama, ...lain] = d.keluhan;
  if (!utama) return "";
  const s: string[] = [];

  const jenis = joinDan(jenisRingkasan(utama));
  let kalimat = `Keluhan utama ${jenis ? `${jenis} ` : ""}pada ${lokasiKlinis(utama)}`;
  const durasi = formatDurasi(d.durasiAngka, d.durasiSatuan);
  if (durasi) kalimat += ` sejak ${durasi} yang lalu`;
  if (d.onset && d.onset !== "TIDAK_INGAT") kalimat += `, onset ${lower(labelOf(ONSET_OPTIONS, d.onset))}`;
  if (d.perkembangan) kalimat += `, ${lower(labelOf(PERKEMBANGAN_OPTIONS, d.perkembangan))}`;
  s.push(`${kalimat}.`);

  if (d.skalaNyeri) {
    const detail = [lower(karakterNyeri(d))];
    if (utama.sebaran !== "SATU_TITIK") detail.push(lower(labelOf(SEBARAN_OPTIONS, utama.sebaran)));
    const nyeri = detail.filter(Boolean).join(", ");
    if (nyeri) s.push(`Nyeri ${nyeri}.`);
    s.push(`Skala nyeri ${d.skalaNyeri}/10.`);
  } else {
    s.push("Tidak ada rasa sakit (skala 0/10).");
    if (utama.sebaran !== "SATU_TITIK") {
      s.push(`Keluhan ${lower(labelOf(SEBARAN_OPTIONS, utama.sebaran))}.`);
    }
  }

  const gejala = gejalaLainLabels(d).map(lower);
  if (gejala.length) s.push(`Disertai ${joinDan(gejala)}.`);

  if (d.riwayatPerawatan.length) {
    const r = riwayatPerawatanText(d);
    s.push(
      d.riwayatPerawatan.includes("TIDAK_TAHU")
        ? "Riwayat perawatan tidak diketahui."
        : d.riwayatPerawatan.includes("BELUM_PERNAH")
          ? `${r}.`
          : `Riwayat perawatan: ${lower(r)}.`
    );
  }
  if (d.dampak.length) s.push(`${dampakText(d)}.`);
  if (d.upaya.length) {
    const u = upayaText(d);
    // Cek kodenya, bukan teksnya: keterangan obat bisa saja diawali "Belum".
    s.push(d.upaya.includes("BELUM") ? `${u}.` : `Upaya: ${u}.`);
  }

  const bahaya = tandaBahayaLabels(d);
  s.push(bahaya.length ? `TANDA BAHAYA: ${bahaya.join(", ")}.` : "Tanda bahaya tidak ada.");

  if (lain.length) {
    const daftar = lain.map((k) => {
      const jenisLain = joinDan(jenisRingkasan(k));
      return `${jenisLain ? `${jenisLain} ` : ""}pada ${lokasiKlinis(k)}`;
    });
    s.push(`Keluhan lain: ${daftar.join("; ")}.`);
  }
  return s.join(" ");
}

/** Jenis keluhan untuk kalimat ringkasan: label opsi dikecilkan, isian bebas apa adanya. */
function jenisRingkasan(k: Pick<KeluhanData, "jenis" | "jenisLainnya">) {
  return k.jenis.map((j) =>
    j === "LAINNYA" && k.jenisLainnya
      ? k.jenisLainnya
      : lower(labelOf(JENIS_KELUHAN_OPTIONS, j))
  );
}
