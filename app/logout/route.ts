import { signOut } from "@/auth";
import { NextResponse } from "next/server";

// Force sign-out lalu arahkan ke /login.
//
// Dipakai oleh guard layout (lib/auth-guard.ts) saat token masih valid tetapi
// akun sudah nonaktif / berubah role: membersihkan cookie sesi dulu supaya
// middleware tidak memantulkan user kembali ke dashboard (infinite loop).
// `redirect: false` agar Auth.js tidak memancarkan redirect absolut
// (NEXTAUTH_URL-pinned) — kita redirect relatif via NextResponse.
export async function GET(request: Request) {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/login", request.url));
}
