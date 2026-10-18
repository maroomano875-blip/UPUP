// قارئ ملفات شامل: يكتشف النوع من محتوى الملف (لا من امتداده)، ولا يرمي خطأً تقنياً للعميل.
// يدعم: PDF (عادي/ممسوح/تالف جزئياً)، الصور (JPG/PNG/WEBP/GIF/TIFF/AVIF/HEIC)، Word، Excel، CSV، النصوص، HTML، JSON.

export interface ReadResult {
  text: string;            // النص المستخرج (قد يكون فارغاً للصور)
  imageBase64?: string;    // صورة JPEG موحّدة (للصور والـ PDF الممسوح)
  kind: string;            // pdf | image | docx | xlsx | text | unknown
  warnings: string[];
}

export class UnreadableFileError extends Error {}

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_TEXT = 120_000;
const MAX_PX = 2000;

function startsWith(b: Buffer, sig: number[], off = 0) {
  return sig.every((v, i) => b[off + i] === v);
}

export function detectKind(b: Buffer, name = '', mime = ''): string {
  if (b.length < 4) return 'unknown';
  if (b.slice(0, 1024).includes(Buffer.from('%PDF-'))) return 'pdf';
  if (startsWith(b, [0xff, 0xd8, 0xff])) return 'image';
  if (startsWith(b, [0x89, 0x50, 0x4e, 0x47])) return 'image';
  if (b.slice(0, 4).toString() === 'GIF8') return 'image';
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return 'image';
  if (b.slice(0, 2).toString() === 'BM') return 'image';
  if (startsWith(b, [0x49, 0x49, 0x2a, 0x00]) || startsWith(b, [0x4d, 0x4d, 0x00, 0x2a])) return 'image';
  if (b.slice(4, 8).toString() === 'ftyp') {
    const brand = b.slice(8, 12).toString();
    if (/^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)/.test(brand)) return 'heic';
    if (/^avi[fs]/.test(brand)) return 'image';
  }
  if (startsWith(b, [0x50, 0x4b, 0x03, 0x04])) {
    const n = name.toLowerCase();
    if (n.endsWith('.xlsx') || n.endsWith('.xlsm') || /spreadsheetml/.test(mime)) return 'xlsx';
    if (n.endsWith('.docx') || /wordprocessingml/.test(mime)) return 'docx';
    // اكتشاف من المحتوى
    const head = b.slice(0, 4000).toString('latin1');
    if (head.includes('xl/')) return 'xlsx';
    if (head.includes('word/')) return 'docx';
    return 'docx';
  }
  if (startsWith(b, [0xd0, 0xcf, 0x11, 0xe0])) return 'legacy-office';
  // نص؟
  const sample = b.slice(0, 2000);
  let bad = 0;
  for (const c of sample) if (c === 0 || (c < 9) || (c > 13 && c < 32)) bad++;
  if (bad / sample.length < 0.02) return 'text';
  if (/^image\//.test(mime)) return 'image';
  return 'unknown';
}

function decodeText(b: Buffer): string {
  if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b);
  if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b);
  let s = new TextDecoder('utf-8').decode(b);
  if (s.includes('�')) {
    try { s = new TextDecoder('windows-1256').decode(b); } catch { /* keep utf-8 */ }
  }
  return s.replace(/^﻿/, '');
}

async function toJpeg(input: Buffer): Promise<string> {
  const sharp = (await import('sharp')).default;
  const out = await sharp(input, { failOn: 'none', limitInputPixels: 268_000_000 })
    .rotate() // يصحح الاتجاه حسب EXIF (صور الهاتف)
    .resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85 })
    .toBuffer();
  return out.toString('base64');
}

async function heicToJpegBuffer(b: Buffer): Promise<Buffer> {
  const convert = (await import('heic-convert')).default as (o: { buffer: Buffer; format: 'JPEG'; quality: number }) => Promise<ArrayBuffer>;
  const out = await convert({ buffer: b, format: 'JPEG', quality: 0.9 });
  return Buffer.from(out);
}

async function pdfText(b: Buffer, warnings: string[]): Promise<string> {
  // المحاولة 1: pdf-parse
  try {
    // @ts-ignore مسار داخلي يتجنب وضع التصحيح في index.js
    const mod: any = await import('pdf-parse/lib/pdf-parse.js');
    const parse = mod.default ?? mod;
    const r = await parse(b);
    const t = (r.text || '').trim();
    if (t.length > 20) return t;
  } catch (e) {
    warnings.push('pdf-parse: ' + (e instanceof Error ? e.message : 'failed'));
  }
  // المحاولة 2: pdf.js حديث (يتحمل ملفات أكثر)
  try {
    const { getDocumentProxy, extractText } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(b));
    const r = await extractText(pdf, { mergePages: true });
    const t = (Array.isArray(r.text) ? r.text.join('\n') : r.text || '').trim();
    if (t.length > 0) return t;
  } catch (e) {
    warnings.push('unpdf: ' + (e instanceof Error ? e.message : 'failed'));
  }
  return '';
}

async function pdfToImage(b: Buffer, warnings: string[]): Promise<string | undefined> {
  try {
    const { getDocumentProxy, renderPageAsImage } = await import('unpdf');
    const probe = await getDocumentProxy(new Uint8Array(b));
    const pages = Math.min(probe.numPages, 3);
    const imgs: Buffer[] = [];
    for (let i = 1; i <= pages; i++) {
      const png = await renderPageAsImage(new Uint8Array(b), i, {
        canvasImport: () => import('@napi-rs/canvas'),
        scale: 1.6,
      });
      imgs.push(Buffer.from(png));
    }
    if (imgs.length === 0) return undefined;
    if (imgs.length === 1) return await toJpeg(imgs[0]);
    // دمج الصفحات عمودياً في صورة واحدة
    const sharp = (await import('sharp')).default;
    const metas = await Promise.all(imgs.map((i) => sharp(i).metadata()));
    const w = Math.max(...metas.map((m) => m.width || 0));
    let y = 0;
    const comps = imgs.map((input, i) => { const top = y; y += metas[i].height || 0; return { input, top, left: 0 }; });
    const stitched = await sharp({ create: { width: w, height: y, channels: 3, background: '#ffffff' } })
      .composite(comps).png().toBuffer();
    return await toJpeg(stitched);
  } catch (e) {
    warnings.push('render: ' + (e instanceof Error ? e.message : 'failed'));
    return undefined;
  }
}

export async function readUpload(b: Buffer, name = '', mime = ''): Promise<ReadResult> {
  const warnings: string[] = [];
  if (!b || b.length === 0) throw new UnreadableFileError('الملف فارغ. اختر الملف مرة أخرى.');
  if (b.length > MAX_BYTES) throw new UnreadableFileError('حجم الملف كبير جداً (الحد 25 ميغابايت).');
  const kind = detectKind(b, name, mime);

  try {
    if (kind === 'pdf') {
      const text = await pdfText(b, warnings);
      if (text.length >= 40) return { text: text.slice(0, MAX_TEXT), kind, warnings };
      // ممسوح ضوئياً أو تعذّر النص: نحوّل الصفحات إلى صورة ليقرأها النموذج بالنظر
      const imageBase64 = await pdfToImage(b, warnings);
      if (imageBase64) {
        return { text: (text ? text + '\n\n' : '') + '(مستند PDF ممسوح ضوئياً؛ المحتوى في الصورة المرفقة)', imageBase64, kind, warnings };
      }
      if (text) return { text, kind, warnings };
      throw new UnreadableFileError('تعذّرت قراءة ملف PDF هذا (قد يكون تالفاً أو محمياً بكلمة مرور). جرّب فتحه ثم "طباعة ← حفظ كـ PDF"، أو ارفعه كصورة.');
    }

    if (kind === 'image' || kind === 'heic') {
      const src = kind === 'heic' ? await heicToJpegBuffer(b) : b;
      const imageBase64 = await toJpeg(src);
      return { text: '(ملف صورة؛ المحتوى في الصورة المرفقة)', imageBase64, kind: 'image', warnings };
    }

    if (kind === 'docx') {
      const mammoth = await import('mammoth');
      const r = await mammoth.extractRawText({ buffer: b });
      const t = r.value.trim();
      if (!t) throw new UnreadableFileError('ملف Word لا يحتوي نصاً قابلاً للقراءة.');
      return { text: t.slice(0, MAX_TEXT), kind, warnings };
    }

    if (kind === 'xlsx') {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(b as unknown as ArrayBuffer);
      const parts: string[] = [];
      wb.eachSheet((ws) => {
        parts.push(`# ${ws.name}`);
        ws.eachRow((row) => {
          const vals = (row.values as unknown[]).slice(1).map((v) => {
            if (v == null) return '';
            if (typeof v === 'object') {
              const o = v as { result?: unknown; text?: unknown; richText?: { text: string }[] };
              if (o.richText) return o.richText.map((r) => r.text).join('');
              if (o.result != null) return String(o.result);
              if (o.text != null) return String(o.text);
              if (v instanceof Date) return v.toISOString().slice(0, 10);
              return '';
            }
            return String(v);
          });
          parts.push(vals.join(' | '));
        });
      });
      return { text: parts.join('\n').slice(0, MAX_TEXT), kind, warnings };
    }

    if (kind === 'legacy-office') {
      throw new UnreadableFileError('صيغة Office القديمة (.doc / .xls) غير مدعومة. احفظ الملف بصيغة .docx أو .xlsx أو PDF ثم ارفعه.');
    }

    if (kind === 'text') {
      let t = decodeText(b);
      if (/<html|<body|<\/p>/i.test(t.slice(0, 2000))) {
        t = t.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ');
      }
      t = t.trim();
      if (!t) throw new UnreadableFileError('الملف النصي فارغ.');
      return { text: t.slice(0, MAX_TEXT), kind, warnings };
    }
  } catch (e) {
    if (e instanceof UnreadableFileError) throw e;
    warnings.push(e instanceof Error ? e.message : 'unknown');
    // محاولة أخيرة: ربما هي صورة بصيغة غريبة
    try {
      const imageBase64 = await toJpeg(b);
      return { text: '(ملف صورة؛ المحتوى في الصورة المرفقة)', imageBase64, kind: 'image', warnings };
    } catch { /* ignore */ }
    throw new UnreadableFileError('تعذّرت قراءة هذا الملف. جرّب إعادة حفظه بصيغة PDF أو صورة JPG ثم ارفعه من جديد.');
  }

  // نوع غير معروف: جرّب كصورة
  try {
    const imageBase64 = await toJpeg(b);
    return { text: '(ملف صورة؛ المحتوى في الصورة المرفقة)', imageBase64, kind: 'image', warnings };
  } catch {
    throw new UnreadableFileError('صيغة الملف غير مدعومة. الصيغ المدعومة: PDF، صور (JPG/PNG/WEBP/HEIC)، Word، Excel، CSV، نص.');
  }
}
