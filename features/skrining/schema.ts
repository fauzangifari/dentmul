import { z } from "zod";
import {
  AREA_OPTIONS,
  DAMPAK_EKSKLUSIF,
  DAMPAK_OPTIONS,
  DURASI_SATUAN_OPTIONS,
  GEJALA_LAIN_EKSKLUSIF,
  GEJALA_LAIN_OPTIONS,
  JENIS_GIGI_OPTIONS,
  JENIS_KELUHAN_OPTIONS,
  JENIS_NYERI_OPTIONS,
  LAMA_NYERI_PEMICU_OPTIONS,
  MAX_KELUHAN,
  ONSET_OPTIONS,
  PEMICU_NYERI_OPTIONS,
  PENGISI_OPTIONS,
  PERKEMBANGAN_OPTIONS,
  POLA_NYERI_OPTIONS,
  REGIO_RAHANG_OPTIONS,
  REGIO_SEGMEN_OPTIONS,
  REGIO_SISI_OPTIONS,
  RIWAYAT_PERAWATAN_EKSKLUSIF,
  RIWAYAT_PERAWATAN_OPTIONS,
  SEBARAN_OPTIONS,
  SISI_WAJAH_OPTIONS,
  TANDA_BAHAYA,
  TITIK_JARINGAN_LUNAK_OPTIONS,
  UPAYA_EKSKLUSIF,
  UPAYA_OPTIONS,
  WAKTU_NYERI_EKSKLUSIF,
  WAKTU_NYERI_OPTIONS,
  YA_TIDAK_OPTIONS,
  areaDariTitik,
} from "@/features/skrining/constants";
import {
  isAreaOdontogram,
  isAreaWajah,
  isGigiValid,
  type AnamnesaData,
  type KeluhanData,
} from "@/features/skrining/anamnesa";

/** z.enum dari daftar opsi `{ value, label }`. */
function kode<const T extends readonly { value: string }[]>(options: T, error?: string) {
  const values = options.map((o) => o.value) as unknown as [
    T[number]["value"],
    ...T[number]["value"][],
  ];
  return z.enum(values, error ? { error } : undefined);
}

/** Array kode pilihan ganda; panjangnya dibatasi jumlah opsi. */
function daftarKode<const T extends readonly { value: string }[]>(options: T) {
  return z.array(kode(options)).max(options.length);
}

/** Batas panjang isian teks — juga dipasang sebagai `maxLength` di input. */
export const BATAS_JENIS_LAINNYA = 100;
export const BATAS_KETERANGAN_OBAT = 200;
export const BATAS_RIWAYAT_MEDIS = 1000;

const maksimal = (n: number) => `Maksimal ${n} karakter`;

/** Isian riwayat medis bebas (boleh kosong). */
const teksRiwayat = z.string().max(BATAS_RIWAYAT_MEDIS, maksimal(BATAS_RIWAYAT_MEDIS)).optional();

export const KeluhanSchema = z
  .object({
    jenis: daftarKode(JENIS_KELUHAN_OPTIONS).min(1, "Pilih minimal satu jenis keluhan"),
    jenisLainnya: z
      .string()
      .trim()
      .max(BATAS_JENIS_LAINNYA, maksimal(BATAS_JENIS_LAINNYA))
      .optional(),
    area: kode(AREA_OPTIONS, "Pilih bagian mulut yang dikeluhkan"),
    jenisGigi: kode(JENIS_GIGI_OPTIONS),
    // 32 = jumlah gigi dewasa; gigi susu hanya 20.
    gigi: z.array(z.number().int()).max(32),
    tidakYakin: z.boolean(),
    regioRahang: kode(REGIO_RAHANG_OPTIONS).optional(),
    regioSisi: kode(REGIO_SISI_OPTIONS).optional(),
    regioSegmen: kode(REGIO_SEGMEN_OPTIONS).optional(),
    titikJaringanLunak: kode(TITIK_JARINGAN_LUNAK_OPTIONS).optional(),
    sisiWajah: kode(SISI_WAJAH_OPTIONS).optional(),
    sebaran: kode(SEBARAN_OPTIONS, "Pilih apakah keluhan hanya di satu tempat"),
    cerita: z
      .string()
      .trim()
      .min(5, "Ceritakan keluhan Anda minimal 5 karakter")
      .max(1000, "Cerita maksimal 1000 karakter"),
  })
  // `when`: tetap jalankan cek lokasi walau field lain (mis. sebaran) belum
  // dipilih, agar semua pesan error tampil sekaligus. Karena itu field dibaca
  // secara defensif.
  .superRefine((k, ctx) => {
    const jenis = k.jenis ?? [];
    const gigi = k.gigi ?? [];
    if (jenis.includes("LAINNYA") && !k.jenisLainnya) {
      ctx.addIssue({
        code: "custom",
        path: ["jenisLainnya"],
        message: "Tuliskan keluhan lainnya",
      });
    }

    if (!k.area) return;
    if (isAreaOdontogram(k.area)) {
      if (k.tidakYakin) {
        if (!k.regioRahang && !k.regioSisi && !k.regioSegmen) {
          ctx.addIssue({
            code: "custom",
            path: ["gigi"],
            message: "Pilih minimal satu bagian mulut",
          });
        }
      } else if (gigi.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["gigi"],
          message: "Ketuk gigi yang dikeluhkan pada gambar",
        });
      } else if (!gigi.every((c) => isGigiValid(c, k.jenisGigi))) {
        ctx.addIssue({ code: "custom", path: ["gigi"], message: "Kode gigi tidak valid" });
      }
    } else if (isAreaWajah(k.area)) {
      if (!k.sisiWajah) {
        ctx.addIssue({
          code: "custom",
          path: ["sisiWajah"],
          message: "Pilih sisi yang dikeluhkan",
        });
      }
    } else if (!k.titikJaringanLunak) {
      ctx.addIssue({
        code: "custom",
        path: ["titikJaringanLunak"],
        message: "Ketuk area yang dikeluhkan pada gambar",
      });
    } else if (areaDariTitik(k.titikJaringanLunak) !== k.area) {
      ctx.addIssue({
        code: "custom",
        path: ["titikJaringanLunak"],
        message: "Area pada gambar tidak sesuai dengan bagian mulut yang dipilih",
      });
    }
  }, { when: (payload) => typeof payload.value === "object" && payload.value !== null });

const jawabTandaBahaya = z.enum(["YA", "TIDAK"], { error: "Jawab Ya atau Tidak" });

export const SkriningSchema = z.object({
  // Langkah 1
  pengisi: kode(PENGISI_OPTIONS, "Pilih siapa yang mengisi formulir"),
  keluhan: z
    .array(KeluhanSchema)
    .min(1, "Isi minimal satu keluhan")
    .max(MAX_KELUHAN, `Maksimal ${MAX_KELUHAN} keluhan`),

  // Langkah 2 — detail keluhan utama
  durasiAngka: z
    .number({ error: "Isi lama keluhan dengan angka" })
    .int("Isi lama keluhan dengan angka bulat")
    .min(1, "Lama keluhan minimal 1")
    .max(999, "Lama keluhan terlalu besar"),
  durasiSatuan: kode(DURASI_SATUAN_OPTIONS, "Pilih satuan waktu"),
  onset: kode(ONSET_OPTIONS).optional(),
  perkembangan: kode(PERKEMBANGAN_OPTIONS).optional(),
  riwayatPerawatan: daftarKode(RIWAYAT_PERAWATAN_OPTIONS),
  skalaNyeri: z
    .number({ error: "Geser untuk memilih skala nyeri" })
    .int()
    .min(0)
    .max(10),
  jenisNyeri: kode(JENIS_NYERI_OPTIONS).optional(),
  polaNyeri: kode(POLA_NYERI_OPTIONS).optional(),
  pemicuNyeri: daftarKode(PEMICU_NYERI_OPTIONS),
  lamaNyeriPemicu: kode(LAMA_NYERI_PEMICU_OPTIONS).optional(),
  waktuNyeri: daftarKode(WAKTU_NYERI_OPTIONS),
  nyeriBangunTidur: kode(YA_TIDAK_OPTIONS).optional(),
  dampak: daftarKode(DAMPAK_OPTIONS),
  upaya: daftarKode(UPAYA_OPTIONS),
  keteranganObat: z
    .string()
    .trim()
    .max(BATAS_KETERANGAN_OBAT, maksimal(BATAS_KETERANGAN_OBAT))
    .optional(),
  gejalaLain: daftarKode(GEJALA_LAIN_OPTIONS),
  // Record dengan kunci enum di Zod v4 bersifat lengkap: ke-7 pertanyaan wajib dijawab.
  tandaBahaya: z.record(kode(TANDA_BAHAYA), jawabTandaBahaya),

  // Langkah 3 — riwayat medis
  riwayatPenyakit: teksRiwayat,
  alergiObat: teksRiwayat,
  obatRutin: teksRiwayat,
  kebiasaanBuruk: teksRiwayat,
});

export type KeluhanFormInput = z.input<typeof KeluhanSchema>;
export type SkriningFormInput = z.input<typeof SkriningSchema>;
export type SkriningFormValues = z.output<typeof SkriningSchema>;

/** Field yang divalidasi sebelum pindah dari tiap langkah. */
export const STEP_FIELDS = {
  0: ["pengisi", "keluhan"],
  1: [
    "durasiAngka",
    "durasiSatuan",
    "onset",
    "perkembangan",
    "riwayatPerawatan",
    "skalaNyeri",
    "jenisNyeri",
    "polaNyeri",
    "pemicuNyeri",
    "lamaNyeriPemicu",
    "waktuNyeri",
    "nyeriBangunTidur",
    "dampak",
    "upaya",
    "keteranganObat",
    "gejalaLain",
    "tandaBahaya",
  ],
  2: ["riwayatPenyakit", "alergiObat", "obatRutin", "kebiasaanBuruk"],
} as const satisfies Record<number, readonly (keyof SkriningFormInput)[]>;

export function keluhanKosong(): KeluhanFormInput {
  // `area` & `sebaran` sengaja kosong sampai dipilih pasien.
  return {
    jenis: [],
    jenisLainnya: "",
    jenisGigi: "DEWASA",
    gigi: [],
    tidakYakin: false,
    cerita: "",
  } as unknown as KeluhanFormInput;
}

// ---------------------------------------------------------------------------
// Normalisasi: nilai form tervalidasi → bentuk kolom DB
// ---------------------------------------------------------------------------

/** Hapus duplikat; bila ada opsi eksklusif terpilih, hanya opsi itu yang disimpan. */
export function bersihkanEksklusif<T extends string>(values: readonly T[], eksklusif: readonly string[] = []) {
  const unik = [...new Set(values)];
  const ex = unik.find((v) => eksklusif.includes(v));
  return ex ? [ex] : unik;
}

export function normalisasiKeluhan(k: SkriningFormValues["keluhan"][number]): KeluhanData {
  const odontogram = isAreaOdontogram(k.area);
  const wajah = isAreaWajah(k.area);
  const regio = odontogram && k.tidakYakin;
  return {
    jenis: bersihkanEksklusif(k.jenis),
    jenisLainnya: k.jenis.includes("LAINNYA") ? k.jenisLainnya || null : null,
    area: k.area,
    jenisGigi: odontogram ? k.jenisGigi : null,
    gigi: odontogram && !k.tidakYakin ? [...new Set(k.gigi)].sort((a, b) => a - b) : [],
    tidakYakin: regio,
    regioRahang: regio ? k.regioRahang ?? null : null,
    regioSisi: regio ? k.regioSisi ?? null : null,
    regioSegmen: regio ? k.regioSegmen ?? null : null,
    titikJaringanLunak: !odontogram && !wajah ? k.titikJaringanLunak ?? null : null,
    sisiWajah: wajah ? k.sisiWajah ?? null : null,
    sebaran: k.sebaran,
    cerita: k.cerita,
  };
}

/**
 * Buang jawaban yang tidak relevan (mis. detail nyeri saat skala 0, pemicu saat
 * nyeri spontan) agar data tersimpan konsisten dengan yang tampil di form.
 */
export function normalisasiSkrining(v: SkriningFormValues): AnamnesaData {
  const adaNyeri = v.skalaNyeri > 0;
  const dipicu = adaNyeri && v.polaNyeri === "DIPICU";
  const upaya = bersihkanEksklusif(v.upaya, UPAYA_EKSKLUSIF);

  return {
    skalaNyeri: v.skalaNyeri,
    durasiAngka: v.durasiAngka,
    durasiSatuan: v.durasiSatuan,
    onset: v.onset ?? null,
    perkembangan: v.perkembangan ?? null,
    riwayatPerawatan: bersihkanEksklusif(v.riwayatPerawatan, RIWAYAT_PERAWATAN_EKSKLUSIF),
    jenisNyeri: adaNyeri ? v.jenisNyeri ?? null : null,
    polaNyeri: adaNyeri ? v.polaNyeri ?? null : null,
    pemicuNyeri: dipicu ? bersihkanEksklusif(v.pemicuNyeri) : [],
    lamaNyeriPemicu: dipicu ? v.lamaNyeriPemicu ?? null : null,
    waktuNyeri: adaNyeri ? bersihkanEksklusif(v.waktuNyeri, WAKTU_NYERI_EKSKLUSIF) : [],
    nyeriBangunTidur: adaNyeri && v.nyeriBangunTidur ? v.nyeriBangunTidur === "YA" : null,
    dampak: bersihkanEksklusif(v.dampak, DAMPAK_EKSKLUSIF),
    upaya,
    keteranganObat: upaya.includes("MINUM_OBAT") ? v.keteranganObat || null : null,
    gejalaLain: bersihkanEksklusif(v.gejalaLain, GEJALA_LAIN_EKSKLUSIF),
    tandaBahaya: TANDA_BAHAYA.filter((t) => v.tandaBahaya[t.value] === "YA").map((t) => t.value),
    keluhan: v.keluhan.map(normalisasiKeluhan),
  };
}
