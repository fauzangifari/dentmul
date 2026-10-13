import { hapusAkunUji, izinTulisDb } from "./support/db";

export default async function globalTeardown() {
  // Tanpa izin, global-setup sudah menolak — jangan sentuh DB sama sekali.
  if (!izinTulisDb()) return;

  // E2E_KEEP_DATA=1: biarkan data uji untuk diperiksa manual (mis. di dashboard
  // koas). Data itu terhapus otomatis pada run berikutnya.
  if (process.env.E2E_KEEP_DATA === "1") {
    console.log("[e2e] E2E_KEEP_DATA=1 — data uji tidak dihapus.");
    return;
  }
  const { akun, skrining, foto } = await hapusAkunUji();
  console.log(`[e2e] Data uji dihapus: ${akun} akun, ${skrining} skrining, ${foto} foto.`);
}
