// أمثلة عربية: الفاتورة (فيها خطأ إجمالي مقصود يكشفه الفحص بالكود) وجدول الكميات.
import type { Sample } from './helper';
import { S } from './helper';

export const AR_CORE: Record<string, Sample> = {
  'invoice-reader': S('فاتورة سورية (مثال)', 'sample_invoice_SY.jpg', {
    confidence_score: 0.95,
    needs_human_review: false,
    warnings: ['هذا مثال تجريبي ببيانات خيالية وليس مستنداً حقيقياً.'],
    output: {
      vendor_name: 'شركة النور للتجارة',
      vendor_country: 'SY',
      invoice_number: '1043',
      invoice_date: '2026-10-12',
      due_date: '2026-11-12',
      currency: 'SYP',
      subtotal: 1600000,
      tax: 160000,
      total: 1850000,
      line_items: [
        { description: 'ورق طباعة A4 (رزمة)', quantity: 10, unit_price: 85000, total: 850000 },
        { description: 'حبر طابعة (علبة)', quantity: 5, unit_price: 150000, total: 750000 },
      ],
      category: 'مستلزمات مكتبية',
      payment_method: 'تحويل مصرفي',
      suggested_journal_entry: { debit_account: 'مصاريف مكتبية', credit_account: 'الموردون', amount: 1850000 },
    },
  }),
  'boq-reviewer': S('جدول كميات مبنى (مثال)', 'sample_boq.xlsx', {
    confidence_score: 0.94,
    needs_human_review: true,
    warnings: ['هذا مثال تجريبي ببيانات خيالية وليس مستنداً حقيقياً.'],
    output: {
      document_type: 'جدول كميات لأعمال هيكلية',
      project_name: 'مبنى سكني من ثلاثة طوابق (مثال)',
      document_date: '2026-09-05',
      currency: 'USD',
      summary: 'جدول كميات من ستة بنود. فيه بند واحد لا يطابق حاصل ضرب كميته في سعره، وبند مكرر مرتين بالكمية والسعر نفسيهما، وبند ناقص السعر والإجمالي. المجموع المعلن للبنود لا يطابق مجموعها الصحيح.',
      boq_items: [
        { no: '1', description: 'حفريات عامة', unit: 'م3', quantity: 120, unit_price: 15, total: 1800, calculated_total: 1800, status: 'ok' },
        { no: '2', description: 'خرسانة مسلحة C30', unit: 'م3', quantity: 45, unit_price: 210, total: 9450, calculated_total: 9450, status: 'ok' },
        { no: '3', description: 'حديد تسليح', unit: 'طن', quantity: 6, unit_price: 950, total: 5900, calculated_total: 5700, status: 'mismatch' },
        { no: '4', description: 'بناء بلوك 20 سم', unit: 'م2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'ok' },
        { no: '5', description: 'بناء بلوك 20 سم', unit: 'م2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'duplicate' },
        { no: '6', description: 'لياسة داخلية', unit: 'م2', quantity: 600, unit_price: null, total: null, calculated_total: null, status: 'missing' },
      ],
      totals: { stated_subtotal: 27950, calculated_subtotal: 27750, stated_grand_total: 30000, notes: 'المجموع المعلن للبنود يختلف عن مجموعها المحسوب.' },
      issues: [
        { severity: 'high', type: 'arithmetic', item_no: '3', description: 'إجمالي البند 3 المكتوب لا يساوي الكمية × السعر.' },
        { severity: 'medium', type: 'duplicate', item_no: '5', description: 'البند 5 يكرر البند 4 بالوصف والوحدة والكمية والسعر.' },
        { severity: 'medium', type: 'missing', item_no: '6', description: 'البند 6 بلا سعر وحدة ولا إجمالي.' },
      ],
      attention_level: 'urgent',
      key_findings: ['خطأ حسابي في بند الحديد.', 'بند بلوك مكرر قد يضخم الإجمالي.', 'بند اللياسة غير مسعّر.'],
      questions_for_engineer: ['هل تكرار بند البلوك مقصود (طابقان مختلفان)؟', 'ما سعر الوحدة المعتمد للياسة؟'],
    },
  }),
};
