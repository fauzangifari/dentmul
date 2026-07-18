"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark";

function apply(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem("dentmul-theme", mode);
  } catch {
    // storage unavailable — ignore, in-memory toggle still works
  }
}

// Baca tema langsung dari DOM (kelas `dark` pada <html>) lewat
// useSyncExternalStore — pola React 19 untuk state eksternal tanpa hydration
// mismatch: server memakai getServerSnapshot ("light"), klien menyusul setelah
// hydrasi. MutationObserver membuat toggle di tempat lain ikut sinkron.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Mode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Mode {
  return "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = mode === "dark";

  function toggle() {
    apply(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className
      )}
    >
      {isDark ? (
        <Moon size={18} className="transition-transform duration-300" />
      ) : (
        <Sun size={18} className="transition-transform duration-300" />
      )}
    </button>
  );
}
