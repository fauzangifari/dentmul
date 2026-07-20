"use server";

import { db } from "@/lib/db";
import { SkriningSchema, type SkriningFormValues } from "@/features/skrining/schema";
import { getVerifiedUser } from "@/lib/auth-guard";

export async function submitSkrining(values: SkriningFormValues) {
  try {
    const pasien = await getVerifiedUser("PASIEN");
    if (!pasien) {
      return { error: "Unauthorized" };
    }

    const validatedFields = SkriningSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const {
      keluhanUtama,
      keluhanTambahan,
      durasiKeluhan,
      lokasiSakit,
      skalaNyeri,
      riwayatPenyakit,
      alergiObat,
      obatRutin,
      kebiasaanBuruk,
    } = validatedFields.data;

    const skrining = await db.skrining.create({
      data: {
        userId: pasien.id,
        keluhanUtama,
        keluhanTambahan,
        durasiKeluhan,
        lokasiSakit,
        skalaNyeri,
        riwayatPenyakit,
        alergiObat,
        obatRutin,
        kebiasaanBuruk,
        status: "MENUNGGU",
      },
    });

    return { success: true, id: skrining.id };
  } catch (error) {
    console.error("Failed to submit skrining:", error);
    return { error: "Something went wrong" };
  }
}

export async function getRiwayatSkrining() {
  try {
    const pasien = await getVerifiedUser("PASIEN");
    if (!pasien) {
      return { error: "Unauthorized" };
    }

    const skrinings = await db.skrining.findMany({
      where: { userId: pasien.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, skrinings };
  } catch (error) {
    console.error("Failed to fetch riwayat skrining:", error);
    return { error: "Something went wrong" };
  }
}

export async function getSkriningDetail(id: string) {
  try {
    const pasien = await getVerifiedUser("PASIEN");
    if (!pasien) {
      return { error: "Unauthorized" };
    }

    const skrining = await db.skrining.findUnique({
      where: { id },
      include: {
        foto: true,
        edukasi: {
          include: {
            koas: {
              select: { name: true, noTelepon: true },
            },
          },
        },
      },
    });

    if (!skrining || skrining.userId !== pasien.id) {
      return { error: "Skrining not found or unauthorized" };
    }

    return { success: true, skrining };
  } catch (error) {
    console.error("Failed to fetch skrining detail:", error);
    return { error: "Something went wrong" };
  }
}
