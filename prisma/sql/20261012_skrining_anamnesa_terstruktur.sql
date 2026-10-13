-- Skrining v2: anamnesis terstruktur (jenis & lokasi keluhan, detail keluhan,
-- tanda bahaya, prioritas). Idempoten — aman dijalankan ulang.
--
-- Riwayat prisma/migrations sudah tidak sinkron dengan DB, jadi perubahan skema
-- diterapkan lewat SQL ini (JANGAN `prisma migrate dev` / `db push`).
-- Bentuk kolom mengikuti output `prisma migrate diff` agar sesuai schema.prisma.

BEGIN;

-- Enum ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PengisiSkrining') THEN
    CREATE TYPE "PengisiSkrining" AS ENUM ('PASIEN_SENDIRI', 'ORANG_TUA_WALI');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrioritasSkrining') THEN
    CREATE TYPE "PrioritasSkrining" AS ENUM ('SEGERA', 'EVALUASI_LESI', 'RUTIN');
  END IF;
END $$;

-- Kolom baru Skrining --------------------------------------------------------
ALTER TABLE "Skrining"
  ADD COLUMN IF NOT EXISTS "versiForm"        INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "pengisi"          "PengisiSkrining" NOT NULL DEFAULT 'PASIEN_SENDIRI',
  ADD COLUMN IF NOT EXISTS "prioritas"        "PrioritasSkrining" NOT NULL DEFAULT 'RUTIN',
  ADD COLUMN IF NOT EXISTS "durasiAngka"      INTEGER,
  ADD COLUMN IF NOT EXISTS "durasiSatuan"     TEXT,
  ADD COLUMN IF NOT EXISTS "onset"            TEXT,
  ADD COLUMN IF NOT EXISTS "perkembangan"     TEXT,
  ADD COLUMN IF NOT EXISTS "riwayatPerawatan" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "jenisNyeri"       TEXT,
  ADD COLUMN IF NOT EXISTS "polaNyeri"        TEXT,
  ADD COLUMN IF NOT EXISTS "pemicuNyeri"      TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "lamaNyeriPemicu"  TEXT,
  ADD COLUMN IF NOT EXISTS "waktuNyeri"       TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "nyeriBangunTidur" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "dampak"           TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "upaya"            TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "keteranganObat"   TEXT,
  ADD COLUMN IF NOT EXISTS "gejalaLain"       TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "tandaBahaya"      TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Tabel KeluhanSkrining -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "KeluhanSkrining" (
  "id"                 TEXT NOT NULL,
  "skriningId"         TEXT NOT NULL,
  "urutan"             INTEGER NOT NULL,
  "jenis"              TEXT[],
  "jenisLainnya"       TEXT,
  "area"               TEXT NOT NULL,
  "jenisGigi"          TEXT,
  "gigi"               INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  "tidakYakin"         BOOLEAN NOT NULL DEFAULT false,
  "regioRahang"        TEXT,
  "regioSisi"          TEXT,
  "regioSegmen"        TEXT,
  "titikJaringanLunak" TEXT,
  "sisiWajah"          TEXT,
  "sebaran"            TEXT NOT NULL,
  "cerita"             TEXT NOT NULL,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KeluhanSkrining_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "KeluhanSkrining_skriningId_urutan_key"
  ON "KeluhanSkrining"("skriningId", "urutan");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KeluhanSkrining_skriningId_fkey'
  ) THEN
    ALTER TABLE "KeluhanSkrining"
      ADD CONSTRAINT "KeluhanSkrining_skriningId_fkey"
      FOREIGN KEY ("skriningId") REFERENCES "Skrining"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill: skrining lama (v1) dengan nyeri berat ikut ditandai SEGERA, supaya
-- logika urgensi di dashboard sama untuk data lama dan baru.
UPDATE "Skrining"
SET "prioritas" = 'SEGERA'
WHERE "versiForm" = 1 AND "skalaNyeri" >= 7 AND "prioritas" = 'RUTIN';

COMMIT;
