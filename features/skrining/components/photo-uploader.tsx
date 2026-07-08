"use client";

import { useState, useRef } from "react";
import { Camera, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function PhotoUploader({ files, onFilesChange, maxFiles = 5 }: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const showError = (message: string) => {
    setError(message);
    toast.error(message);
  };

  const handleFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles = newFiles.filter((file) => {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showError(`"${file.name}" bukan foto. Gunakan file gambar (JPG atau PNG).`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError(`"${file.name}" terlalu besar (maks. 5MB per foto).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const totalFiles = [...files, ...validFiles];
    if (totalFiles.length > maxFiles) {
      showError(`Maksimal ${maxFiles} foto. Sebagian foto tidak ditambahkan.`);
      onFilesChange(totalFiles.slice(0, maxFiles));
    } else {
      onFilesChange(totalFiles);
    }
  };

  const removeFile = (index: number) => {
    setError(null);
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        className={cnDrop(dragActive, !!error)}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/jpg"
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Pilih atau ambil foto rongga mulut"
        />
        <div className="pointer-events-none flex flex-col items-center gap-3 text-center">
          <div className="mb-1 rounded-full bg-primary/10 p-5 text-primary">
            <Camera size={40} />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Ketuk untuk ambil atau pilih foto
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Ambil foto dengan cahaya yang cukup dan dekatkan kamera ke area yang
            sakit agar terlihat jelas.
          </p>
          <p className="text-xs text-muted-foreground">
            Maks. {maxFiles} foto · JPG atau PNG · maks. 5MB per foto
          </p>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-foreground">Foto terpilih</span>
            <span
              className={
                files.length === maxFiles ? "text-destructive" : "text-muted-foreground"
              }
            >
              {files.length} / {maxFiles}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Foto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile(i);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-white shadow-md transition-opacity hover:bg-destructive/90"
                  title="Hapus foto"
                  aria-label={`Hapus foto ${i + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function cnDrop(active: boolean, hasError: boolean) {
  const base =
    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-colors";
  if (active) return `${base} border-primary bg-accent/50`;
  if (hasError) return `${base} border-destructive/40 bg-destructive/5`;
  return `${base} border-border bg-card hover:bg-accent/20`;
}
