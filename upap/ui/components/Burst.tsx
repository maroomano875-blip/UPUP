'use client';
// انفجار جزيئات صغير (احتفال) يظهر لحظة نجاح ثم يزول؛ يتوقف عند «تقليل الحركة» عبر CSS.
const DOTS = Array.from({ length: 12 }, (_, i) => i);
const COLORS = ['#e0b45a', '#6ee7b7', '#a5b4fc', '#fca5a5'];

export default function Burst({ show }: { show: number }) {
  if (!show) return null;
  return (
    <span key={show} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {DOTS.map((i) => {
        const a = (i / DOTS.length) * Math.PI * 2;
        return (
          <span key={i} className="fx-dotburst absolute start-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{ background: COLORS[i % COLORS.length], ['--dx' as string]: `${Math.cos(a) * 46}px`, ['--dy' as string]: `${Math.sin(a) * 46}px` }} />
        );
      })}
    </span>
  );
}
