import { auth } from "@/auth";
import { getUserList } from "@/features/admin/actions";
import { UserFilters } from "@/features/admin/components/user-filters";
import { UserTable } from "@/features/admin/components/user-table";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { CreateUserButton } from "@/features/admin/components/create-user-button";
import { EmptyState } from "@/components/empty-state";
import type { AdminUserItem } from "@/features/admin/types";
import { SearchX, Users } from "lucide-react";

export const metadata = {
  title: "Kelola User | DentMul",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [session, { users, total, totalPages }] = await Promise.all([
    auth(),
    getUserList({
      search: params.search,
      role: params.role,
      status: params.status,
      page,
    }),
  ]);

  const hasFilter =
    Boolean(params.search) || Boolean(params.role) || Boolean(params.status);

  const items: AdminUserItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    nik: u.nik,
    jenisKelamin: u.jenisKelamin,
    alamat: u.alamat,
    tanggalLahir: u.tanggalLahir,
    createdAt: u.createdAt,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Kelola User
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {total} akun terdaftar di sistem.
          </p>
        </div>
        <CreateUserButton />
      </div>

      <UserFilters />

      {items.length === 0 ? (
        hasFilter ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ada hasil"
            description="Tidak ada user yang cocok dengan pencarian atau filter Anda. Coba ubah kata kunci atau hapus filter."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Belum ada user"
            description="Belum ada akun terdaftar. Tambahkan user pertama lewat tombol Tambah User."
          />
        )
      ) : (
        <div className="space-y-4">
          <UserTable items={items} currentUserId={session?.user?.id ?? ""} />
          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} />
          )}
        </div>
      )}
    </div>
  );
}
