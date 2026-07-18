"use server";

import { db } from "@/lib/db";
import { getVerifiedUser, requireUserOrThrow } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/prisma/generated/client";
import { PAGE_SIZE } from "@/features/dosen/constants";
import {
  ApproveEdukasiSchema,
  RejectEdukasiSchema,
  UpdateDosenProfileSchema,
  type ApproveEdukasiInput,
  type RejectEdukasiInput,
  type UpdateDosenProfileInput,
} from "@/features/dosen/schema";

export type EdukasiListParams = {
  search?: string;
  status?: string;
  page?: number;
};

// Status skrining yang tampil di dashboard dosen. Default fokus antrean ACC.
const DOSEN_STATUSES = ["MENUNGGU_ACC", "SELESAI"] as const;

/**
 * Daftar kasus yang relevan untuk dosen (shared pool — semua dosen melihat
 * antrean yang sama). Default menampilkan yang MENUNGGU_ACC; bisa difilter ke
 * SELESAI (riwayat yang sudah disetujui).
 */
export async function getEdukasiList(params: EdukasiListParams = {}) {
  await requireUserOrThrow("DOSEN");

  const search = params.search?.trim() ?? "";
  const statusParam = params.status?.trim() ?? "";
  const page = Math.max(1, params.page ?? 1);

  const status = (DOSEN_STATUSES as readonly string[]).includes(statusParam)
    ? statusParam
    : "MENUNGGU_ACC";

  const where: Prisma.SkriningWhereInput = {
    status: status as Prisma.SkriningWhereInput["status"],
  };

  if (search) {
    where.OR = [
      { keluhanUtama: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [skrinings, total] = await Promise.all([
    db.skrining.findMany({
      where,
      // Antrean: yang paling lama menunggu didahulukan.
      orderBy: { createdAt: "asc" },
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

  return { skrinings, total, page, totalPages, status };
}

export async function getDosenStats() {
  await requireUserOrThrow("DOSEN");

  const [menungguAcc, disetujui] = await Promise.all([
    db.skrining.count({ where: { status: "MENUNGGU_ACC" } }),
    db.skrining.count({ where: { status: "SELESAI" } }),
  ]);

  return { menungguAcc, disetujui, total: menungguAcc + disetujui };
}

export async function getKasusDetailForDosen(id: string) {
  await requireUserOrThrow("DOSEN");

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
      edukasi: {
        include: { koas: { select: { name: true } } },
      },
    },
  });
}

/**
 * ACC edukasi: hanya boleh saat kasus MENUNGGU_ACC. Menandai edukasi disetujui
 * (dosenId + reviewedAt, hapus catatan penolakan) lalu set skrining SELESAI —
 * saat itulah edukasi terlihat pasien.
 */
export async function approveEdukasi(values: ApproveEdukasiInput) {
  try {
    const dosen = await getVerifiedUser("DOSEN");
    if (!dosen) return { error: "Unauthorized" };
    const dosenId = dosen.id;

    const parsed = ApproveEdukasiSchema.safeParse(values);
    if (!parsed.success) return { error: "Data tidak valid!" };

    const { skriningId } = parsed.data;

    const skrining = await db.skrining.findUnique({
      where: { id: skriningId },
      select: { status: true, edukasi: { select: { id: true } } },
    });
    if (!skrining || !skrining.edukasi) {
      return { error: "Kasus atau edukasi tidak ditemukan." };
    }
    if (skrining.status !== "MENUNGGU_ACC") {
      return { error: "Kasus ini tidak sedang menunggu persetujuan." };
    }

    await db.$transaction([
      db.edukasi.update({
        where: { skriningId },
        data: { dosenId, catatanDosen: null, reviewedAt: new Date() },
      }),
      db.skrining.update({
        where: { id: skriningId },
        data: { status: "SELESAI" },
      }),
    ]);

    revalidatePath("/dosen/dashboard");
    revalidatePath(`/dosen/kasus/${skriningId}`);
    revalidatePath(`/pasien/riwayat/${skriningId}`);
    return { success: "Edukasi disetujui dan dikirim ke pasien." };
  } catch (error) {
    console.error("approveEdukasi Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}

/**
 * Tolak edukasi: hanya saat MENUNGGU_ACC. Menyimpan alasan (opsional) di
 * catatanDosen lalu mengembalikan skrining ke DITINJAU agar koas merevisi &
 * mengirim ulang.
 */
export async function rejectEdukasi(values: RejectEdukasiInput) {
  try {
    const dosen = await getVerifiedUser("DOSEN");
    if (!dosen) return { error: "Unauthorized" };
    const dosenId = dosen.id;

    const parsed = RejectEdukasiSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" };
    }

    const { skriningId, catatan } = parsed.data;

    const skrining = await db.skrining.findUnique({
      where: { id: skriningId },
      select: { status: true, edukasi: { select: { id: true } } },
    });
    if (!skrining || !skrining.edukasi) {
      return { error: "Kasus atau edukasi tidak ditemukan." };
    }
    if (skrining.status !== "MENUNGGU_ACC") {
      return { error: "Kasus ini tidak sedang menunggu persetujuan." };
    }

    await db.$transaction([
      db.edukasi.update({
        where: { skriningId },
        data: {
          dosenId,
          catatanDosen: catatan?.trim() ? catatan.trim() : null,
          reviewedAt: new Date(),
        },
      }),
      db.skrining.update({
        where: { id: skriningId },
        data: { status: "DITINJAU" },
      }),
    ]);

    revalidatePath("/dosen/dashboard");
    revalidatePath(`/dosen/kasus/${skriningId}`);
    revalidatePath(`/koas/kasus/${skriningId}`);
    return { success: "Edukasi ditolak dan dikembalikan ke koas." };
  } catch (error) {
    console.error("rejectEdukasi Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}

/**
 * Update profil dosen yang sedang login — cermin `updateOwnKoasProfile`.
 * Guard wajib sesi DOSEN; update SELALU menargetkan `session.user.id` (id tidak
 * pernah dari client). Hanya name & noTelepon; email/role/isActive tak disentuh.
 */
export async function updateOwnDosenProfile(values: UpdateDosenProfileInput) {
  try {
    const dosen = await getVerifiedUser("DOSEN");
    if (!dosen) return { error: "Unauthorized" };

    const parsed = UpdateDosenProfileSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" };
    }

    const { name, noTelepon } = parsed.data;
    await db.user.update({
      where: { id: dosen.id },
      data: { name, noTelepon },
    });

    revalidatePath("/dosen/profil");
    return { success: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("updateOwnDosenProfile Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}
