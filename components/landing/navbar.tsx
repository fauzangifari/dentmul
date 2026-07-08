import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/assets/logo.jpg"
            alt="DentMul"
            width={500}
            height={500}
            priority
            className="h-9 w-9 rounded-lg ring-1 ring-foreground/10"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Dent<span className="text-primary">Mul</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <a
            href="#cara-kerja"
            className="hidden h-9 items-center rounded-lg px-3 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Cara Kerja
          </a>
          <a
            href="#faq"
            className="hidden h-9 items-center rounded-lg px-3 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            FAQ
          </a>
          <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Daftar
          </Link>
        </div>
      </nav>
    </header>
  );
}
