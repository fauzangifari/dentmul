import { hapusAkunUji, izinTulisDb } from "./support/db";

export default async function globalSetup() {
  if (!izinTulisDb()) {
    throw new Error(
      [
        "Tes E2E membuat akun, skrining, dan foto sungguhan di database pada .env (bukan localhost).",
        "Semua data uji (email e2e-…@dentmul.test) dihapus otomatis setelah tes selesai.",
        "Bila memang disengaja, jalankan dengan izin eksplisit, mis. di PowerShell:",
        "  $env:E2E_ALLOW_DB_WRITE='1'; npm run test:e2e",
      ].join("\n")
    );
  }

  // Sisa data dari run yang terhenti di tengah jalan.
  const sisa = await hapusAkunUji();
  if (sisa.akun > 0) {
    console.log(`[e2e] Membersihkan ${sisa.akun} akun uji sisa run sebelumnya.`);
  }
}
