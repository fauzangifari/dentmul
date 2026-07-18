import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileForm } from "./_components/profile-form";

export default async function PasienProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      nik: true,
      noTelepon: true,
      alamat: true,
      tanggalLahir: true,
      jenisKelamin: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Profil Saya
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Perbarui nomor telepon dan data diri Anda di sini.
        </p>
      </div>

      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          nik: user.nik,
          noTelepon: user.noTelepon ?? "",
          alamat: user.alamat ?? "",
          // Ke input type="date": format yyyy-MM-dd
          tanggalLahir: user.tanggalLahir
            ? user.tanggalLahir.toISOString().slice(0, 10)
            : "",
          jenisKelamin: user.jenisKelamin ?? "",
        }}
      />
    </div>
  );
}
