import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Batas ukuran 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    if (skrining.userId !== session.user.id) {
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

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    // Format: userId/skriningId/filename
    const filePath = `${session.user.id}/${skriningId}/${fileName}`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "skrining";

    // Konversi File ke Buffer untuk upload ke Supabase via supabase-js
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
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
