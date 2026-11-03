"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { unstable_rethrow } from "next/navigation"
import {
  User,
  IdCard,
  Mail,
  Phone,
  Lock,
  Calendar,
  Mars,
  Venus,
  MapPin,
  AlertCircle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { RegisterSchema } from "@/features/auth/schema"
import { registerUser, loginUser } from "@/features/auth/actions"
import { cn } from "@/lib/utils"
import { AuthField, authInputClass, authLabelClass } from "../_components/auth-field"

type RegisterFormValues = z.infer<typeof RegisterSchema>

const JENIS_KELAMIN_OPTIONS = [
  { value: "LAKI_LAKI", label: "Laki-laki", icon: Mars },
  { value: "PEREMPUAN", label: "Perempuan", icon: Venus },
] as const satisfies readonly {
  value: RegisterFormValues["jenisKelamin"]
  label: string
  icon: LucideIcon
}[]

/** True bila `err` adalah redirect/notFound milik Next.js, bukan error aplikasi. */
function isNavigasiNext(err: unknown) {
  try {
    unstable_rethrow(err)
    return false
  } catch {
    return true
  }
}

// "+" hanya bermakna di awal nomor, sisanya harus angka.
const sanitizePhone = (value: string) =>
  (value.startsWith("+") ? "+" : "") + value.replace(/\D/g, "")

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("")
  // Akun tersimpan tapi login otomatis gagal — daftar ulang hanya akan
  // ditolak "Email sudah digunakan!", jadi arahkan ke halaman login.
  const [accountCreated, setAccountCreated] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      nik: "",
      noTelepon: "",
      tanggalLahir: "",
      alamat: "",
    },
  })

  const tandaiAkunDibuat = () => {
    setAccountCreated(true)
    setError("Akun Anda sudah dibuat, tetapi gagal masuk otomatis.")
  }

  const onSubmit = (values: RegisterFormValues) => {
    setError("")
    startTransition(async () => {
      let akunDibuat = false
      try {
        const result = await registerUser(values)
        if (result?.error) {
          setError(result.error)
          return
        }
        if (result?.success) {
          akunDibuat = true
          const login = await loginUser({ email: values.email, password: values.password })
          if (login?.error) tandaiAkunDibuat()
        }
      } catch (err) {
        // Login sukses ditandai Auth.js dengan redirect — Next.js sudah bernavigasi.
        if (isNavigasiNext(err)) return
        // Error lain (koneksi putus, DB timeout) tidak boleh hilang diam-diam.
        if (akunDibuat) tandaiAkunDibuat()
        else setError("Terjadi kesalahan. Periksa koneksi Anda, lalu coba lagi.")
      }
    })
  }

  const errors = form.formState.errors
  const noTeleponField = form.register("noTelepon")

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
          Lengkapi data diri untuk mengirim keluhan pertama Anda ke DGM FKG
          Unmul.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <AuthField label="Nama Lengkap" icon={User} error={errors.name?.message}>
          <input
            {...form.register("name")}
            aria-invalid={!!errors.name}
            autoComplete="name"
            disabled={isPending}
            className={authInputClass}
            placeholder="Sesuai KTP"
          />
        </AuthField>

        <AuthField label="NIK" icon={IdCard} error={errors.nik?.message}>
          <input
            {...form.register("nik")}
            aria-invalid={!!errors.nik}
            inputMode="numeric"
            disabled={isPending}
            className={authInputClass}
            placeholder="16 digit NIK"
          />
        </AuthField>

        <AuthField label="Email" icon={Mail} error={errors.email?.message}>
          <input
            {...form.register("email")}
            aria-invalid={!!errors.email}
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={authInputClass}
            placeholder="nama@email.com"
          />
        </AuthField>

        <AuthField label="No Telepon" icon={Phone} error={errors.noTelepon?.message}>
          <input
            {...noTeleponField}
            onChange={(event) => {
              event.target.value = sanitizePhone(event.target.value)
              void noTeleponField.onChange(event)
            }}
            aria-invalid={!!errors.noTelepon}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            disabled={isPending}
            className={authInputClass}
            placeholder="08xxxxxxxxxx"
          />
        </AuthField>

        <AuthField label="Password" icon={Lock} error={errors.password?.message}>
          <input
            {...form.register("password")}
            aria-invalid={!!errors.password}
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
            aria-invalid={!!errors.tanggalLahir}
            type="date"
            disabled={isPending}
            className={authInputClass}
          />
        </AuthField>

        <fieldset
          role="radiogroup"
          aria-invalid={!!errors.jenisKelamin}
          disabled={isPending}
          className="space-y-1.5"
        >
          {/* legend berupa blok (label AuthField inline) — mb-0.5 menyamakan
              jarak ke kontrol dengan field lain. */}
          <legend className={cn(authLabelClass, "mb-0.5")}>Jenis Kelamin</legend>
          <div className="grid grid-cols-2 gap-3">
            {JENIS_KELAMIN_OPTIONS.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "group relative flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-muted/40 text-sm text-foreground",
                  "transition-[background-color,border-color,box-shadow] duration-200 hover:bg-muted/70",
                  "has-checked:border-ring has-checked:bg-primary/10 has-checked:font-semibold has-checked:text-primary",
                  "has-focus-visible:ring-3 has-focus-visible:ring-ring/25",
                  "has-disabled:opacity-50",
                  errors.jenisKelamin && "border-destructive ring-3 ring-destructive/20",
                )}
              >
                <input
                  {...form.register("jenisKelamin")}
                  type="radio"
                  value={value}
                  // Transparan menutupi seluruh kartu: klik & fokus langsung ke radio-nya.
                  className="absolute inset-0 cursor-pointer rounded-xl opacity-0 disabled:cursor-not-allowed"
                />
                <Icon className="h-[1.1rem] w-[1.1rem] text-muted-foreground/70 group-has-checked:text-primary" />
                {label}
              </label>
            ))}
          </div>
          {errors.jenisKelamin && (
            <p className="text-xs font-medium text-destructive">
              {errors.jenisKelamin.message}
            </p>
          )}
        </fieldset>

        <AuthField
          label="Alamat Domisili"
          icon={MapPin}
          align="top"
          error={errors.alamat?.message}
        >
          <textarea
            {...form.register("alamat")}
            aria-invalid={!!errors.alamat}
            disabled={isPending}
            className={`${authInputClass} min-h-20 py-2.5`}
            placeholder="Alamat tempat tinggal saat ini"
          />
        </AuthField>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {error}
              {accountCreated && (
                <>
                  {" "}
                  Silakan{" "}
                  <Link
                    href="/login"
                    className="font-semibold underline underline-offset-4"
                  >
                    masuk di sini
                  </Link>
                  .
                </>
              )}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || accountCreated}
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
