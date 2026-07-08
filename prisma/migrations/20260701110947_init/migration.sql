-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASIEN', 'KOAS');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusSkrining" AS ENUM ('MENUNGGU', 'DITINJAU', 'SELESAI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PASIEN',
    "nik" TEXT,
    "jenisKelamin" "JenisKelamin",
    "alamat" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skrining" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keluhanUtama" TEXT NOT NULL,
    "keluhanTambahan" TEXT,
    "durasiKeluhan" TEXT NOT NULL,
    "lokasiSakit" TEXT,
    "skalaNyeri" INTEGER,
    "riwayatPenyakit" TEXT,
    "alergiObat" TEXT,
    "obatRutin" TEXT,
    "kebiasaanBuruk" TEXT,
    "status" "StatusSkrining" NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skrining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoSkrining" (
    "id" TEXT NOT NULL,
    "skriningId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoSkrining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KasusPasien" (
    "id" TEXT NOT NULL,
    "skriningId" TEXT NOT NULL,
    "koasId" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Lainnya',
    "isPotensial" BOOLEAN NOT NULL DEFAULT false,
    "catatan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KasusPasien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edukasi" (
    "id" TEXT NOT NULL,
    "skriningId" TEXT NOT NULL,
    "koasId" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Edukasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "KasusPasien_skriningId_key" ON "KasusPasien"("skriningId");

-- CreateIndex
CREATE UNIQUE INDEX "Edukasi_skriningId_key" ON "Edukasi"("skriningId");

-- AddForeignKey
ALTER TABLE "Skrining" ADD CONSTRAINT "Skrining_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoSkrining" ADD CONSTRAINT "FotoSkrining_skriningId_fkey" FOREIGN KEY ("skriningId") REFERENCES "Skrining"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KasusPasien" ADD CONSTRAINT "KasusPasien_skriningId_fkey" FOREIGN KEY ("skriningId") REFERENCES "Skrining"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KasusPasien" ADD CONSTRAINT "KasusPasien_koasId_fkey" FOREIGN KEY ("koasId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edukasi" ADD CONSTRAINT "Edukasi_skriningId_fkey" FOREIGN KEY ("skriningId") REFERENCES "Skrining"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edukasi" ADD CONSTRAINT "Edukasi_koasId_fkey" FOREIGN KEY ("koasId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
