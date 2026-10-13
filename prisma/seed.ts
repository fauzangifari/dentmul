// prisma/seed.ts
// Data dummy untuk development & testing
// Jalankan dengan: npx prisma db seed

import { config } from 'dotenv'
config({ path: '.env' })

import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Buat akun KOAS
  const koas = await prisma.user.upsert({
    where: { email: 'koas@dentmul.id' },
    update: {},
    create: {
      name: 'Dr. Andi Koas',
      email: 'koas@dentmul.id',
      password: hashedPassword,
      role: 'KOAS',
    },
  })
  console.log(`✅ Koas created: ${koas.email}`)

  // Buat akun DOSEN (penyetuju edukasi koas)
  const dosen = await prisma.user.upsert({
    where: { email: 'dosen@dentmul.id' },
    update: {},
    create: {
      name: 'Dr. Sari Dosen',
      email: 'dosen@dentmul.id',
      password: hashedPassword,
      role: 'DOSEN',
    },
  })
  console.log(`✅ Dosen created: ${dosen.email}`)

  // Buat akun PASIEN
  const pasien = await prisma.user.upsert({
    where: { email: 'pasien@dentmul.id' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'pasien@dentmul.id',
      password: hashedPassword,
      role: 'PASIEN',
      nik: '6401011234560001',
      jenisKelamin: 'LAKI_LAKI',
      alamat: 'Jl. Sudirman No. 10, Samarinda, Kalimantan Timur',
      tanggalLahir: new Date('1995-06-15'),
    },
  })
  console.log(`✅ Pasien created: ${pasien.email}`)

  // Buat akun ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dentmul.id' },
    update: {},
    create: {
      name: 'Admin DentMul',
      email: 'admin@dentmul.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  // Buat data skrining dummy
  const skrining = await prisma.skrining.upsert({
    where: { id: 'seed-skrining-001' },
    update: {},
    create: {
      id: 'seed-skrining-001',
      userId: pasien.id,
      keluhanUtama: 'Sakit gigi geraham kanan bawah sudah 3 hari',
      keluhanTambahan: 'Terasa berdenyut dan ngilu saat makan atau minum dingin',
      durasiKeluhan: '3 hari',
      lokasiSakit: 'Geraham kanan bawah',
      skalaNyeri: 7,
      prioritas: 'SEGERA', // skrining v1: nyeri ≥ 7 dianggap segera
      riwayatPenyakit: null,
      alergiObat: 'Amoxicillin',
      obatRutin: null,
      kebiasaanBuruk: 'Merokok',
      status: 'MENUNGGU',
    },
  })
  console.log(`✅ Skrining created: ${skrining.id}`)

  // Skrining v2 (anamnesis terstruktur) — contoh sesuai mockup formulir baru.
  const skriningV2 = await prisma.skrining.upsert({
    where: { id: 'seed-skrining-002' },
    update: {},
    create: {
      id: 'seed-skrining-002',
      userId: pasien.id,
      versiForm: 2,
      pengisi: 'PASIEN_SENDIRI',
      prioritas: 'SEGERA', // skala nyeri 7 + nyeri membangunkan tidur disertai bengkak
      keluhanUtama: 'Gigi sakit · 46 (+1 keluhan lain)',
      keluhanTambahan: 'Sariawan · lidah',
      durasiKeluhan: '4 hari',
      lokasiSakit: 'Gigi 46 (geraham besar pertama bawah kanan)',
      skalaNyeri: 7,
      durasiAngka: 4,
      durasiSatuan: 'HARI',
      onset: 'TIBA_TIBA',
      perkembangan: 'MAKIN_PARAH',
      riwayatPerawatan: ['BELUM_PERNAH'],
      jenisNyeri: 'BERDENYUT',
      polaNyeri: 'SPONTAN',
      waktuNyeri: ['MALAM'],
      nyeriBangunTidur: true,
      dampak: ['MAKAN', 'TIDUR'],
      upaya: ['MINUM_OBAT'],
      keteranganObat: 'Parasetamol 2 kali sehari, sedikit membantu',
      gejalaLain: ['GUSI_BENGKAK'],
      tandaBahaya: [],
      alergiObat: 'Amoxicillin',
      status: 'MENUNGGU',
      keluhan: {
        create: [
          {
            urutan: 0,
            jenis: ['GIGI_SAKIT', 'GUSI_BENGKAK'],
            area: 'GIGI',
            jenisGigi: 'DEWASA',
            gigi: [46],
            sebaran: 'MENJALAR',
            cerita:
              'Gigi geraham bawah kanan terasa nyeri berdenyut, terutama pada malam hari, kadang sampai ke telinga.',
          },
          {
            urutan: 1,
            jenis: ['SARIAWAN'],
            area: 'LIDAH',
            titikJaringanLunak: 'LIDAH',
            sebaran: 'SATU_TITIK',
            cerita: 'Ada sariawan di pinggir lidah, perih saat makan pedas.',
          },
        ],
      },
    },
  })
  console.log(`✅ Skrining v2 created: ${skriningV2.id}`)

  console.log('\n🎉 Seeding selesai!')
  console.log('---')
  console.log('Akun tersedia:')
  console.log('  Pasien → pasien@dentmul.id / password123')
  console.log('  Koas   → koas@dentmul.id / password123')
  console.log('  Dosen  → dosen@dentmul.id / password123')
  console.log('  Admin  → admin@dentmul.id / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
