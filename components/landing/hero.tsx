import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ClipboardList,
  Stethoscope,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* One signal, one origin: the same rings that pulse inside the
          transmission panel, at ambient scale, behind the whole hero. */}
      <div
        aria-hidden
        className="signal-breathe pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-70 [mask-image:radial-gradient(circle,black,transparent_72%)] md:left-[58%] md:h-[60rem] md:w-[60rem]"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span
            key={i}
            className={`absolute inset-0 m-auto rounded-full border ${
              i % 2 === 0 ? "border-primary/12" : "border-secondary/14"
            }`}
            style={{
              width: `${(i + 1) * 12}%`,
              height: `${(i + 1) * 12}%`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        {/* ---- Left: the thesis ---- */}
        <div className="flex flex-col items-start gap-7">
          <span
            className="signal-rise inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Image
              src="/assets/logo.jpg"
              alt=""
              width={500}
              height={500}
              className="h-5 w-5 rounded-md ring-1 ring-primary/15"
            />
            RSGM · Universitas Mulawarman
          </span>

          <h1
            className="signal-rise font-display text-[3.1rem] leading-[0.99] font-medium tracking-tight text-foreground md:text-7xl"
            style={{ animationDelay: "0.08s" }}
          >
            Kirim keluhan gigi Anda,{" "}
            <span className="relative text-primary">
              sebelum
              <SignalMark className="absolute -right-4 -top-1 h-4 w-4 text-primary/55 md:-right-5 md:-top-1.5 md:h-5 md:w-5" />
            </span>{" "}
            ke rumah sakit.
          </h1>

          <p
            className="signal-rise max-w-md text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.16s" }}
          >
            Ceritakan Gejala dan unggah foto kondisi mulut anda. Seorang dokter
            gigi muda (DGM) FKG Unmul akan meninjau di bawah supervisi dosen
            dan DPJP (Dokter Penanggung Jawab Pasien)
          </p>

          <div
            className="signal-rise flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.24s" }}
          >
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              Mulai Skrining
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              Lihat cara kerja
            </a>
          </div>

          <div
            className="signal-rise flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-muted-foreground"
            style={{ animationDelay: "0.32s" }}
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={17} className="text-primary" />
              Gratis &amp; rahasia
            </span>
            <span aria-hidden className="hidden h-4 w-px bg-border sm:inline-block" />
            <span className="inline-flex items-center gap-2">
              <Stethoscope size={17} className="text-primary" />
              Ditinjau koas (DGM) FKG Unmul
            </span>
          </div>

          <p
            className="signal-rise text-sm text-muted-foreground"
            style={{ animationDelay: "0.4s" }}
          >
            Sudah punya akun koas?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* ---- Right: the transmission ---- one case, sent and reviewed ---- */}
        <TransmissionPanel />
      </div>
    </section>
  );
}

/** Two arcs radiating from a point — the wordmark's WiFi signal, in miniature. */
function SignalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="3.2" cy="12.8" r="1.4" fill="currentColor" />
      <path
        d="M6.2 9.8a4 4 0 0 1 4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.4 7.6a7 7 0 0 1 7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

const TRANSMISSION_STEPS = [
  {
    number: "01",
    status: "Menunggu",
    icon: ClipboardList,
    title: "Kirim keluhan & foto",
    description: "Ceritakan gejala dan unggah foto kondisi mulut Anda.",
    dot: "bg-primary text-primary-foreground",
    label: "text-primary",
  },
  {
    number: "02",
    status: "Ditinjau",
    icon: Stethoscope,
    title: "Ditinjau DGM",
    description: "Koas memeriksa kasus di bawah supervisi dosen & DPJP.",
    dot: "bg-human text-white",
    label: "text-human",
  },
  {
    number: "03",
    status: "Selesai",
    icon: FileCheck2,
    title: "Terima hasil",
    description: "Edukasi dan rekomendasi tindak lanjut masuk ke dashboard.",
    dot: "bg-secondary text-secondary-foreground",
    label: "text-secondary",
  },
] as const;

/**
 * The right column mirrors the "Cara Kerja" section below fold-for-fold —
 * same three steps, same status labels — so the process is legible before
 * anyone scrolls, not just implied by a single case snapshot.
 */
function TransmissionPanel() {
  return (
    <div className="relative w-full">
      {/* Ghost card — the panel's own weight, cast a couple degrees off-axis */}
      <div
        aria-hidden
        className="absolute inset-0 mx-auto w-full max-w-md rotate-[-3deg] rounded-3xl border border-border/70 bg-card/70 shadow-lg"
      />

      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-human to-secondary"
        />

        <div className="signal-rise mb-6 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Cara Kerja
          </span>
          <span className="font-mono text-[0.7rem] text-muted-foreground/70">
            3 langkah
          </span>
        </div>

        <ol className="relative flex flex-col gap-6">
          <div
            aria-hidden
            className="absolute bottom-2 left-7 top-2 w-px bg-gradient-to-b from-primary/40 via-human/40 to-secondary/40"
          />
          {TRANSMISSION_STEPS.map((step, i) => (
            <li
              key={step.status}
              className="signal-rise relative flex items-start gap-4"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <div
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ring-4 ring-card ${step.dot}`}
              >
                <step.icon size={22} />
              </div>
              <div className="pt-1.5">
                <span
                  className={`font-mono text-[0.68rem] uppercase tracking-widest ${step.label}`}
                >
                  {step.number} · {step.status}
                </span>
                <p className="mt-0.5 font-medium text-foreground">
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
