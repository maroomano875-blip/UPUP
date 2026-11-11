// صياغة ملاحظات الفحص الآلي بلغة الواجهة (الأرقام معزولة الاتجاه كي لا تنعكس داخل الجملة)
import type { InvoiceIssue } from '../verify';
import { t, type Lang } from './index';

const n = (v: number) => `\u2066${v.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })}\u2069`;

export function invoiceIssueText(i: InvoiceIssue, lang: Lang): string {
  switch (i.code) {
    case 'line': return t(lang, 'issue.line', { n: i.n, q: n(i.q), u: n(i.u), calc: n(i.calc), stated: n(i.stated) });
    case 'itemsSum': return t(lang, 'issue.itemsSum', { sum: n(i.sum), sub: n(i.sub) });
    case 'total': return t(lang, 'issue.total', { sub: n(i.sub), tax: n(i.tax), calc: n(i.calc), stated: n(i.stated) });
    case 'due': return t(lang, 'issue.due');
  }
}

import type { CurAdvisory } from '../currencyChecks';
export function curAdvisoryText(a: CurAdvisory, lang: Lang): string {
  return a.code === 'curDiff'
    ? t(lang, 'cur.diff', { doc: a.doc, local: a.local })
    : t(lang, 'cur.decimals', { cur: a.cur, max: a.max, found: a.found });
}
