// Bentuk data user yang dipakai UI admin (tanpa password).
export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  role: "PASIEN" | "KOAS" | "ADMIN";
  isActive: boolean;
  nik: string | null;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN" | null;
  alamat: string | null;
  tanggalLahir: Date | null;
  createdAt: Date;
};
