import { expect, test, type Page } from "@playwright/test";
import { TANDA_BAHAYA } from "@/features/skrining/constants";
import { ambilSkriningTerbaru, ambilUser, emailUji } from "./support/db";

// Alur lengkap pasien baru: daftar akun → keluar → masuk lagi → isi skrining
// 5 langkah (dengan 2 keluhan, tanda bahaya, dan foto) → lihat riwayat &
// detail → cek data tersimpan di database. Data uji dihapus oleh
// global-teardown.

// PNG 1×1 piksel yang valid — lolos pemeriksaan magic bytes di /api/upload.
const FOTO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

const CERITA_UTAMA = "[UJI E2E] Geraham bawah kanan nyeri berdenyut sampai ke telinga.";
const CERITA_LAIN = "[UJI E2E] Sariawan di lidah, perih saat makan.";
const KETERANGAN_OBAT = "Parasetamol 500 mg, sedikit membantu";

/** Pilihan tunggal (role="radio") di dalam grup berlabel `grup`. */
function pilih(page: Page, grup: string | RegExp, opsi: string, urutan = 0) {
  return page
    .getByRole("radiogroup", { name: grup, exact: typeof grup === "string" })
    .nth(urutan)
    .getByRole("radio", { name: opsi, exact: true })
    .click();
}

/** Pilihan ganda (tombol aria-pressed) di dalam grup berlabel `grup`. */
function centang(page: Page, grup: RegExp, opsi: string, urutan = 0) {
  return page
    .getByRole("group", { name: grup })
    .nth(urutan)
    .getByRole("button", { name: opsi, exact: true })
    .click();
}

function selanjutnya(page: Page) {
  return page.getByRole("button", { name: "Selanjutnya" }).click();
}

function judulLangkah(page: Page, judul: string) {
  return expect(page.getByRole("heading", { name: judul, exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  // Indikator dev Next.js (<nextjs-portal>, hanya ada di `next dev`) menutupi
  // tab bar bawah di ponsel sehingga tombol seperti "Keluar" tak bisa diklik.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.append(style);
    });
  });
});

test("pasien baru mendaftar, masuk, mengirim skrining, dan melihat hasilnya", async ({
  page,
}, testInfo) => {
  const akun = {
    name: "Uji Pasien E2E",
    email: emailUji(testInfo.project.name),
    password: "rahasia-e2e-123",
    // 16 digit, diawali 99 (bukan kode provinsi) agar tidak bentrok dengan NIK asli.
    nik: `99${Date.now()}${testInfo.project.name === "ponsel" ? 2 : 1}`,
    noTelepon: `0812${String(Date.now()).slice(-8)}`,
    tanggalLahir: "1995-04-17",
    jenisKelamin: { value: "PEREMPUAN", label: "Perempuan" },
    alamat: "Jl. Uji Coba No. 1, Samarinda",
  };

  await test.step("halaman pasien tertutup sebelum login", async () => {
    await page.goto("/pasien/skrining");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fpasien%2Fskrining/);
  });

  const isiFormDaftar = async () => {
    await page.goto("/register");
    await page.locator('[name="name"]').fill(akun.name);
    await page.locator('[name="nik"]').fill(akun.nik);
    await page.locator('[name="email"]').fill(akun.email);
    await page.locator('[name="noTelepon"]').fill(akun.noTelepon);
    await page.locator('[name="password"]').fill(akun.password);
    await page.locator('[name="tanggalLahir"]').fill(akun.tanggalLahir);
    await pilih(page, "Jenis Kelamin", akun.jenisKelamin.label);
    await page.locator('[name="alamat"]').fill(akun.alamat);
    await page.getByRole("button", { name: "Daftar sekarang" }).click();
  };

  await test.step("daftar akun baru → otomatis masuk ke dashboard", async () => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Daftar sekarang" }).click();
    await expect(page.getByText("Nama minimal 3 karakter")).toBeVisible();
    await expect(page.getByText("NIK harus tepat 16 digit angka")).toBeVisible();
    await expect(page.getByText("Jenis kelamin wajib dipilih")).toBeVisible();

    await isiFormDaftar();
    await expect(page).toHaveURL(/\/pasien\/dashboard$/);
    await expect(page.getByRole("heading", { name: /^Halo, Uji!/ })).toBeVisible();

    const user = await ambilUser(akun.email);
    expect(user).toMatchObject({
      name: akun.name,
      role: "PASIEN",
      nik: akun.nik,
      noTelepon: akun.noTelepon,
      jenisKelamin: akun.jenisKelamin.value,
      isActive: true,
    });
    expect(user?.password).toMatch(/^\$2[aby]\$/); // tersimpan sebagai hash bcrypt
  });

  await test.step("keluar, lalu email yang sama tidak bisa didaftarkan ulang", async () => {
    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await isiFormDaftar();
    await expect(page.getByText("Email sudah digunakan!")).toBeVisible();
  });

  await test.step("masuk dengan password salah ditolak, password benar berhasil", async () => {
    await page.goto("/login");
    await page.locator('[name="email"]').fill(akun.email);
    await page.locator('[name="password"]').fill("password-salah");
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page.getByText("Email atau password salah!")).toBeVisible();

    await page.locator('[name="password"]').fill(akun.password);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page).toHaveURL(/\/pasien\/dashboard$/);
  });

  await test.step("langkah 1: jenis dan lokasi keluhan", async () => {
    await page.getByRole("link", { name: "Mulai Skrining" }).first().click();
    await expect(page).toHaveURL(/\/pasien\/skrining$/);
    await judulLangkah(page, "Jenis dan Lokasi Keluhan");

    // Validasi: belum ada yang diisi.
    await selanjutnya(page);
    await expect(page.getByText("Pilih siapa yang mengisi formulir")).toBeVisible();
    await expect(page.getByText("Pilih minimal satu jenis keluhan")).toBeVisible();

    await pilih(page, /^Siapa yang mengisi/, "Saya sendiri");

    // Keluhan utama: gigi 46 sakit, menjalar.
    await centang(page, /^Apa yang Anda keluhkan/, "Gigi sakit atau ngilu");
    await pilih(page, /^Di bagian mana keluhannya/, "Gigi");
    await selanjutnya(page);
    await expect(page.getByText("Ketuk gigi yang dikeluhkan pada gambar")).toBeVisible();

    // Hanya satu odontogram yang tampil (lengkung penuh di layar lebar,
    // separuh sisi di ponsel) — getByRole mengabaikan yang tersembunyi.
    const gigi46 = page.getByRole("button", { name: /^Gigi 46,/ });
    await gigi46.click();
    await expect(gigi46).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/^Dipilih: /)).toBeVisible();

    await pilih(page, /^Apakah keluhan hanya di satu tempat/, "Menjalar ke tempat lain (telinga, kepala, leher)");
    await page.getByLabel(/^Ceritakan keluhan Anda/).first().fill(CERITA_UTAMA);

    // Keluhan kedua: sariawan di lidah.
    await page.getByRole("button", { name: /^Tambah keluhan lain/ }).click();
    await expect(page.getByRole("heading", { name: "Keluhan lain #2" })).toBeVisible();
    await centang(page, /^Apa yang Anda keluhkan/, "Sariawan atau luka di mulut", 1);
    await pilih(page, /^Di bagian mana keluhannya/, "Lidah", 1);
    await pilih(page, /^Apakah keluhan hanya di satu tempat/, "Hanya di satu titik", 1);
    await page.getByLabel(/^Ceritakan keluhan Anda/).nth(1).fill(CERITA_LAIN);

    await selanjutnya(page);
  });

  await test.step("langkah 2: detail keluhan dan tanda bahaya", async () => {
    await judulLangkah(page, "Detail Keluhan");
    await expect(page.getByText("Keluhan utama yang sedang Anda jelaskan")).toBeVisible();

    // Validasi: durasi, skala nyeri, dan tanda bahaya wajib.
    await selanjutnya(page);
    await expect(page.getByText("Geser untuk memilih skala nyeri")).toBeVisible();
    await expect(page.getByText("Jawab semua pertanyaan tanda bahaya.")).toBeVisible();

    await page.getByLabel(/^Sudah berapa lama keluhan ini/).fill("3");
    await pilih(page, "Satuan waktu", "Hari");
    await pilih(page, /^Bagaimana keluhan mulai muncul/, "Tiba-tiba");
    await pilih(page, /^Bagaimana perkembangannya/, "Makin parah");
    await centang(page, /^Apakah gigi atau area ini pernah dirawat/, "Belum pernah");

    await page.getByRole("slider", { name: /^Skala nyeri/ }).fill("7");
    await expect(page.getByText("Skala 7 dari 10")).toBeVisible();

    // Pertanyaan lanjutan muncul karena nyeri > 0.
    await pilih(page, /^Seperti apa rasa sakitnya/, "Berdenyut");
    await pilih(page, /^Kapan rasa sakit muncul/, "Muncul sendiri tanpa sebab");
    await centang(page, /^Kapan paling terasa/, "Malam");
    await pilih(page, /^Apakah sakitnya membangunkan Anda/, "Ya");

    await centang(page, /^Apakah keluhan mengganggu kegiatan/, "Makan atau mengunyah");
    await centang(page, /^Apa yang sudah Anda lakukan/, "Minum obat");
    await page.getByLabel("Nama obat dan hasilnya").fill(KETERANGAN_OBAT);
    await centang(page, /^Gejala lain/, "Gusi di sekitarnya bengkak");

    for (const t of TANDA_BAHAYA) {
      await pilih(page, t.label, t.value === "DEMAM" ? "Ya" : "Tidak");
    }
    await expect(
      page.getByText("Segera periksakan diri, jangan menunggu hasil skrining")
    ).toBeVisible();

    await selanjutnya(page);
  });

  await test.step("langkah 3: riwayat medis", async () => {
    await judulLangkah(page, "Riwayat Medis");
    await page.getByLabel("Riwayat penyakit (mis. diabetes, jantung)").fill("Hipertensi ringan");
    await selanjutnya(page);
  });

  await test.step("langkah 4: unggah foto", async () => {
    await judulLangkah(page, "Foto Rongga Mulut");
    await page.getByLabel("Pilih atau ambil foto rongga mulut").setInputFiles({
      name: "foto-uji.png",
      mimeType: "image/png",
      buffer: FOTO_PNG,
    });
    await expect(page.getByRole("button", { name: "Hapus foto 1" })).toBeVisible();
    await selanjutnya(page);
  });

  await test.step("langkah 5: review lalu kirim", async () => {
    await judulLangkah(page, "Review dan Kirim");
    await expect(page.getByText("Gigi sakit atau ngilu").first()).toBeVisible();
    await expect(page.getByText("Sariawan atau luka di mulut").first()).toBeVisible();
    await expect(page.getByText("Hipertensi ringan")).toBeVisible();

    await page.getByRole("button", { name: "Kirim Skrining" }).click();
    await expect(page).toHaveURL(/\/pasien\/riwayat\?success=1$/);
    await expect(page.getByText(/Silakan tunggu koas piket/)).toBeVisible();
  });

  await test.step("data tersimpan lengkap di database", async () => {
    const s = await ambilSkriningTerbaru(akun.email);
    expect(s).toMatchObject({
      status: "MENUNGGU",
      versiForm: 2,
      pengisi: "PASIEN_SENDIRI",
      // Nyeri 7 dan tanda bahaya "demam" → perlu perhatian segera.
      prioritas: "SEGERA",
      keluhanUtama: "Gigi sakit · 46 (+1 keluhan lain)",
      durasiKeluhan: "3 hari",
      durasiAngka: 3,
      durasiSatuan: "HARI",
      skalaNyeri: 7,
      upaya: ["MINUM_OBAT"],
      keteranganObat: KETERANGAN_OBAT,
      tandaBahaya: ["DEMAM"],
      riwayatPenyakit: "Hipertensi ringan",
      jumlahFoto: 1,
    });
    expect(s?.keluhan).toMatchObject([
      { urutan: 0, jenis: ["GIGI_SAKIT"], area: "GIGI", gigi: [46], sebaran: "MENJALAR", cerita: CERITA_UTAMA },
      { urutan: 1, jenis: ["SARIAWAN"], area: "LIDAH", titikJaringanLunak: "LIDAH", gigi: [], sebaran: "SATU_TITIK", cerita: CERITA_LAIN },
    ]);
  });

  await test.step("riwayat → detail skrining", async () => {
    await page.getByRole("link", { name: /Gigi sakit · 46 \(\+1 keluhan lain\)/ }).click();
    await expect(page).toHaveURL(/\/pasien\/riwayat\/[^/?]+$/);
    await expect(page.getByRole("heading", { name: "Detail Skrining" })).toBeVisible();
    await expect(page.getByText("Menunggu", { exact: true })).toBeVisible();
    await expect(page.getByText(/Anda melaporkan tanda bahaya: .*demam/)).toBeVisible();
    await expect(page.getByText(CERITA_UTAMA)).toBeVisible();
    await expect(page.getByText(CERITA_LAIN)).toBeVisible();
  });

  await test.step("/api/upload menolak file yang bukan gambar", async () => {
    const s = await ambilSkriningTerbaru(akun.email);
    const res = await page.request.post("/api/upload", {
      multipart: {
        // Mengaku PNG lewat nama & tipe, tetapi isinya teks biasa.
        file: { name: "palsu.png", mimeType: "image/png", buffer: Buffer.from("bukan gambar") },
        skriningId: s!.id,
      },
    });
    expect(res.status()).toBe(400);
    expect((await ambilSkriningTerbaru(akun.email))?.jumlahFoto).toBe(1);
  });
});
