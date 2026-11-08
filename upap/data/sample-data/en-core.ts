// English examples: the invoice (with a deliberate total error caught by the code check) and the BOQ.
import type { Sample } from './helper';
import { S } from './helper';

export const EN_CORE: Record<string, Sample> = {
  'invoice-reader': S('US invoice (example)', 'sample_invoice_US.pdf', {
    confidence_score: 0.95,
    needs_human_review: false,
    warnings: ['This is a demo example with fictional data, not a real document.'],
    output: {
      vendor_name: 'Harbor Office Supplies Ltd',
      vendor_country: 'US',
      invoice_number: 'INV-2291',
      invoice_date: '2026-10-12',
      due_date: '2026-11-11',
      currency: 'USD',
      subtotal: 1600,
      tax: 128,
      total: 1800,
      line_items: [
        { description: 'A4 printer paper (ream)', quantity: 10, unit_price: 85, total: 850 },
        { description: 'Printer ink (cartridge)', quantity: 5, unit_price: 150, total: 750 },
      ],
      category: 'Office supplies',
      payment_method: 'Bank transfer',
      suggested_journal_entry: { debit_account: 'Office expenses', credit_account: 'Accounts payable', amount: 1800 },
    },
  }),
  'boq-reviewer': S('Building BOQ (example)', 'sample_boq.xlsx', {
    confidence_score: 0.94,
    needs_human_review: true,
    warnings: ['This is a demo example with fictional data, not a real document.'],
    output: {
      document_type: 'Bill of quantities for structural works',
      project_name: 'Three-storey residential building (example)',
      document_date: '2026-09-05',
      currency: 'USD',
      summary: 'A six-item bill of quantities. One item does not match quantity x unit price, one item is repeated with the same quantity and price, and one item has no price or total. The stated sum of the items does not match the correct sum.',
      boq_items: [
        { no: '1', description: 'General excavation', unit: 'm3', quantity: 120, unit_price: 15, total: 1800, calculated_total: 1800, status: 'ok' },
        { no: '2', description: 'Reinforced concrete C30', unit: 'm3', quantity: 45, unit_price: 210, total: 9450, calculated_total: 9450, status: 'ok' },
        { no: '3', description: 'Reinforcement steel', unit: 'ton', quantity: 6, unit_price: 950, total: 5900, calculated_total: 5700, status: 'mismatch' },
        { no: '4', description: 'Block masonry 20 cm', unit: 'm2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'ok' },
        { no: '5', description: 'Block masonry 20 cm', unit: 'm2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'duplicate' },
        { no: '6', description: 'Internal plastering', unit: 'm2', quantity: 600, unit_price: null, total: null, calculated_total: null, status: 'missing' },
      ],
      totals: { stated_subtotal: 27950, calculated_subtotal: 27750, stated_grand_total: 30000, notes: 'The stated sum of the items differs from the calculated sum.' },
      issues: [
        { severity: 'high', type: 'arithmetic', item_no: '3', description: 'The stated total of item 3 does not equal quantity x unit price.' },
        { severity: 'medium', type: 'duplicate', item_no: '5', description: 'Item 5 repeats item 4 (same description, unit, quantity and price).' },
        { severity: 'medium', type: 'missing', item_no: '6', description: 'Item 6 has no unit price and no total.' },
      ],
      attention_level: 'urgent',
      key_findings: ['Arithmetic error on the steel item.', 'A repeated masonry item may inflate the total.', 'The plastering item is not priced.'],
      questions_for_engineer: ['Is the repeated masonry item intentional (two different floors)?', 'What unit price applies to plastering?'],
    },
  }),
};
