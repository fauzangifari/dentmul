import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Clock, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Closing CTA — the page's single job, restated */}
      <div className="relative overflow-hidden border-b border-background/15">
        {/* Signal echo, faint, in the footer's own dark field */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] [mask-image:radial-gradient(circle,black,transparent_70%)]"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute inset-0 m-auto rounded-full border border-background/40"
              style={{ width: `${(i + 1) * 18}%`, height: `${(i + 1) * 18}%` }}
            />
          ))}
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-medium tracking-tight md:text-4xl">
            Punya keluhan gigi? Kirim sekarang, tinjau lebih awal.
          </h2>
          <Link
            href="/register"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-7 text-base font-medium text-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-background/40"
          >
            Mulai Skrining
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/logo.jpg"
              alt="DentMul"
              width={500}
              height={500}
              className="h-11 w-11 rounded-lg"
            />
            <span className="text-lg font-bold">DentMul</span>
          </div>
          <p className="max-w-xs text-sm text-background/70">
            Sistem skrining awal teledentistry RSGM Universitas Mulawarman.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-background/50">
            Navigasi
          </h3>
          <Link href="#cara-kerja" className="text-sm text-background/80 hover:text-background">
            Cara Kerja
          </Link>
          <Link href="#faq" className="text-sm text-background/80 hover:text-background">
            FAQ
          </Link>
          <Link href="/register" className="text-sm text-background/80 hover:text-background">
            Mulai Skrining
          </Link>
          <Link href="/login" className="text-sm text-background/80 hover:text-background">
            Masuk
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-background/50">
            Kontak
          </h3>
          <p className="flex items-start gap-2 text-sm text-background/80">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            RSGM Universitas Mulawarman, Samarinda, Kalimantan Timur
          </p>
          <p className="flex items-center gap-2 text-sm text-background/80">
            <Mail size={16} className="shrink-0" />
            info@rsgm.unmul.ac.id
          </p>
          <p className="flex items-center gap-2 text-sm text-background/80">
            <Clock size={16} className="shrink-0" />
            Senin–Jumat, 08.00–16.00 WITA
          </p>
        </div>
      </div>

      <div className="border-t border-background/15">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-center text-xs text-background/60">
            © {new Date().getFullYear()} DentMul — RSGM Universitas Mulawarman.
            Skrining ini bersifat awal dan bukan pengganti pemeriksaan langsung
            oleh dokter gigi.
          </p>
        </div>
      </div>
    </footer>
  );
}
