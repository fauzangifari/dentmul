import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/auth-guard";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Batas ukuran 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

/**
 * Jenis gambar dari isi file (magic bytes), bukan dari `file.type`/nama file
 * yang dikirim browser dan bisa dipalsukan.
 */
function deteksiGambar(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { contentType: "image/png", ext: "png" };
  }
  return null;
}

export async function POST(request: Request) {
  try {
    // Cek ke DB (bukan hanya token): akun nonaktif tidak boleh mengunggah lagi.
    const user = await getVerifiedUser("PASIEN");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const skriningId = formData.get("skriningId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!skriningId) {
      return NextResponse.json({ error: "No skriningId provided" }, { status: 400 });
    }

    // Pastikan skrining milik user yang login (cegah tempel foto ke skrining orang lain)
    const skrining = await db.skrining.findUnique({
      where: { id: skriningId },
      select: { userId: true },
    });

    if (!skrining) {
      return NextResponse.json(
        { error: "Skrining tidak ditemukan." },
        { status: 404 }
      );
    }

    if (skrining.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Hanya JPEG/PNG/JPG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi 5MB." },
        { status: 400 }
      );
    }

    // Cek batas maksimal 5 foto per skrining
    const existingPhotosCount = await db.fotoSkrining.count({
      where: { skriningId },
    });

    if (existingPhotosCount >= 5) {
      return NextResponse.json(
        { error: "Maksimal 5 foto per skrining." },
        { status: 400 }
      );
    }

    // Konversi File ke Buffer untuk upload ke Supabase via supabase-js
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const gambar = deteksiGambar(buffer);
    if (!gambar) {
      return NextResponse.json(
        { error: "File bukan gambar JPEG/PNG yang valid." },
        { status: 400 }
      );
    }

    // Ekstensi dari isi file, bukan dari nama file kiriman browser.
    const fileName = `${uuidv4()}.${gambar.ext}`;
    // Format: userId/skriningId/filename
    const filePath = `${user.id}/${skriningId}/${fileName}`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "skrining";

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: gambar.contentType,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengunggah file ke storage." },
        { status: 500 }
      );
    }

    // Buat signed URL (berlaku misalnya untuk 1 jam = 3600 detik)
    // Walaupun nanti bisa di-fetch ulang dari db, saat ini kita simpan data ke DB dulu.
    // Catatan: Signed URL akan expired, idealnya di DB kita simpan 'key' (filePath),
    // lalu di frontend/server-side kita generate signed URL secara dinamis saat mau ditampilkan.
    // Tapi karena struktur DB sudah ada `url` dan `key`, kita bisa simpan path-nya saja di `url` atau `key`, 
    // lalu saat getSkriningDetail, kita convert ke signed URL.
    
    const { data: dbFoto } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // Berlaku 7 hari untuk MVP

    const foto = await db.fotoSkrining.create({
      data: {
        skriningId,
        url: dbFoto?.signedUrl || filePath,
        key: filePath,
      },
    });

    return NextResponse.json({
      success: true,
      id: foto.id,
      url: foto.url,
      key: foto.key,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
