import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PasienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "PASIEN") {
    redirect("/login");
  }

  return (
    <DashboardShell
      variant="pasien"
      subtitle="Portal Pasien"
      user={{ name: session.user.name ?? "Pasien", meta: session.user.email ?? "" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
