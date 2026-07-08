"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react"
import { LoginSchema } from "@/features/auth/schema"
import { loginUser } from "@/features/auth/actions"
import { AuthField, authInputClass } from "../_components/auth-field"

type LoginFormValues = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const [error, setError] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: LoginFormValues) => {
    setError("")
    startTransition(async () => {
      try {
        const result = await loginUser(values)
        if (result?.error) setError(result.error)
      } catch {
        // Auth.js signals success by throwing its redirect — nothing to handle.
      }
    })
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Masuk
        </span>
        <h1 className="font-display text-[2.1rem] font-medium leading-tight tracking-tight text-foreground">
          Selamat datang kembali.
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk untuk mengirim keluhan baru atau meninjau kasus yang masuk.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          error={form.formState.errors.email?.message}
        >
          <input
            {...form.register("email")}
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={authInputClass}
            placeholder="nama@email.com"
          />
        </AuthField>

        <AuthField
          label="Password"
          icon={Lock}
          error={form.formState.errors.password?.message}
        >
          <input
            {...form.register("password")}
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            className={authInputClass}
            placeholder="••••••••"
          />
        </AuthField>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? "Memproses…" : "Masuk"}
          {!isPending && (
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Daftar pasien baru
        </Link>
      </p>
    </div>
  )
}
