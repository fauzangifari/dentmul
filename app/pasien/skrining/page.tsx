"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkriningSchema, type SkriningFormValues } from "@/features/skrining/schema";
import { submitSkrining } from "@/features/skrining/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "@/features/skrining/components/photo-uploader";
import { PainScale } from "@/features/skrining/components/pain-scale";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Info,
  Pencil,
} from "lucide-react";

const STEPS = ["Keluhan Utama", "Riwayat Medis", "Foto Mulut", "Review & Kirim"];

// Kotak "kenapa ditanya" — transparansi untuk menenangkan pasien awam.
function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-sm text-foreground">
      <Info size={18} className="mt-0.5 shrink-0 text-primary" />
      <p>{children}</p>
    </div>
  );
}

export default function SkriningPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SkriningFormValues>({
    resolver: zodResolver(SkriningSchema) as never,
    defaultValues: {
      keluhanUtama: "",
      keluhanTambahan: "",
      durasiKeluhan: "",
      lokasiSakit: "",
      skalaNyeri: 5,
      riwayatPenyakit: "",
      alergiObat: "",
      obatRutin: "",
      kebiasaanBuruk: "",
    },
    mode: "onTouched",
  });

  const processNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await form.trigger([
        "keluhanUtama",
        "durasiKeluhan",
        "lokasiSakit",
        "skalaNyeri",
      ]);
    } else if (currentStep === 1) {
      isValid = await form.trigger([
        "riwayatPenyakit",
        "alergiObat",
        "obatRutin",
        "kebiasaanBuruk",
      ]);
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const processPrev = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: SkriningFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const skriningRes = await submitSkrining(data);
      if (skriningRes.error || !skriningRes.id) {
        throw new Error(skriningRes.error || "Gagal menyimpan skrining");
      }

      const skriningId = skriningRes.id;

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("skriningId", skriningId);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json();
            throw new Error(errData.error || "Gagal mengunggah foto");
          }
        }
      }

      toast.success("Skrining berhasil dikirim!");
      router.push("/pasien/riwayat?success=1");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.";
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const formData = form.watch();

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Skrining Baru</h1>
        <p className="mt-2 text-muted-foreground">
          Isi form berikut dengan jujur untuk membantu dokter memberikan penilaian awal.
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
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm md:p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-bold text-foreground">
              Keluhan Utama
            </h2>
            <WhyBox>
              Ceritakan keluhan Anda apa adanya. Semakin jelas, semakin tepat
              dokter membantu Anda.
            </WhyBox>

            <div className="space-y-2">
              <Label htmlFor="keluhanUtama" className="text-base text-foreground">
                Apa keluhan utama Anda? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="keluhanUtama"
                placeholder="Contoh: Gigi geraham bawah kanan terasa nyeri berdenyut sejak kemarin..."
                {...form.register("keluhanUtama")}
                className={`min-h-24 text-base ${
                  form.formState.errors.keluhanUtama ? "border-destructive" : ""
                }`}
              />
              {form.formState.errors.keluhanUtama && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.keluhanUtama.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durasiKeluhan" className="text-base">
                Sudah berapa lama keluhan dirasakan?{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="durasiKeluhan"
                placeholder="Contoh: 3 hari, 1 minggu"
                {...form.register("durasiKeluhan")}
                className={`h-12 text-base ${
                  form.formState.errors.durasiKeluhan ? "border-destructive" : ""
                }`}
              />
              {form.formState.errors.durasiKeluhan && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.durasiKeluhan.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasiSakit" className="text-base">
                Di bagian mana yang sakit?
              </Label>
              <Input
                id="lokasiSakit"
                placeholder="Contoh: Rahang bawah kiri"
                {...form.register("lokasiSakit")}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Seberapa sakit yang Anda rasakan?</Label>
              <PainScale
                value={Number(formData.skalaNyeri) || 5}
                onChange={(v) =>
                  form.setValue("skalaNyeri", v, { shouldValidate: true })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keluhanTambahan" className="text-base">
                Keluhan tambahan (opsional)
              </Label>
              <Textarea
                id="keluhanTambahan"
                placeholder="Adakah keluhan lain yang ingin Anda sampaikan?"
                {...form.register("keluhanTambahan")}
                className="text-base"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-bold text-foreground">
              Riwayat Medis
            </h2>
            <WhyBox>
              Informasi ini membantu dokter memastikan tindakan yang aman untuk
              kondisi kesehatan Anda. Kosongkan bila tidak ada.
            </WhyBox>

            <div className="space-y-2">
              <Label htmlFor="riwayatPenyakit" className="text-base">
                Riwayat penyakit (mis. diabetes, jantung)
              </Label>
              <Textarea
                id="riwayatPenyakit"
                placeholder="Contoh: Diabetes, Hipertensi, Asma (kosongkan jika tidak ada)"
                {...form.register("riwayatPenyakit")}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alergiObat" className="text-base">
                Alergi obat atau makanan
              </Label>
              <Textarea
                id="alergiObat"
                placeholder="Kosongkan jika tidak ada"
                {...form.register("alergiObat")}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obatRutin" className="text-base">
                Obat yang rutin dikonsumsi
              </Label>
              <Textarea
                id="obatRutin"
                placeholder="Kosongkan jika tidak ada"
                {...form.register("obatRutin")}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kebiasaanBuruk" className="text-base">
                Kebiasaan tertentu
              </Label>
              <Textarea
                id="kebiasaanBuruk"
                placeholder="Contoh: Merokok, menggeretakkan gigi saat tidur"
                {...form.register("kebiasaanBuruk")}
                className="text-base"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-bold text-foreground">
              Foto Rongga Mulut
            </h2>
            <WhyBox>
              Foto membantu dokter melihat kondisi gigi/mulut Anda lebih jelas.
              Langkah ini opsional, maksimal 5 foto.
            </WhyBox>
            <PhotoUploader files={files} onFilesChange={setFiles} maxFiles={5} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <h2 className="border-b pb-2 text-2xl font-bold text-foreground">
              Review &amp; Kirim
            </h2>
            <p className="text-sm text-muted-foreground">
              Periksa kembali data Anda. Ketuk &ldquo;Ubah&rdquo; bila ada yang
              perlu diperbaiki.
            </p>

            <div className="space-y-6">
              <ReviewSection title="Keluhan" onEdit={() => goToStep(0)}>
                <ReviewRow label="Keluhan Utama" value={formData.keluhanUtama} />
                <ReviewRow label="Durasi" value={formData.durasiKeluhan} />
                <ReviewRow label="Lokasi Sakit" value={formData.lokasiSakit} />
                <ReviewRow
                  label="Skala Nyeri"
                  value={
                    formData.skalaNyeri
                      ? `${formData.skalaNyeri} dari 10`
                      : ""
                  }
                />
                <ReviewRow
                  label="Keluhan Tambahan"
                  value={formData.keluhanTambahan}
                />
              </ReviewSection>

              <ReviewSection title="Riwayat Medis" onEdit={() => goToStep(1)}>
                <ReviewRow label="Riwayat Penyakit" value={formData.riwayatPenyakit} />
                <ReviewRow label="Alergi" value={formData.alergiObat} />
                <ReviewRow label="Obat Rutin" value={formData.obatRutin} />
                <ReviewRow label="Kebiasaan" value={formData.kebiasaanBuruk} />
              </ReviewSection>

              <ReviewSection title="Foto" onEdit={() => goToStep(2)}>
                <ReviewRow
                  label="Foto dilampirkan"
                  value={files.length > 0 ? `${files.length} foto` : ""}
                />
              </ReviewSection>
            </div>

            <div className="rounded-xl bg-accent/50 p-4 text-sm text-foreground">
              <p>
                Dengan mengirimkan form ini, saya menyatakan data yang diisi
                adalah benar dan bersedia data ini digunakan untuk keperluan
                skrining awal teledentistry di RSGM Universitas Mulawarman.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={processPrev}
          disabled={currentStep === 0 || isSubmitting}
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
            onClick={() => onSubmit(formData)}
            disabled={isSubmitting}
            className="h-12 w-full text-base sm:w-48"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 animate-spin" size={18} /> Mengirim...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1" size={18} /> Kirim Skrining
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-primary">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary"
        >
          <Pencil size={14} className="mr-1" /> Ubah
        </Button>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  const filled = value != null && String(value).trim() !== "";
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`col-span-2 ${
          filled ? "font-medium text-foreground" : "text-muted-foreground italic"
        }`}
      >
        {filled ? value : "Tidak diisi"}
      </dd>
    </div>
  );
}
