// English counterparts of the contract and lab examples (same schema as the Arabic ones).
import type { Sample } from './helper';

export const EN_LEGACY: Record<string, Sample> = {
  'contract-reviewer': {
    label: 'Office lease (example)',
    file: 'sample_lease_contract.pdf',
    data: {
      confidence_score: 0.98,
      needs_human_review: true,
      warnings: ['The start and end dates of the lease are not stated.', 'The contract does not state its governing law.'],
      output: {
        contract_type: 'Office lease agreement',
        governing_law: '',
        jurisdiction: 'Courts of the first party’s country',
        // اسم الحقل عربي لأن الواجهة تقرؤه بهذا الاسم؛ النص هنا إنجليزي
        executive_summary_ar: 'This lease is heavily one-sided in favour of the landlord: an unlimited right to raise the rent without notice, immediate termination without compensation, forfeiture of the 3,000 USD deposit, and major repairs plus legal costs shifted to the tenant. Do not sign it in its current form; renegotiate the clauses below.',
        clauses: [
          { clause_id: 'c1', type: 'Rent adjustment', risk_level: 'critical', risk_explanation: 'An open-ended clause lets the landlord raise the rent at any time, arbitrarily and without prior notice.', recommendation: 'Replace it with a fixed annual increase and a notice period of at least 60 days.' },
          { clause_id: 'c2', type: 'Termination', risk_level: 'critical', risk_explanation: 'Unbalanced: the landlord may end the lease immediately with no reason or compensation, while the tenant has no such right.', recommendation: 'Draft a mutual clause that lists the grounds for termination with 30-60 days written notice.' },
          { clause_id: 'c3', type: 'Security deposit', risk_level: 'critical', risk_explanation: 'Forfeiting the whole deposit in advance, whatever the reason for handover or the condition of the unit, works as an abusive penalty.', recommendation: 'State that the deposit is refunded in full at the end of the lease unless damage is proven.' },
          { clause_id: 'c4', type: 'Maintenance and repairs', risk_level: 'high', risk_explanation: 'Making the tenant pay for major and structural repairs goes against normal practice.', recommendation: 'Limit the tenant to operational upkeep and make the landlord responsible for structural repairs.' },
          { clause_id: 'c5', type: 'Renewal and notice', risk_level: 'high', risk_explanation: 'Automatic 5-year renewal at the landlord’s sole will, with no option for the tenant.', recommendation: 'Give the tenant a 60-90 day non-renewal notice right and shorten the renewal term.' },
          { clause_id: 'c6', type: 'Rent and payment terms', risk_level: 'medium', risk_explanation: 'Requiring a full year of rent in advance places a heavy financial burden on the tenant.', recommendation: 'Negotiate quarterly or monthly instalments.' },
        ],
      },
    },
  },
  'lab-summarizer': {
    label: 'Lab report (example)',
    file: 'sample_lab_report.pdf',
    data: {
      confidence_score: 0.93,
      needs_human_review: true,
      warnings: ['This is a demo example with fictional values, not a real report.'],
      output: {
        document_type: 'Complete blood count and chemistry (example)',
        report_date: '2026-10-20',
        patient: { age: '35', sex: 'Male' },
        tests: [
          { name: 'Hemoglobin', value: '11.2', unit: 'g/dL', reference_range: '13.5 - 17.5', status: 'low', note: '' },
          { name: 'WBC', value: '7.1', unit: '10^3/uL', reference_range: '4.5 - 11.0', status: 'normal', note: '' },
          { name: 'Platelets', value: '255', unit: '10^3/uL', reference_range: '150 - 450', status: 'normal', note: '' },
          { name: 'Fasting Glucose', value: '118', unit: 'mg/dL', reference_range: '70 - 99', status: 'high', note: '' },
          { name: 'Creatinine', value: '0.9', unit: 'mg/dL', reference_range: '0.7 - 1.3', status: 'normal', note: '' },
        ],
        key_findings: [
          'Hemoglobin is below the reference range printed on the report.',
          'Fasting glucose is above the reference range printed on the report.',
          'The other listed tests are within their reference ranges.',
        ],
        summary: 'The report lists five tests: two fall outside the reference range (hemoglobin is low and fasting glucose is high) and the other three are within range. This only summarises what the report says; interpreting these values is for the treating doctor.',
        questions_for_doctor: [
          'Does the hemoglobin need to be repeated, or are other tests needed?',
          'Does the fasting glucose need follow-up or a confirmation test?',
          'Could my lifestyle or current medication explain these values?',
        ],
        attention_level: 'soon',
        attention_note: 'Showing this report to the treating doctor is recommended to assess the out-of-range values.',
        disclaimer: 'This is an automated summary of what the report states. It is not medical advice and does not replace a doctor’s consultation.',
      },
    },
  },
};
