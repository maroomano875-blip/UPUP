// Exemples en français : la facture (avec une erreur de total volontaire détectée par le code) et le bordereau de quantités.
import type { Sample } from './helper';
import { S } from './helper';

export const FR_CORE: Record<string, Sample> = {
  'invoice-reader': S('Facture américaine (exemple)', 'sample_invoice_US.pdf', {
    confidence_score: 0.95,
    needs_human_review: false,
    warnings: ['Ceci est un exemple de démonstration avec des données fictives, pas un document réel.'],
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
        { description: 'Papier d’imprimante A4 (ramette)', quantity: 10, unit_price: 85, total: 850 },
        { description: 'Encre d’imprimante (cartouche)', quantity: 5, unit_price: 150, total: 750 },
      ],
      category: 'Fournitures de bureau',
      payment_method: 'Virement bancaire',
      suggested_journal_entry: { debit_account: 'Charges de bureau', credit_account: 'Fournisseurs', amount: 1800 },
    },
  }),
  'boq-reviewer': S('Bordereau de quantités d’un bâtiment (exemple)', 'sample_boq.xlsx', {
    confidence_score: 0.94,
    needs_human_review: true,
    warnings: ['Ceci est un exemple de démonstration avec des données fictives, pas un document réel.'],
    output: {
      document_type: 'Bordereau de quantités des travaux de structure',
      project_name: 'Immeuble résidentiel de trois étages (exemple)',
      document_date: '2026-09-05',
      currency: 'USD',
      summary: 'Un bordereau de six postes. Un poste ne correspond pas à quantité × prix unitaire, un poste est répété avec la même quantité et le même prix, et un poste n’a ni prix ni total. La somme indiquée des postes ne correspond pas à la somme correcte.',
      boq_items: [
        { no: '1', description: 'Terrassement général', unit: 'm3', quantity: 120, unit_price: 15, total: 1800, calculated_total: 1800, status: 'ok' },
        { no: '2', description: 'Béton armé C30', unit: 'm3', quantity: 45, unit_price: 210, total: 9450, calculated_total: 9450, status: 'ok' },
        { no: '3', description: 'Acier d’armature', unit: 'tonne', quantity: 6, unit_price: 950, total: 5900, calculated_total: 5700, status: 'mismatch' },
        { no: '4', description: 'Maçonnerie de blocs 20 cm', unit: 'm2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'ok' },
        { no: '5', description: 'Maçonnerie de blocs 20 cm', unit: 'm2', quantity: 300, unit_price: 18, total: 5400, calculated_total: 5400, status: 'duplicate' },
        { no: '6', description: 'Enduit intérieur', unit: 'm2', quantity: 600, unit_price: null, total: null, calculated_total: null, status: 'missing' },
      ],
      totals: { stated_subtotal: 27950, calculated_subtotal: 27750, stated_grand_total: 30000, notes: 'La somme indiquée des postes diffère de la somme calculée.' },
      issues: [
        { severity: 'high', type: 'arithmetic', item_no: '3', description: 'Le total indiqué du poste 3 n’est pas égal à quantité × prix unitaire.' },
        { severity: 'medium', type: 'duplicate', item_no: '5', description: 'Le poste 5 répète le poste 4 (même désignation, unité, quantité et prix).' },
        { severity: 'medium', type: 'missing', item_no: '6', description: 'Le poste 6 n’a ni prix unitaire ni total.' },
      ],
      attention_level: 'urgent',
      key_findings: ['Erreur de calcul sur le poste de l’acier.', 'Un poste de maçonnerie répété peut gonfler le total.', 'Le poste d’enduit n’est pas chiffré.'],
      questions_for_engineer: ['Le poste de maçonnerie répété est-il voulu (deux étages différents) ?', 'Quel prix unitaire s’applique à l’enduit ?'],
    },
  }),
};
