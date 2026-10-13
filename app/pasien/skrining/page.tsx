"use client";

import { useRef, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BATAS_RIWAYAT_MEDIS,
  SkriningSchema,
  STEP_FIELDS,
  keluhanKosong,
  type SkriningFormInput,
  type SkriningFormValues,
} from "@/features/skrining/schema";
import { STEPS } from "@/features/skrining/constants";
import { submitSkrining } from "@/features/skrining/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "@/features/skrining/components/photo-uploader";
import { StepLokasi } from "@/features/skrining/components/steps/step-lokasi";
import { StepDetail } from "@/features/skrining/components/steps/step-detail";
import { StepReview } from "@/features/skrining/components/steps/step-review";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Info,
} from "lucide-react";

// Kotak "kenapa ditanya" — transparansi untuk menenangkan pasien awam.
function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-sm text-foreground">
      <Info size={18} className="mt-0.5 shrink-0 text-primary" />
      <p>{children}</p>
    </div>
  );
}

const RIWAYAT_MEDIS = [
  {
    name: "riwayatPenyakit",
    label: "Riwayat penyakit (mis. diabetes, jantung)",
    placeholder: "Contoh: Diabetes, Hipertensi, Asma (kosongkan jika tidak ada)",
  },
  {
    name: "alergiObat",
    label: "Alergi obat atau makanan",
    placeholder: "Kosongkan jika tidak ada",
  },
  {
    name: "obatRutin",
    label: "Obat yang rutin dikonsumsi",
    placeholder: "Kosongkan jika tidak ada",
  },
  {
    name: "kebiasaanBuruk",
    label: "Kebiasaan tertentu",
    placeholder: "Contoh: Merokok, menggeretakkan gigi saat tidur",
  },
] as const satisfies readonly {
  name: (typeof STEP_FIELDS)[2][number];
  label: string;
  placeholder: string;
}[];

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-border pb-5 text-xl font-bold text-foreground">
      {children}
    </h2>
  );
}

/** Gulir ke pesan error pertama setelah validasi gagal. */
function scrollToFirstError() {
  setTimeout(() => {
    document
      .querySelector('[data-skrining-card] [role="alert"], [data-skrining-card] [aria-invalid="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 50);
}

/** Langkah pertama yang memiliki error — dipakai saat submit akhir gagal. */
function firstStepWithError(errors: FieldErrors<SkriningFormInput>) {
  for (const [step, fields] of Object.entries(STEP_FIELDS)) {
    if (fields.some((f) => f in errors)) return Number(step);
  }
  return 0;
}

export default function SkriningPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Skrining sudah tersimpan tetapi ada foto yang gagal diunggah: kirim ulang
  // hanya mengunggah foto yang belum terkirim, tanpa membuat skrining baru.
  const [savedId, setSavedId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // Penjaga ketukan ganda: `isSubmitting` baru aktif setelah validasi async
  // selesai, jadi ketukan kedua yang cepat masih bisa lolos tanpa ini.
  const sedangKirim = useRef(false);

  const form = useForm<SkriningFormInput, unknown, SkriningFormValues>({
    resolver: zodResolver(SkriningSchema),
    defaultValues: {
      keluhan: [keluhanKosong()],
      riwayatPerawatan: [],
      pemicuNyeri: [],
      waktuNyeri: [],
      dampak: [],
      upaya: [],
      gejalaLain: [],
      keteranganObat: "",
      tandaBahaya: {},
      riwayatPenyakit: "",
      alergiObat: "",
      obatRutin: "",
      kebiasaanBuruk: "",
    },
    mode: "onTouched",
  });

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const processNext = async () => {
    const fields = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS];
    const isValid = fields ? await form.trigger([...fields]) : true;

    if (isValid) {
      goToStep(currentStep + 1);
    } else {
      toast.error("Masih ada isian yang perlu dilengkapi.");
      scrollToFirstError();
    }
  };

  const processPrev = () => goToStep(currentStep - 1);

  const onSubmit = async (data: SkriningFormValues) => {
    setIsSubmitting(true);
    setError(null);
    let skriningId = savedId;

    try {
      if (!skriningId) {
        const skriningRes = await submitSkrining(data);
        if (skriningRes.error || !skriningRes.id) {
          throw new Error(skriningRes.error || "Gagal menyimpan skrining");
        }
        skriningId = skriningRes.id;
        setSavedId(skriningRes.id);
      }

      for (const file of files) {
        if (uploadedFiles.includes(file)) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("skriningId", skriningId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || `Gagal mengunggah foto ${file.name}`);
        }
        setUploadedFiles((prev) => [...prev, file]);
      }

      toast.success("Skrining berhasil dikirim!");
      router.push("/pasien/riwayat?success=1");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.";
      setError(
        skriningId
          ? `Skrining Anda sudah tersimpan, tetapi ada foto yang gagal diunggah (${message}). Tekan "Unggah ulang foto" untuk mencoba lagi — foto yang belum terkirim bisa diganti lewat bagian Foto — atau lewati foto.`
          : message
      );
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const kirim = async () => {
    if (sedangKirim.current) return;
    sedangKirim.current = true;
    try {
      await form.handleSubmit(onSubmit, onInvalid)();
    } finally {
      sedangKirim.current = false;
    }
  };

  const lewatiFoto = () => router.push("/pasien/riwayat?success=1");

  const onInvalid = (errors: FieldErrors<SkriningFormInput>) => {
    toast.error("Masih ada isian yang perlu dilengkapi.");
    goToStep(firstStepWithError(errors));
    scrollToFirstError();
  };

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Skrining Baru</h1>
          <p className="mt-2 text-muted-foreground">
            Isi formulir berikut dengan jujur untuk membantu dokter memberikan
            penilaian awal.
          </p>
        </div>

        {/* Step Indicator */}
        <div>
          <div className="relative mb-3 flex items-center justify-between">
            <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 bg-border" />
            <div
              className="absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    idx < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : idx === currentStep
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {idx < currentStep ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    idx <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          {/* Label langkah untuk mobile */}
          <p className="text-center text-sm font-semibold text-primary sm:hidden">
            Langkah {currentStep + 1} dari {STEPS.length}: {STEPS[currentStep]}
          </p>
        </div>

        {/* Form Card */}
        <div
          data-skrining-card
          className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm md:p-8"
        >
          {error && (
            <div className="mb-6 space-y-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <p>{error}</p>
              {savedId && (
                <Button type="button" variant="outline" size="sm" onClick={lewatiFoto}>
                  Lewati foto, lihat riwayat
                </Button>
              )}
            </div>
          )}

          {currentStep === 0 && <StepLokasi />}

          {currentStep === 1 && <StepDetail onEditLokasi={() => goToStep(0)} />}

          {currentStep === 2 && (
            <div className="space-y-6">
              <StepHeading>Riwayat Medis</StepHeading>
              <WhyBox>
                Informasi ini membantu dokter memastikan tindakan yang aman untuk
                kondisi kesehatan Anda. Kosongkan bila tidak ada.
              </WhyBox>

              {RIWAYAT_MEDIS.map(({ name, label, placeholder }) => {
                const fieldError = form.formState.errors[name]?.message;
                return (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name} className="text-base">
                      {label}
                    </Label>
                    <Textarea
                      id={name}
                      placeholder={placeholder}
                      maxLength={BATAS_RIWAYAT_MEDIS}
                      aria-invalid={Boolean(fieldError)}
                      {...form.register(name)}
                      className="text-base"
                    />
                    {fieldError && (
                      <p role="alert" className="text-sm font-medium text-destructive">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <StepHeading>Foto Rongga Mulut</StepHeading>
              <WhyBox>
                Foto membantu dokter melihat kondisi gigi/mulut Anda lebih jelas.
                Langkah ini opsional, maksimal 5 foto.
              </WhyBox>
              <PhotoUploader
                files={files}
                onFilesChange={setFiles}
                maxFiles={5}
                lockedFiles={uploadedFiles}
              />
            </div>
          )}

          {currentStep === 4 && (
            <StepReview
              fotoCount={files.length}
              goToStep={goToStep}
              terkunci={Boolean(savedId)}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={processPrev}
            // Setelah skrining tersimpan, jawaban tidak bisa diubah lagi.
            disabled={currentStep === 0 || isSubmitting || (Boolean(savedId) && currentStep !== 4)}
            className="h-12 w-full text-base sm:w-36"
          >
            <ChevronLeft className="mr-1" size={18} /> Kembali
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              size="lg"
              onClick={processNext}
              className="h-12 w-full text-base sm:w-40"
            >
              Selanjutnya <ChevronRight className="ml-1" size={18} />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={kirim}
              disabled={isSubmitting}
              className="h-12 w-full text-base sm:w-48"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 animate-spin" size={18} /> Mengirim...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1" size={18} />{" "}
                  {savedId ? "Unggah ulang foto" : "Kirim Skrining"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
