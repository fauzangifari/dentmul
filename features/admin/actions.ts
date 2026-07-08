"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/prisma/generated/client";
import bcrypt from "bcryptjs";
import { PAGE_SIZE } from "@/features/admin/constants";
import {
  CreateUserSchema,
  UpdateUserSchema,
  ResetPasswordSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ResetPasswordInput,
} from "@/features/admin/schema";

/**
 * Guard: hanya ADMIN. Melempar Error agar dipakai action baca yang
 * dipanggil langsung dari Server Component (mirror pola features/koas).
 */
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export type UserListParams = {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
};

export async function getUserList(params: UserListParams = {}) {
  await requireAdmin();

  const search = params.search?.trim() ?? "";
  const role = params.role?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && ["PASIEN", "KOAS", "ADMIN"].includes(role)) {
    where.role = role as Prisma.UserWhereInput["role"];
  }

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      // Jangan pernah select `password`.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        nik: true,
        jenisKelamin: true,
        alamat: true,
        tanggalLahir: true,
        createdAt: true,
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { users, total, page, totalPages };
}

export async function getUserStats() {
  await requireAdmin();

  const [grouped, inactive, total] = await Promise.all([
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.user.count({ where: { isActive: false } }),
    db.user.count(),
  ]);

  const byRole = Object.fromEntries(
    grouped.map((g) => [g.role, g._count._all])
  ) as Partial<Record<"PASIEN" | "KOAS" | "ADMIN", number>>;

  return {
    total,
    pasien: byRole.PASIEN ?? 0,
    koas: byRole.KOAS ?? 0,
    admin: byRole.ADMIN ?? 0,
    active: total - inactive,
    inactive,
  };
}

export async function createUser(values: CreateUserInput) {
  try {
    await requireAdmin();

    const parsed = CreateUserSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" };
    }

    const { name, email, password, role, nik, tanggalLahir, alamat, jenisKelamin } =
      parsed.data;

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "Email sudah digunakan!" };

    if (nik) {
      const existingNik = await db.user.findUnique({ where: { nik } });
      if (existingNik) return { error: "NIK sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        nik: nik || null,
        alamat: alamat || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        jenisKelamin: jenisKelamin || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: "User baru berhasil dibuat!" };
  } catch (error) {
    console.error("createUser Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}

export async function updateUser(id: string, values: UpdateUserInput) {
  try {
    const session = await requireAdmin();

    const parsed = UpdateUserSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid!" };
    }

    const { name, email, role, isActive, nik, tanggalLahir, alamat, jenisKelamin } =
      parsed.data;

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) return { error: "User tidak ditemukan." };

    // Safety: admin tidak boleh mengunci dirinya sendiri keluar.
    if (session.user.id === id && (role !== "ADMIN" || !isActive)) {
      return {
        error: "Anda tidak dapat menurunkan role atau menonaktifkan akun sendiri.",
      };
    }

    // Safety: harus selalu tersisa minimal satu admin aktif.
    const demotingAdmin = target.role === "ADMIN" && (role !== "ADMIN" || !isActive);
    if (demotingAdmin) {
      const otherActiveAdmins = await db.user.count({
        where: { role: "ADMIN", isActive: true, id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        return { error: "Tidak bisa menurunkan/menonaktifkan admin aktif terakhir." };
      }
    }

    // Cek keunikan email & NIK, kecuali record ini sendiri.
    const emailOwner = await db.user.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    });
    if (emailOwner) return { error: "Email sudah digunakan!" };

    if (nik) {
      const nikOwner = await db.user.findFirst({
        where: { nik, NOT: { id } },
        select: { id: true },
      });
      if (nikOwner) return { error: "NIK sudah terdaftar!" };
    }

    await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        isActive,
        nik: nik || null,
        alamat: alamat || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        jenisKelamin: jenisKelamin || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: "Data user berhasil diperbarui!" };
  } catch (error) {
    console.error("updateUser Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}

export async function setUserActive(id: string, isActive: boolean) {
  try {
    const session = await requireAdmin();

    if (session.user.id === id && !isActive) {
      return { error: "Anda tidak dapat menonaktifkan akun sendiri." };
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) return { error: "User tidak ditemukan." };

    if (!isActive && target.role === "ADMIN") {
      const otherActiveAdmins = await db.user.count({
        where: { role: "ADMIN", isActive: true, id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        return { error: "Tidak bisa menonaktifkan admin aktif terakhir." };
      }
    }

    await db.user.update({ where: { id }, data: { isActive } });

    revalidatePath("/admin/users");
    return { success: isActive ? "User diaktifkan." : "User dinonaktifkan." };
  } catch (error) {
    console.error("setUserActive Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}

export async function resetUserPassword(id: string, values: ResetPasswordInput) {
  try {
    await requireAdmin();

    const parsed = ResetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!target) return { error: "User tidak ditemukan." };

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.user.update({ where: { id }, data: { password: hashedPassword } });

    revalidatePath("/admin/users");
    return { success: "Password berhasil direset." };
  } catch (error) {
    console.error("resetUserPassword Error:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}
