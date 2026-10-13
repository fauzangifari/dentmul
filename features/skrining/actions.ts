"use server";

import { db } from "@/lib/db";
import {
  SkriningSchema,
  normalisasiSkrining,
  type SkriningFormValues,
} from "@/features/skrining/schema";
import {
  formatDurasi,
  formatLokasi,
  hitungPrioritas,
  labelKeluhan,
} from "@/features/skrining/anamnesa";
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

    const data = validatedFields.data;
    const { keluhan, ...anamnesa } = normalisasiSkrining(data);
    const [utama, ...lain] = keluhan;

    const skrining = await db.skrining.create({
      data: {
        userId: pasien.id,
        versiForm: 2,
        pengisi: data.pengisi,
        prioritas: hitungPrioritas({ ...anamnesa, keluhan }),

        // Kolom lama diisi otomatis agar daftar kasus, pencarian, dan
        // tampilan lain yang belum mengenal v2 tetap berfungsi.
        keluhanUtama:
          labelKeluhan(utama) +
          (lain.length ? ` (+${lain.length} keluhan lain)` : ""),
        keluhanTambahan: lain.length ? lain.map(labelKeluhan).join("; ") : null,
        durasiKeluhan: formatDurasi(anamnesa.durasiAngka, anamnesa.durasiSatuan),
        lokasiSakit: formatLokasi(utama),

        ...anamnesa,

        riwayatPenyakit: data.riwayatPenyakit,
        alergiObat: data.alergiObat,
        obatRutin: data.obatRutin,
        kebiasaanBuruk: data.kebiasaanBuruk,
        status: "MENUNGGU",

        keluhan: {
          create: keluhan.map((k, urutan) => ({ urutan, ...k })),
        },
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
        keluhan: { orderBy: { urutan: "asc" } },
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
