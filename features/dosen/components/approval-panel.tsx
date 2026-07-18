"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { approveEdukasi, rejectEdukasi } from "@/features/dosen/actions";
import { Loader2, CheckCircle2, XCircle, Star } from "lucide-react";

export function ApprovalPanel({
  skriningId,
  kategori,
  isPotensial,
  catatan,
  konten,
  koasName,
}: {
  skriningId: string;
  kategori: string;
  isPotensial: boolean;
  catatan: string | null;
  konten: string;
  koasName: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [alasan, setAlasan] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const res = await approveEdukasi({ skriningId });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res?.success ?? "Edukasi disetujui.");
      router.push("/dosen/dashboard");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectEdukasi({ skriningId, catatan: alasan });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setRejectOpen(false);
      toast.success(res?.success ?? "Edukasi ditolak.");
      router.push("/dosen/dashboard");
    });
  }

  return (
    <div className="space-y-5">
      {/* Ringkasan tinjauan koas yang akan di-ACC */}
      <div className="space-y-4 text-sm">
        <Detail label="Diajukan oleh" value={koasName ?? "Koas"} />
        <Detail label="Kategori" value={kategori} />
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Status Potensial
          </span>
          {isPotensial ? (
            <Badge className="gap-1">
              <Star size={12} /> Pasien Potensial
            </Badge>
          ) : (
            <Badge variant="outline">Bukan Potensial</Badge>
          )}
        </div>
        {catatan && (
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Catatan Internal Koas
            </span>
            <p className="rounded-lg border border-border bg-background p-3 whitespace-pre-wrap text-foreground">
              {catatan}
            </p>
          </div>
        )}
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Pesan Edukasi untuk Pasien
          </span>
          <p className="rounded-lg border border-border bg-background p-3 font-medium whitespace-pre-wrap text-foreground">
            {konten}
          </p>
        </div>
      </div>

      {/* Aksi ACC / Tolak */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Button
          size="lg"
          className="h-12 w-full text-base"
          onClick={handleApprove}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-1 animate-spin" size={18} />
          ) : (
            <CheckCircle2 className="mr-1" size={18} />
          )}
          ACC — Setujui &amp; Kirim ke Pasien
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 w-full text-destructive hover:text-destructive"
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
        >
          <XCircle className="mr-1" size={18} />
          Tolak
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak edukasi ini?</DialogTitle>
            <DialogDescription>
              Kasus akan dikembalikan ke koas untuk direvisi. Alasan penolakan
              bersifat opsional dan akan ditampilkan ke koas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan penolakan (opsional)..."
            className="h-28 resize-none"
            disabled={isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 animate-spin" size={18} /> Memproses...
                </>
              ) : (
                <>
                  <XCircle className="mr-1" size={18} /> Ya, Tolak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
