-- Persetujuan Penggunaan: waktu pasien menekan "Setuju dan Lanjutkan" sebelum
-- mengisi skrining. Idempoten — aman dijalankan ulang.
--
-- Riwayat prisma/migrations sudah tidak sinkron dengan DB, jadi perubahan skema
-- diterapkan lewat SQL ini (JANGAN `prisma migrate dev` / `db push`).
-- Bentuk kolom mengikuti output `prisma migrate diff` agar sesuai schema.prisma.
--
-- WAJIB diterapkan SEBELUM deploy atau `prisma generate` apa pun yang memuat
-- kolom ini: Prisma Client membaca SEMUA kolom Skrining pada setiap query, jadi
-- tanpa kolom ini dashboard, riwayat, dan daftar kasus ikut error (P2022).
--
-- Sudah diterapkan ke DB Supabase pada 2026-11-03.

BEGIN;

ALTER TABLE "Skrining"
  ADD COLUMN IF NOT EXISTS "persetujuanAt" TIMESTAMP(3);

COMMIT;
