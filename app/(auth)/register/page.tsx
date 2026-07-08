"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { User, IdCard, Mail, Lock, Calendar, MapPin, AlertCircle, ArrowRight } from "lucide-react"
import { RegisterSchema } from "@/features/auth/schema"
import { registerUser, loginUser } from "@/features/auth/actions"
import { AuthField, authInputClass } from "../_components/auth-field"

type RegisterFormValues = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      nik: "",
      tanggalLahir: "",
      alamat: "",
    },
  })

  const onSubmit = (values: RegisterFormValues) => {
    setError("")
    startTransition(async () => {
      try {
        const result = await registerUser(values)
        if (result?.error) {
          setError(result.error)
          return
        }
        if (result?.success) {
          await loginUser({ email: values.email, password: values.password })
        }
      } catch {
        // Auth.js signals success by throwing its redirect — nothing to handle.
      }
    })
  }

  const errors = form.formState.errors

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Daftar · Pasien
        </span>
        <h1 className="font-display text-[2.1rem] font-medium leading-tight tracking-tight text-foreground">
          Mulai skrining Anda.
        </h1>
        <p className="text-sm text-muted-foreground">
          Lengkapi data diri untuk mengirim keluhan pertama Anda ke koas FKG
          Unmul.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <AuthField label="Nama Lengkap" icon={User} error={errors.name?.message}>
          <input
            {...form.register("name")}
            autoComplete="name"
            disabled={isPending}
            className={authInputClass}
            placeholder="Sesuai KTP"
          />
        </AuthField>

        <AuthField label="NIK" icon={IdCard} error={errors.nik?.message}>
          <input
            {...form.register("nik")}
            inputMode="numeric"
            disabled={isPending}
            className={authInputClass}
            placeholder="16 digit NIK"
          />
        </AuthField>

        <AuthField label="Email" icon={Mail} error={errors.email?.message}>
          <input
            {...form.register("email")}
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={authInputClass}
            placeholder="nama@email.com"
          />
        </AuthField>

        <AuthField label="Password" icon={Lock} error={errors.password?.message}>
          <input
            {...form.register("password")}
            type="password"
            autoComplete="new-password"
            disabled={isPending}
            className={authInputClass}
            placeholder="Minimal 6 karakter"
          />
        </AuthField>

        <AuthField
          label="Tanggal Lahir"
          icon={Calendar}
          error={errors.tanggalLahir?.message}
        >
          <input
            {...form.register("tanggalLahir")}
            type="date"
            disabled={isPending}
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label="Alamat"
          icon={MapPin}
          align="top"
          error={errors.alamat?.message}
        >
          <textarea
            {...form.register("alamat")}
            disabled={isPending}
            className={`${authInputClass} min-h-20 py-2.5`}
            placeholder="Alamat tempat tinggal saat ini"
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
          {isPending ? "Mendaftarkan…" : "Daftar sekarang"}
          {!isPending && (
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
