"use client";
// ==========================================================
// مكون رفع الملفات — يدعم السحب والإفلات، ومناسب للجوال
// ==========================================================
import { useState, useRef } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;          // مثال: ".pdf,.jpg,.png"
  label_ar?: string;
  label_en?: string;
}

export function FileUpload({
  onFileSelected,
  accept = ".pdf,.jpg,.jpeg,.png",
  label_ar = "اسحب الملف هنا أو اضغط للاختيار",
  label_en = "Drop file here or click to browse",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`border border-hairline bg-paper-raised px-6 py-10 text-center cursor-pointer transition-colors
        ${isDragging ? "border-brass bg-[#F5F0E8]" : "hover:border-brass/60"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="font-mono text-xs text-brass tracking-wider mb-2">
        {fileName ? "FILE SELECTED" : "UPLOAD"}
      </div>
      <p className="font-arabic text-ink font-semibold">
        {fileName ?? label_ar}
      </p>
      {!fileName && (
        <p className="font-body text-xs text-ink-soft mt-1">{label_en}</p>
      )}
    </div>
  );
}
