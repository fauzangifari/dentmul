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
      riwayatPenyakit: null,
      alergiObat: 'Amoxicillin',
      obatRutin: null,
      kebiasaanBuruk: 'Merokok',
      status: 'MENUNGGU',
    },
  })
  console.log(`✅ Skrining created: ${skrining.id}`)

  console.log('\n🎉 Seeding selesai!')
  console.log('---')
  console.log('Akun tersedia:')
  console.log('  Pasien → pasien@dentmul.id / password123')
  console.log('  Koas   → koas@dentmul.id / password123')
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
