import { Plus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Apakah layanan skrining ini gratis?",
    answer:
      "Ya. Skrining awal melalui DentMul dapat digunakan tanpa biaya sebagai langkah awal sebelum Anda memutuskan datang ke RSGM.",
  },
  {
    question: "Siapa yang meninjau keluhan saya?",
    answer:
      "Keluhan dan foto Anda ditinjau oleh koas (mahasiswa profesi) kedokteran gigi FK Universitas Mulawarman di bawah supervisi dosen pembimbing.",
  },
  {
    question: "Berapa lama sampai saya menerima hasil?",
    answer:
      "Waktu tinjauan bergantung pada antrean kasus. Anda dapat memantau status kasus dari Menunggu, Ditinjau, hingga Selesai langsung di dashboard Anda.",
  },
  {
    question: "Apakah data dan foto saya aman?",
    answer:
      "Data keluhan dan foto Anda hanya digunakan untuk keperluan skrining dan hanya dapat diakses oleh koas serta pembimbing yang menangani kasus Anda.",
  },
  {
    question: "Kapan saya tetap harus datang ke klinik?",
    answer:
      "Skrining ini bersifat awal dan bukan pengganti pemeriksaan langsung. Jika keluhan berat, nyeri hebat, bengkak, atau perdarahan, segera kunjungi RSGM atau fasilitas kesehatan terdekat.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-background py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-3 md:sticky md:top-24 md:h-fit">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            FAQ
          </span>
          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Yang perlu Anda ketahui.
          </h2>
          <p className="text-lg text-muted-foreground">
            Hal-hal penting sebelum Anda memulai skrining pertama.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border border-t border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium text-foreground marker:hidden">
                {faq.question}
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-300 group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
