// Akses database untuk tes E2E: membaca hasil skrining & membersihkan akun uji.
//
// Tes memakai database yang sama dengan server Next.js (DATABASE_URL di .env,
// saat ini Supabase PRODUKSI). Karena itu semua data uji memakai email dengan
// pola khusus (lihat `emailUji`) dan pembersihan HANYA menyentuh akun berpola
// itu — tidak pernah data pasien sungguhan.
import { request } from "node:https";
import path from "node:path";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

export const DOMAIN_EMAIL_UJI = "dentmul.test";
const POLA_EMAIL_UJI = `e2e-%@${DOMAIN_EMAIL_UJI}`;

/** Email unik untuk satu tes, mis. `e2e-1760000000000-ponsel@dentmul.test`. */
export function emailUji(label: string) {
  return `e2e-${Date.now()}-${label}@${DOMAIN_EMAIL_UJI}`;
}

/** URL koneksi yang dipakai tes (sama seperti prisma.config.ts). */
export function urlDatabase() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL/DIRECT_URL tidak ditemukan di .env");
  return url;
}

/** True bila database berada di mesin ini (aman ditulisi tes). */
export function databaseLokal() {
  const host = new URL(urlDatabase()).hostname;
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
}

/** Tes boleh menulis ke DB: DB lokal, atau izin eksplisit E2E_ALLOW_DB_WRITE=1. */
export function izinTulisDb() {
  return databaseLokal() || process.env.E2E_ALLOW_DB_WRITE === "1";
}

async function denganKoneksi<T>(fn: (db: Client) => Promise<T>) {
  const db = new Client({ connectionString: urlDatabase() });
  await db.connect();
  try {
    return await fn(db);
  } finally {
    await db.end();
  }
}

export type UserTersimpan = {
  id: string;
  name: string;
  role: string;
  nik: string;
  noTelepon: string;
  jenisKelamin: string | null;
  password: string;
  isActive: boolean;
};

export function ambilUser(email: string) {
  return denganKoneksi(async (db) => {
    const { rows } = await db.query<UserTersimpan>(
      `SELECT id, name, role, nik, "noTelepon", "jenisKelamin", password, "isActive"
         FROM "User" WHERE email = $1`,
      [email]
    );
    return rows[0] ?? null;
  });
}

export type KeluhanTersimpan = {
  urutan: number;
  jenis: string[];
  area: string;
  gigi: number[];
  titikJaringanLunak: string | null;
  sebaran: string;
  cerita: string;
};

export type SkriningTersimpan = {
  id: string;
  status: string;
  versiForm: number;
  pengisi: string;
  prioritas: string;
  keluhanUtama: string;
  durasiKeluhan: string;
  skalaNyeri: number;
  durasiAngka: number;
  durasiSatuan: string;
  upaya: string[];
  keteranganObat: string | null;
  tandaBahaya: string[];
  riwayatPenyakit: string | null;
  keluhan: KeluhanTersimpan[];
  jumlahFoto: number;
};

/** Skrining terbaru milik akun `email`, lengkap dengan keluhan & jumlah foto. */
export function ambilSkriningTerbaru(email: string) {
  return denganKoneksi(async (db) => {
    const { rows } = await db.query<SkriningTersimpan>(
      `SELECT s.id, s.status, s."versiForm", s.pengisi, s.prioritas,
              s."keluhanUtama", s."durasiKeluhan", s."skalaNyeri",
              s."durasiAngka", s."durasiSatuan", s.upaya, s."keteranganObat",
              s."tandaBahaya", s."riwayatPenyakit",
              COALESCE((
                SELECT json_agg(json_build_object(
                         'urutan', k.urutan, 'jenis', k.jenis, 'area', k.area,
                         'gigi', k.gigi, 'titikJaringanLunak', k."titikJaringanLunak",
                         'sebaran', k.sebaran, 'cerita', k.cerita
                       ) ORDER BY k.urutan)
                  FROM "KeluhanSkrining" k WHERE k."skriningId" = s.id
              ), '[]'::json) AS keluhan,
              (SELECT COUNT(*)::int FROM "FotoSkrining" f WHERE f."skriningId" = s.id) AS "jumlahFoto"
         FROM "Skrining" s
         JOIN "User" u ON u.id = s."userId"
        WHERE u.email = $1
        ORDER BY s."createdAt" DESC
        LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  });
}

/**
 * Hapus akun uji beserta skrining, keluhan, foto (DB + storage), kasus,
 * edukasi, dan sesinya. Tanpa `email`, semua akun berpola uji dihapus
 * (sisa tes yang terhenti di tengah jalan).
 */
export async function hapusAkunUji(email?: string) {
  if (email && !email.endsWith(`@${DOMAIN_EMAIL_UJI}`)) {
    throw new Error(`Menolak menghapus akun bukan uji: ${email}`);
  }

  const hasil = await denganKoneksi(async (db) => {
    await db.query("BEGIN");
    try {
      const { rows: users } = await db.query<{ id: string }>(
        `SELECT id FROM "User"
          WHERE role = 'PASIEN' AND email LIKE $1 AND ($2::text IS NULL OR email = $2)`,
        [POLA_EMAIL_UJI, email ?? null]
      );
      const userIds = users.map((u) => u.id);
      if (userIds.length === 0) {
        await db.query("ROLLBACK");
        return { akun: 0, skrining: 0, kunciFoto: [] as string[] };
      }

      const skriningMilikUji = `SELECT id FROM "Skrining" WHERE "userId" = ANY($1)`;
      const { rows: foto } = await db.query<{ key: string }>(
        `SELECT key FROM "FotoSkrining" WHERE "skriningId" IN (${skriningMilikUji})`,
        [userIds]
      );
      // Kasus & edukasi tidak ikut terhapus otomatis (FK tanpa cascade) —
      // bisa ada bila koas sempat mengambil kasus uji saat tes berjalan.
      await db.query(`DELETE FROM "Edukasi" WHERE "skriningId" IN (${skriningMilikUji})`, [userIds]);
      await db.query(`DELETE FROM "KasusPasien" WHERE "skriningId" IN (${skriningMilikUji})`, [userIds]);
      // KeluhanSkrining & FotoSkrining terhapus lewat ON DELETE CASCADE.
      const skrining = await db.query(`DELETE FROM "Skrining" WHERE "userId" = ANY($1)`, [userIds]);
      // Sesi terhapus lewat ON DELETE CASCADE.
      await db.query(`DELETE FROM "User" WHERE id = ANY($1)`, [userIds]);
      await db.query("COMMIT");

      return { akun: userIds.length, skrining: skrining.rowCount ?? 0, kunciFoto: foto.map((f) => f.key) };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  });

  if (hasil.kunciFoto.length > 0) await hapusFotoStorage(hasil.kunciFoto);
  return { akun: hasil.akun, skrining: hasil.skrining, foto: hasil.kunciFoto.length };
}

/**
 * Endpoint yang sama dengan `storage.from(bucket).remove(keys)` di supabase-js,
 * tetapi lewat `node:https`: `fetch` bawaan Node 24 di Windows membuat proses
 * crash saat Playwright memanggil `process.exit` (libuv "UV_HANDLE_CLOSING"),
 * sehingga exit code run jadi 127 walau semua tes lolos.
 */
async function hapusFotoStorage(keys: string[]) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: kunci, SUPABASE_STORAGE_BUCKET } = process.env;
  if (!SUPABASE_URL || !kunci) {
    console.warn(`[e2e] Kredensial Supabase tidak ada; ${keys.length} foto uji tertinggal di storage.`);
    return;
  }
  const url = new URL(`/storage/v1/object/${SUPABASE_STORAGE_BUCKET || "skrining"}`, SUPABASE_URL);
  const body = JSON.stringify({ prefixes: keys });

  const { status, isi } = await new Promise<{ status: number; isi: string }>((resolve, reject) => {
    const req = request(
      url,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${kunci}`,
          apikey: kunci,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let isi = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (isi += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, isi }));
      }
    );
    req.on("error", reject);
    req.end(body);
  });

  // Respons sukses = daftar objek yang benar-benar terhapus.
  const terhapus = status < 300 ? (JSON.parse(isi) as unknown[]).length : 0;
  if (terhapus !== keys.length) {
    console.warn(
      `[e2e] Hanya ${terhapus} dari ${keys.length} foto uji terhapus dari storage (HTTP ${status}).`
    );
  }
}
