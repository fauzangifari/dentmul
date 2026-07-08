"use client";

interface PainScaleProps {
  value: number;
  onChange: (value: number) => void;
}

// Emoji wajah skeuomorphic: makin tinggi angka, makin kesakitan.
function faceFor(value: number) {
  if (value <= 2) return { emoji: "🙂", label: "Ringan", color: "text-emerald-600" };
  if (value <= 4) return { emoji: "😐", label: "Cukup terasa", color: "text-lime-600" };
  if (value <= 6) return { emoji: "😕", label: "Mengganggu", color: "text-amber-600" };
  if (value <= 8) return { emoji: "😣", label: "Sakit", color: "text-orange-600" };
  return { emoji: "😖", label: "Sangat sakit", color: "text-destructive" };
}

export function PainScale({ value, onChange }: PainScaleProps) {
  const safeValue = Math.min(10, Math.max(1, value || 1));
  const face = faceFor(safeValue);
  const percent = ((safeValue - 1) / 9) * 100;

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      {/* Wajah + angka besar */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl leading-none" aria-hidden>
          {face.emoji}
        </span>
        <span className={`text-lg font-bold ${face.color}`}>{face.label}</span>
        <span className="text-sm text-muted-foreground">
          Skala {safeValue} dari 10
        </span>
      </div>

      {/* Slider besar */}
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Skala nyeri, 1 ringan sampai 10 sangat sakit"
        className="pain-range mt-5 h-3 w-full cursor-pointer appearance-none rounded-full bg-muted"
        style={{
          background: `linear-gradient(to right, var(--primary) ${percent}%, var(--muted) ${percent}%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
        <span>🙂 Ringan</span>
        <span>Sangat Sakit 😖</span>
      </div>

      <style>{`
        .pain-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: var(--primary);
          border: 3px solid var(--background);
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .pain-range::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: var(--primary);
          border: 3px solid var(--background);
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
