"use server";

import { db } from "@/lib/db";
import { getVerifiedUser, requireUserOrThrow } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/prisma/generated/client";
import { PAGE_SIZE } from "@/features/koas/constants";
import {
  TinjauanSchema,
  UpdateKoasProfileSchema,
  type UpdateKoasProfileInput,
} from "@/features/koas/schema";

export type SkriningListParams = {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
};

export async function getSkriningList(params: SkriningListParams = {}) {
  await requireUserOrThrow("KOAS");

  const search = params.search?.trim() ?? "";
  const kategori = params.kategori?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.SkriningWhereInput = {};

  if (search) {
    where.OR = [
      { keluhanUtama: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status === "PERLU") {
    // Pseudo-filter kartu "Perlu Ditinjau": kasus yang butuh aksi koas —
    // belum ditinjau (MENUNGGU) atau dikembalikan dosen untuk revisi (DITINJAU).
    where.status = { in: ["MENUNGGU", "DITINJAU"] };
  } else if (
    status &&
    ["MENUNGGU", "DITINJAU", "MENUNGGU_ACC", "SELESAI"].includes(status)
  ) {
    where.status = status as Prisma.SkriningWhereInput["status"];
  }

  if (kategori) {
    where.kasus = { is: { kategori } };
  }

  const [skrinings, total] = await Promise.all([
    db.skrining.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            name: true,
            tanggalLahir: true,
            jenisKelamin: true,
          },
        },
        kasus: true,
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.skrining.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { skrinings, total, page, totalPages };
}

export async function getSkriningStats() {
  await requireUserOrThrow("KOAS");

  const [grouped, mendesak] = await Promise.all([
    db.skrining.groupBy({ by: ["status"], _count: { _all: true } }),
    db.skrining.count({
      where: { status: "MENUNGGU", skalaNyeri: { gte: 7 } },
    }),
  ]);

  const byStatus = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  ) as Partial<
    Record<"MENUNGGU" | "DITINJAU" | "MENUNGGU_ACC" | "SELESAI", number>
  >;

  const menunggu = byStatus.MENUNGGU ?? 0;
  const ditinjau = byStatus.DITINJAU ?? 0;
  const selesai = byStatus.SELESAI ?? 0;
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  // Kasus yang butuh aksi koas = belum ditinjau (MENUNGGU) + sudah dibuka /
  // dikembalikan dosen untuk direvisi (DITINJAU). DITINJAU sebelumnya tidak
  // terhitung di tile mana pun sehingga kasus revisi "hilang" dari dashboard.
  const perluTindakan = menunggu + ditinjau;

  return { total, menunggu, ditinjau, perluTindakan, selesai, mendesak };
}

// Murni-baca. Transisi MENUNGGU → DITINJAU TIDAK dilakukan di sini: menulis DB
// saat render Server Component membuat GET non-idempoten (prefetch/re-render
// memicu write) dan mengunci kasus hanya karena dibuka. Transisi dipindah ke
// action eksplisit `mulaiTinjauKasus` yang dipicu tombol koas.
export async function getKasusDetail(id: string) {
  await requireUserOrThrow("KOAS");

  return db.skrining.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          tanggalLahir: true,
          jenisKelamin: true,
          nik: true,
          alamat: true,
          noTelepon: true,
        },
      },
      foto: true,
      kasus: true,
      edukasi: true,
    },
  });
}

/**
 * Tandai kasus mulai ditinjau (MENUNGGU → DITINJAU). Dipicu tombol "Mulai
 * Tinjau" oleh koas. Idempoten: memakai updateMany bersyarat status, sehingga
 * pemanggilan pada kasus non-MENUNGGU tidak berefek (0 baris) dan aman diulang.
 */
export async function mulaiTinjauKasus(skriningId: string) {
  const koas = await getVerifiedUser("KOAS");
  if (!koas) return { error: "Unauthorized" };

  await db.skrining.updateMany({
    where: { id: skriningId, status: "MENUNGGU" },
    data: { status: "DITINJAU" },
  });

  revalidatePath(`/koas/kasus/${skriningId}`);
  revalidatePath("/koas/dashboard");
  return { success: true };
}

export async function submitTinjauan({
  skriningId,
  kategori,
  isPotensial,
  catatan,
  edukasiKonten,
}: {
  skriningId: string;
  kategori: string;
  isPotensial: boolean;
  catatan?: string;
  edukasiKonten: string;
}) {
  const koas = await getVerifiedUser("KOAS");
  if (!koas) return { error: "Unauthorized" };
  const koasId = koas.id;

  // Validasi sisi-server (defense-in-depth atas validasi form klien)
  const parsed = TinjauanSchema.safeParse({
    skriningId,
    kategori,
    isPotensial,
    catatan,
    edukasiKonten,
  });
  if (!parsed.success) {
    return { error: "Input tinjauan tidak valid" };
  }

  try {
    // Transaksi agar konsisten
    await db.$transaction(async (tx) => {
      // 1. Guard status DI DALAM transaksi: hanya kasus MENUNGGU / DITINJAU
      // yang boleh dikirim. updateMany bersyarat status menutup baik race
      // check-then-act maupun POST langsung ke kasus SELESAI/MENUNGGU_ACC —
      // mencegah koas menarik kembali edukasi yang sudah di-ACC dosen atau
      // mencuri kasus koas lain. Bila 0 baris cocok, batalkan transaksi.
      const updated = await tx.skrining.updateMany({
        where: { id: skriningId, status: { in: ["MENUNGGU", "DITINJAU"] } },
        data: { status: "MENUNGGU_ACC" },
      });
      if (updated.count === 0) {
        throw new Error("STATUS_INVALID");
      }

      // 2. Buat / update KasusPasien
      await tx.kasusPasien.upsert({
        where: { skriningId },
        update: {
          kategori,
          isPotensial,
          catatan,
          koasId,
        },
        create: {
          skriningId,
          koasId,
          kategori,
          isPotensial,
          catatan,
        },
      });

      // 3. Buat / update Edukasi.
      // Reset field ACC agar pengiriman ulang (setelah ditolak dosen) bersih —
      // kembali ke keadaan "menunggu ACC" tanpa jejak review sebelumnya.
      if (edukasiKonten) {
        await tx.edukasi.upsert({
          where: { skriningId },
          update: {
            konten: edukasiKonten,
            koasId,
            dosenId: null,
            catatanDosen: null,
            reviewedAt: null,
          },
          create: {
            skriningId,
            koasId,
            konten: edukasiKonten,
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STATUS_INVALID") {
      return {
        error:
          "Kasus ini tidak dapat dikirim ulang — mungkin sudah menunggu ACC atau telah disetujui dosen.",
      };
    }
    console.error("submitTinjauan Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }

  revalidatePath(`/koas/kasus/${skriningId}`);
  revalidatePath("/koas/dashboard");
  return { success: true };
}

/**
 * Update profil milik koas yang sedang login.
 *
 * Guard keamanan (Server Actions bisa dipanggil via POST langsung, bukan hanya
 * lewat UI): wajib sesi KOAS, dan update SELALU menargetkan `session.user.id`
 * — id tidak pernah diterima dari client. Hanya name & noTelepon yang ditulis;
 * email/role/isActive tidak pernah disentuh. Mengembalikan objek { error } /
 * { success } (bukan throw) agar form klien bisa menampilkan toast.
 */
export async function updateOwnKoasProfile(values: UpdateKoasProfileInput) {
  try {
    const koas = await getVerifiedUser("KOAS");
    if (!koas) {
      return { error: "Unauthorized" };
    }

    const parsed = UpdateKoasProfileSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" };
    }

    const { name, noTelepon } = parsed.data;

    await db.user.update({
      where: { id: koas.id },
      data: { name, noTelepon },
    });

    revalidatePath("/koas/profil");
    return { success: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("updateOwnKoasProfile Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}
