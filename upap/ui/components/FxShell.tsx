// غلاف صفحات الحساب: خلفية متحركة خفيفة + محتوى في المنتصف (لا حالة ولا JS في العميل)
export default function FxShell({ dir, children }: { dir: 'rtl' | 'ltr'; children: React.ReactNode }) {
  return (
    <main className="fx-aurora flex min-h-screen items-start justify-center bg-[#020617] px-5 pb-16 pt-24 text-[#f1f5f9] sm:items-center sm:pt-16" dir={dir}>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
