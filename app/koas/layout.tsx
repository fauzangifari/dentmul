import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function KoasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "KOAS") {
    redirect("/login");
  }

  return (
    <DashboardShell
      variant="koas"
      subtitle="Portal Koas Piket"
      user={{ name: session.user.name ?? "Koas", meta: "Koas Piket" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
