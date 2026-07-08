import Image from "next/image"
import Link from "next/link"
import { Camera, Stethoscope, Check } from "lucide-react"

/**
 * The auth signature — the left "transmission field".
 *
 * Not a marketing gradient: it draws the real skrining pipeline as a vertical
 * signal spine (Menunggu → Ditinjau → Selesai). The two people who sign in here
 * are the two ends of that spine — the pasien who sends a case (node 1) and the
 * koas who reviews it (node 2, the one warm amber moment). That is what makes
 * this screen belong to DentMul and speak to both audiences at once.
 */
export function TransmissionAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-linear-to-br from-[#081F5C] via-[#122a6b] to-[#334EAC] p-12 text-white md:flex md:flex-col md:justify-between lg:p-16">
      {/* Ambient signal — concentric arcs from the DentMul mark, masked. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 -top-40 h-[46rem] w-[46rem] opacity-60 [mask-image:radial-gradient(circle,black,transparent_70%)]"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute inset-0 m-auto rounded-full border border-white/15"
            style={{ width: `${(i + 1) * 15}%`, height: `${(i + 1) * 15}%` }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <Link href="/" className="relative flex items-center gap-3">
        <Image
          src="/assets/logo.jpg"
          alt="DentMul"
          width={500}
          height={500}
          priority
          className="h-11 w-11 rounded-xl ring-1 ring-white/20"
        />
        <span className="text-xl font-semibold tracking-tight">DentMul</span>
      </Link>

      {/* The thesis + the spine */}
      <div className="relative max-w-md space-y-9">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-blue-100/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Skrining Teledentistry · RSGM Unmul
          </span>
          <h2 className="font-display text-[2.4rem] font-medium leading-[1.08] tracking-tight lg:text-[2.7rem]">
            Satu keluhan,
            <br />
            satu alur yang jelas.
          </h2>
        </div>

        <SignalSpine />
      </div>

      {/* Provenance */}
      <p className="relative font-mono text-[0.68rem] uppercase tracking-[0.14em] text-blue-200/50">
        © {new Date().getFullYear()} FKG Universitas Mulawarman
      </p>
    </aside>
  )
}

function SignalSpine() {
  return (
    <ol className="space-y-1">
      <SpineNode
        icon={Camera}
        title="Anda mengirim keluhan"
        status="Menunggu"
        tone="patient"
      />
      <SpineConnector active />
      <SpineNode
        icon={Stethoscope}
        title="Koas meninjau kasus"
        status="Ditinjau"
        tone="koas"
      />
      <SpineConnector />
      <SpineNode
        icon={Check}
        title="Hasil skrining siap"
        status="Selesai"
        tone="done"
      />
    </ol>
  )
}

function SpineNode({
  icon: Icon,
  title,
  status,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  status: string
  tone: "patient" | "koas" | "done"
}) {
  // The koas node is the warm human moment — the only place amber appears.
  const koas = tone === "koas"
  return (
    <li className="flex items-center gap-4">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        {koas && (
          <>
            {[0, 1].map((i) => (
              <span
                key={i}
                aria-hidden
                className="signal-ring absolute h-6 w-6 rounded-full border border-[#f0a94a]/60"
                style={{ animationDelay: `${i * 1.4}s` }}
              />
            ))}
          </>
        )}
        <span
          className={
            koas
              ? "relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f0a94a] text-[#3a2a12] shadow-lg shadow-[#f0a94a]/25"
              : "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-blue-50 ring-1 ring-white/15 backdrop-blur-sm"
          }
        >
          <Icon size={18} />
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[0.95rem] font-medium text-white">{title}</p>
        <p
          className={
            koas
              ? "font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#f6c079]"
              : "font-mono text-[0.65rem] uppercase tracking-[0.14em] text-blue-200/60"
          }
        >
          {koas ? "● " : ""}
          {status}
        </p>
      </div>
    </li>
  )
}

function SpineConnector({ active = false }: { active?: boolean }) {
  return (
    <li aria-hidden className="ml-[1.35rem] flex h-6 items-center">
      <span
        className={
          active
            ? "h-full w-px bg-linear-to-b from-white/40 to-[#f0a94a]/70"
            : "h-full w-px bg-white/15"
        }
      />
    </li>
  )
}
