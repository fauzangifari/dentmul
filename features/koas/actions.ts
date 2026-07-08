"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/prisma/generated/client";
import { PAGE_SIZE } from "@/features/koas/constants";
import { TinjauanSchema } from "@/features/koas/schema";

export type SkriningListParams = {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
};

export async function getSkriningList(params: SkriningListParams = {}) {
  const session = await auth();
  if (!session || session.user.role !== "KOAS") {
    throw new Error("Unauthorized");
  }

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

  if (status && ["MENUNGGU", "DITINJAU", "SELESAI"].includes(status)) {
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
  const session = await auth();
  if (!session || session.user.role !== "KOAS") {
    throw new Error("Unauthorized");
  }

  const [grouped, mendesak] = await Promise.all([
    db.skrining.groupBy({ by: ["status"], _count: { _all: true } }),
    db.skrining.count({
      where: { status: "MENUNGGU", skalaNyeri: { gte: 7 } },
    }),
  ]);

  const byStatus = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  ) as Partial<Record<"MENUNGGU" | "DITINJAU" | "SELESAI", number>>;

  const menunggu = byStatus.MENUNGGU ?? 0;
  const selesai = byStatus.SELESAI ?? 0;
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return { total, menunggu, selesai, mendesak };
}

export async function getKasusDetail(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "KOAS") {
    throw new Error("Unauthorized");
  }

  const skrining = await db.skrining.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          tanggalLahir: true,
          jenisKelamin: true,
          nik: true,
          alamat: true,
        },
      },
      foto: true,
      kasus: true,
      edukasi: true,
    },
  });

  // Saat koas membuka kasus yang masih MENUNGGU, tandai sebagai DITINJAU.
  // Tidak memanggil revalidatePath (dilarang saat render Server Component di
  // Next 16); dashboard koas sudah force-dynamic sehingga query ulang otomatis.
  if (skrining && skrining.status === "MENUNGGU") {
    await db.skrining.update({
      where: { id },
      data: { status: "DITINJAU" },
    });
    skrining.status = "DITINJAU";
  }

  return skrining;
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
  const session = await auth();
  if (!session || session.user.role !== "KOAS") {
    throw new Error("Unauthorized");
  }

  const koasId = session.user.id;
  if (!koasId) throw new Error("User ID is missing from session");

  // Validasi sisi-server (defense-in-depth atas validasi form klien)
  const parsed = TinjauanSchema.safeParse({
    skriningId,
    kategori,
    isPotensial,
    catatan,
    edukasiKonten,
  });
  if (!parsed.success) {
    throw new Error("Input tinjauan tidak valid");
  }

  // Transaksi agar konsisten
  await db.$transaction(async (tx) => {
    // 1. Buat / update KasusPasien
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

    // 2. Buat / update Edukasi
    if (edukasiKonten) {
      await tx.edukasi.upsert({
        where: { skriningId },
        update: {
          konten: edukasiKonten,
          koasId,
        },
        create: {
          skriningId,
          koasId,
          konten: edukasiKonten,
        },
      });
    }

    // 3. Update status skrining
    await tx.skrining.update({
      where: { id: skriningId },
      data: {
        status: "SELESAI",
      },
    });
  });

  revalidatePath(`/koas/kasus/${skriningId}`);
  revalidatePath("/koas/dashboard");
  return { success: true };
}
