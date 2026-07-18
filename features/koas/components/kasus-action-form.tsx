"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitTinjauan } from "@/features/koas/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { KATEGORI_OPTIONS } from "@/features/koas/constants";

const formSchema = z.object({
  kategori: z.string().min(1, { message: "Kategori wajib dipilih" }),
  isPotensial: z.boolean(),
  catatan: z.string().optional(),
  edukasiKonten: z.string().min(10, {
    message: "Pesan edukasi/rekomendasi terlalu singkat (minimal 10 karakter).",
  }),
});

export function KasusActionForm({ skriningId }: { skriningId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori: "",
      isPotensial: false,
      catatan: "",
      edukasiKonten: "",
    },
  });

  // Validasi lolos → tampilkan dialog konfirmasi dulu
  function onValid(values: z.infer<typeof formSchema>) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!pendingValues) return;
    setIsSubmitting(true);
    try {
      const result = await submitTinjauan({
        skriningId,
        kategori: pendingValues.kategori,
        isPotensial: pendingValues.isPotensial,
        catatan: pendingValues.catatan,
        edukasiKonten: pendingValues.edukasiKonten,
      });
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
      setConfirmOpen(false);
      toast.success("Edukasi terkirim. Menunggu persetujuan (ACC) dosen.");
      router.push("/koas/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan tinjauan. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
        <FormField
          control={form.control}
          name="kategori"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Kategori Jenis Kasus
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Pilih kategori kasus..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Klasifikasi bidang perawatan yang paling sesuai dengan keluhan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPotensial"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border bg-background p-4">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-base font-semibold text-foreground">
                  Pasien Potensial
                </FormLabel>
                <FormDescription className="text-xs">
                  Aktifkan bila kasus ini cocok untuk Anda tangani sebagai
                  pasien pribadi.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="catatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Catatan Internal <span className="text-muted-foreground">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan klinis internal untuk arsip koas. Tidak ditampilkan ke pasien..."
                  className="h-24 resize-none bg-background"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Hanya terlihat oleh koas — tidak dikirim ke pasien.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="edukasiKonten"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Edukasi &amp; Rekomendasi
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tuliskan edukasi atau langkah penanganan awal dengan bahasa yang mudah dipahami pasien..."
                  className="h-32 resize-none bg-background"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Pesan ini dikirim ke dosen untuk di-ACC, lalu tampil di portal
                pasien setelah disetujui.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-base"
          disabled={isSubmitting}
        >
          <Send className="mr-1" size={18} />
          Kirim Edukasi
        </Button>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim edukasi untuk di-ACC dosen?</DialogTitle>
            <DialogDescription>
              Edukasi akan dikirim ke dosen untuk ditinjau. Setelah di-ACC dosen,
              edukasi baru terlihat oleh pasien. Pastikan isi tinjauan sudah
              benar sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Periksa Lagi
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 animate-spin" size={18} />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-1" size={18} />
                  Ya, Kirim
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
