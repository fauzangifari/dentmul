import { defineConfig, devices } from "@playwright/test";
import { izinTulisDb } from "./e2e/support/db";

// Port mengikuti NEXTAUTH_URL di .env (http://localhost:8000): redirect login
// Auth.js memakai origin itu, jadi server uji harus berjalan di port yang sama.
const PORT = 8000;
const baseURL = `http://localhost:${PORT}`;

// Tanpa izin, server tidak dinyalakan dan global-setup langsung menolak
// (lihat pesan di sana) — tidak perlu menunggu dev server dulu.

export default defineConfig({
  testDir: "./e2e",
  // Semua tes menulis ke database yang sama — jalankan berurutan.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  // Dev server mengompilasi tiap halaman & server action saat pertama dipakai,
  // dan bisa lambat di disk ini ("Slow filesystem detected") — beri waktu longgar.
  timeout: 10 * 60_000,
  expect: { timeout: 90_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    // Klik yang terhalang elemen lain cukup ditunggu 30 detik, bukan sampai
    // batas waktu tes (10 menit).
    actionTimeout: 30_000,
    locale: "id-ID",
    timezoneId: "Asia/Makassar",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Video butuh unduhan ffmpeg terpisah; trace sudah memuat cuplikan tiap langkah.
    video: "off",
  },
  projects: [
    // Memakai Chrome yang sudah terpasang — tidak perlu `playwright install`.
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "ponsel", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: izinTulisDb()
    ? {
        command: `npm run dev -- --port ${PORT}`,
        // Cukup tunggu port terbuka; kompilasi halaman pertama ditanggung tes.
        port: PORT,
        // Pakai dev server yang sudah jalan (mis. `bun run dev --port 8000`) bila ada.
        reuseExistingServer: true,
        timeout: 5 * 60_000,
      }
    : undefined,
});
