// أدوات بناء الأمثلة الجاهزة: نفس عقد مخرجات الوكلاء حتى يمر المثال على الفحص الحسابي نفسه.
// كل البيانات في الأمثلة خيالية بالكامل.
export type Sample = { label: string; file: string; data: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any

export type St = 'ok' | 'warn' | 'issue' | 'info';
export type Sec = [title: string, items: [label: string, detail: string, status: St][]];

export function G(a: {
  conf: number;
  type: string;
  summary: string;
  note: string;
  checks?: [label: string, stated: number | null, parts: number[]][];
  dates?: [label: string, quote: string, start: string | null, end: string | null][];
  sections: Sec[];
  att: 'urgent' | 'soon' | 'routine';
  findings: string[];
  questions: string[];
}): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    confidence_score: a.conf,
    needs_human_review: true,
    warnings: [a.note],
    output: {
      document_type: a.type,
      summary: a.summary,
      checks: (a.checks ?? []).map(([label, stated, parts]) => ({ label, stated, parts })),
      date_checks: (a.dates ?? []).map(([label, quote, start, end]) => ({ label, quote, start, end })),
      sections: a.sections.map(([title, items]) => ({
        title,
        items: items.map(([label, detail, status]) => ({ label, detail, status })),
      })),
      attention_level: a.att,
      key_findings: a.findings,
      questions_for_user: a.questions,
    },
  };
}

export const S = (label: string, file: string, data: Record<string, any>): Sample => ({ label, file, data }); // eslint-disable-line @typescript-eslint/no-explicit-any
