import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DosenProfileForm } from "./_components/profile-form";

export default async function DosenProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      noTelepon: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Profil Saya
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Perbarui nama dan nomor telepon Anda di sini.
        </p>
      </div>

      <DosenProfileForm
        user={{
          name: user.name,
          email: user.email,
          noTelepon: user.noTelepon ?? "",
        }}
      />
    </div>
  );
}
