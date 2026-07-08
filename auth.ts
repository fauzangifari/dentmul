import NextAuth, { type DefaultSession, type User as NextAuthUser } from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"
import { Role } from "@/prisma/generated/client"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email().transform((v) => v.trim().toLowerCase()),
            password: z.string().min(1),
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await db.user.findUnique({ where: { email } })
          
          if (!user || !user.password) return null
          if (!user.isActive) return null // user dinonaktifkan admin → tolak login

          const passwordsMatch = await bcrypt.compare(password, user.password)
          
          if (passwordsMatch) {
            return user
          }
        }
        return null
      },
    }),
  ],
})
