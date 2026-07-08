import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell
      variant="admin"
      subtitle="Portal Admin"
      user={{ name: session.user.name ?? "Admin", meta: session.user.email ?? "" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
