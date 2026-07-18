import Link from "next/link";
import { ArrowRight, Camera, Stethoscope, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Ambient signal field — concentric arcs from the DentMul mark, drawn
          faintly behind the whole hero. Purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-12rem] h-[46rem] w-[46rem] opacity-[0.5] [mask-image:radial-gradient(circle,black,transparent_70%)]"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute inset-0 m-auto rounded-full border border-primary/15"
            style={{
              width: `${(i + 1) * 15}%`,
              height: `${(i + 1) * 15}%`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        {/* ---- Left: the thesis ---- */}
        <div className="flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            RSGM · Universitas Mulawarman
          </span>

          <h1 className="font-display text-[2.7rem] leading-[1.04] font-medium tracking-tight text-foreground md:text-6xl">
            Kirim keluhan gigi Anda,{" "}
            <span className="text-primary">sebelum</span> ke rumah sakit.
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Ceritakan Gejala dan unggah foto kondisi mulut anda. Seorang dokter
            gigi muda (DGM) FKG Unmul akan meninjau di bawah supervisi dosen
            dan DPJP (Dokter Penanggung Jawab Pasien)
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              Gratis &amp; rahasia
            </span>
            <span className="inline-flex items-center gap-2">
              <Stethoscope size={16} className="text-primary" />
              Ditinjau koas FK Unmul
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
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

/**
 * The signature: a single case in transit. It is sent (the patient's complaint),
 * it travels as a signal, and a koas reviews it — with the real status track
 * (Menunggu → Ditinjau → Selesai) reading along the bottom.
 */
function TransmissionPanel() {
  return (
    <div className="relative w-full">
      <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Keluhan #2481
          </span>
          <span className="font-mono text-[0.7rem] text-muted-foreground/70">
            10.24 WITA
          </span>
        </div>

        {/* The case being sent */}
        <div
          className="signal-rise flex items-start gap-4"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary ring-1 ring-primary/10">
            <Camera size={22} />
          </div>
          <div className="pt-0.5">
            <p className="font-medium text-foreground">Gusi bengkak &amp; nyeri</p>
            <p className="text-sm text-muted-foreground">
              Terasa saat mengunyah · 2 foto terlampir
            </p>
          </div>
        </div>

        {/* The signal: emitting rings */}
        <div
          aria-hidden
          className="relative my-6 flex h-16 items-center justify-center"
        >
          <span className="absolute h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="relative flex h-16 w-16 items-center justify-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="signal-ring absolute h-6 w-6 rounded-full border border-primary/50"
                style={{ animationDelay: `${i * 1.2}s` }}
              />
            ))}
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <ArrowRight size={15} className="rotate-90" />
            </span>
          </div>
        </div>

        {/* The human reviewing — the one warm moment */}
        <div
          className="signal-rise flex items-center gap-3 rounded-2xl bg-human-soft/60 p-4 ring-1 ring-human/25"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-human/15 text-human">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Koas FK Unmul sedang meninjau
            </p>
            <p className="font-mono text-[0.7rem] uppercase tracking-wide text-human">
              ● Ditinjau
            </p>
          </div>
        </div>

        {/* The real status track */}
        <div className="mt-6">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="track-fill h-full w-[55%] rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
          <div className="mt-2.5 flex justify-between font-mono text-[0.65rem] uppercase tracking-wide">
            <span className="text-primary">Menunggu</span>
            <span className="text-human">Ditinjau</span>
            <span className="text-muted-foreground/60">Selesai</span>
          </div>
        </div>
      </div>
    </div>
  );
}
