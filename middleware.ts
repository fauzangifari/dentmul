import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  // Rute API untuk autentikasi harus selalu terbuka
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/register"

  if (isApiAuthRoute) return

  // Redirect jika belum login dan bukan rute publik
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  // Proteksi rute berdasarkan role jika sudah login
  if (isLoggedIn) {
    const role = user?.role || "PASIEN" // Default fallback

    // Dashboard tujuan sesuai role
    const home =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "KOAS"
          ? "/koas/dashboard"
          : role === "DOSEN"
            ? "/dosen/dashboard"
            : "/pasien/dashboard"

    // Jangan biarkan user yang sudah login mengakses halaman login/register
    if (isPublicRoute && nextUrl.pathname !== "/") {
      return Response.redirect(new URL(home, nextUrl))
    }

    // Setiap area hanya boleh diakses oleh role pemiliknya
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return Response.redirect(new URL(home, nextUrl))
    }

    if (nextUrl.pathname.startsWith("/koas") && role !== "KOAS") {
      return Response.redirect(new URL(home, nextUrl))
    }

    if (nextUrl.pathname.startsWith("/dosen") && role !== "DOSEN") {
      return Response.redirect(new URL(home, nextUrl))
    }

    if (nextUrl.pathname.startsWith("/pasien") && role !== "PASIEN") {
      return Response.redirect(new URL(home, nextUrl))
    }
  }

  return
})

export const config = {
  // Hanya panggil middleware untuk path selain static files dan _next (assets/images dll)
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
