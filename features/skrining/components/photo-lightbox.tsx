"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";

interface PhotoLightboxProps {
  src: string;
  alt: string;
}

export function PhotoLightbox({ src, alt }: PhotoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border border-border bg-card/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ZoomIn className="text-white w-8 h-8 drop-shadow-md" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl max-h-[85vh] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </>
  );
}
