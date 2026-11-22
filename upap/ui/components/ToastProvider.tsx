'use client';
// نظام إشعارات صغير: ينزلق من الأسفل، يختفي تلقائياً بشريط تقدّم، ويدعم زر إجراء (رابط).
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Link from 'next/link';

export type ToastKind = 'info' | 'success' | 'warn' | 'error';
export type ToastInput = { kind?: ToastKind; title: string; body?: string; action?: { label: string; href: string }; ttl?: number };
type Item = ToastInput & { id: number; kind: ToastKind; ttl: number };

const Ctx = createContext<{ push: (t: ToastInput) => void }>({ push: () => {} });
export const useToast = () => useContext(Ctx);

const STYLE: Record<ToastKind, { ring: string; icon: string; glyph: string }> = {
  info: { ring: 'border-[rgba(165,180,252,0.5)]', icon: 'bg-[rgba(99,102,241,0.25)] text-[#c7d2fe]', glyph: 'i' },
  success: { ring: 'border-[rgba(52,211,153,0.5)]', icon: 'bg-[rgba(16,185,129,0.25)] text-[#6ee7b7]', glyph: '✓' },
  warn: { ring: 'border-[rgba(224,180,90,0.55)]', icon: 'bg-[rgba(224,180,90,0.25)] text-[#e0b45a]', glyph: '!' },
  error: { ring: 'border-[rgba(248,113,113,0.5)]', icon: 'bg-[rgba(239,68,68,0.25)] text-[#fca5a5]', glyph: '×' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const seq = useRef(0);
  const close = useCallback((id: number) => setItems((l) => l.filter((x) => x.id !== id)), []);
  const push = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    const ttl = t.ttl ?? 6500;
    setItems((l) => [...l.slice(-2), { ...t, id, kind: t.kind ?? 'info', ttl }]);
    window.setTimeout(() => close(id), ttl);
  }, [close]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4">
        {items.map((it) => {
          const s = STYLE[it.kind];
          return (
            <div key={it.id} role="status" className={`fx-toast pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border ${s.ring} bg-[rgba(15,23,42,0.97)] p-3 pe-9 shadow-2xl`}>
              <div className="flex items-start gap-3">
                <span className={`fx-bounce mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.icon}`}>{s.glyph}</span>
                <div className="min-w-0 text-sm leading-6">
                  <div className="font-bold text-[#f1f5f9]">{it.title}</div>
                  {it.body && <div className="text-[#cbd5e1]">{it.body}</div>}
                  {it.action && <Link href={it.action.href} onClick={() => close(it.id)} className="fx-press mt-1 inline-block font-semibold text-[#e0b45a]">{it.action.label} ←</Link>}
                </div>
              </div>
              <button onClick={() => close(it.id)} aria-label="×" className="absolute end-2 top-2 text-lg leading-none text-[#64748b]">×</button>
              <span aria-hidden className="fx-bar absolute bottom-0 start-0 h-0.5 w-full bg-[#e0b45a]" style={{ animationDuration: `${it.ttl}ms` }} />
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
