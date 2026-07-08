import type { LucideIcon } from "lucide-react";
import { ClipboardList, Stethoscope, FileCheck2 } from "lucide-react";

interface Step {
  status: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "primary" | "human" | "done";
}

const STEPS: Step[] = [
  {
    status: "Menunggu",
    icon: ClipboardList,
    title: "Kirim keluhan & foto",
    description:
      "Ceritakan gejala yang Anda rasakan dan unggah foto kondisi mulut atau gigi. Kasus langsung masuk antrean.",
    accent: "primary",
  },
  {
    status: "Ditinjau",
    icon: Stethoscope,
    title: "Ditinjau oleh koas",
    description:
      "Koas kedokteran gigi FK Unmul memeriksa kasus Anda di bawah supervisi dosen pembimbing.",
    accent: "human",
  },
  {
    status: "Selesai",
    icon: FileCheck2,
    title: "Terima edukasi & rekomendasi",
    description:
      "Anda menerima hasil skrining awal, edukasi, dan rekomendasi tindak lanjut — langsung di dashboard.",
    accent: "done",
  },
];

const DOT: Record<Step["accent"], string> = {
  primary: "bg-primary text-primary-foreground",
  human: "bg-human text-white",
  done: "bg-secondary text-secondary-foreground",
};

const LABEL: Record<Step["accent"], string> = {
  primary: "text-primary",
  human: "text-human",
  done: "text-secondary",
};

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="relative bg-accent/25 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Cara Kerja
          </span>
          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Satu kasus, tiga status.
          </h2>
          <p className="text-lg text-muted-foreground">
            Ikuti perjalanan keluhan Anda dari saat dikirim hingga selesai
            ditinjau — sama seperti yang Anda lihat di dashboard.
          </p>
        </div>

        <div className="relative mt-16">
          {/* The signal spine connecting the three states */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-primary/40 via-human/40 to-secondary/40 md:block"
          />

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.status} className="relative flex flex-col gap-4">
                <div className="flex items-center gap-4 md:block">
                  <div
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-md ring-4 ring-accent/25 ${DOT[step.accent]}`}
                  >
                    <step.icon size={24} />
                  </div>
                  <span
                    className={`font-mono text-xs uppercase tracking-widest md:mt-5 md:block ${LABEL[step.accent]}`}
                  >
                    {String(i + 1).padStart(2, "0")} · {step.status}
                  </span>
                </div>
                <div className="md:mt-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
