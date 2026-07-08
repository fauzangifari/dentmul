import type { NextAuthConfig } from "next-auth"
import type { Role } from "@/prisma/generated/client"

// Penting: Jangan import db/adapter di sini karena file ini digunakan di middleware (Edge runtime)

export default {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
} satisfies NextAuthConfig
