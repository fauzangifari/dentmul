import Image from "next/image"
import Link from "next/link"
import { TransmissionAside } from "./_components/transmission-aside"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[0.95fr_1fr] lg:grid-cols-[1fr_1fr]">
      {/* Left: the signal (md and up) */}
      <TransmissionAside />

      {/* Right: the form */}
      <div className="flex min-h-screen flex-col justify-center overflow-y-auto bg-background px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile wordmark — the aside is hidden on phones */}
          <Link
            href="/"
            className="mb-10 flex items-center gap-2.5 md:hidden"
          >
            <Image
              src="/assets/logo.jpg"
              alt="DentMul"
              width={50}
              height={50}
              priority
              className="h-9 w-9 rounded-lg ring-1 ring-border"
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              DentMul
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
