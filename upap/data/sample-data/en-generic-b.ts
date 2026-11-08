// English examples for the generic agents (2/2). All data is fictional; each example contains a deliberate error that the code-side checks catch.
import type { Sample } from './helper';
import { G, S } from './helper';

const NOTE = 'This is a demo example with fictional data, not a real document.';

export const EN_GENERIC_B: Record<string, Sample> = {
  'shop-order-reviewer': S('Online store order (example)', 'sample_order.pdf', G({
    conf: 0.93, note: NOTE, type: 'Online store purchase order',
    summary: 'An order of two products with a shipping fee and a discount. It says "free shipping" yet lists a shipping fee, and gives two different return periods. See the number checks below.',
    checks: [['Total due', 255, [200, 45, 15, -10]]],
    dates: [['Delivery window', 'Delivery from 12/11/2026 to 18/11/2026', '2026-11-12', '2026-11-18']],
    sections: [
      ['Shipping and returns', [
        ['Shipping', 'Marked "free shipping" while the order includes a shipping fee of 15', 'issue'],
        ['Return period', 'Product page: 14 days; store policy: 7 days', 'issue'],
        ['Warranty', 'One year, and also "no warranty on discounted devices"', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Free shipping is contradicted by a shipping fee.', 'Two different return periods.'],
    questions: ['Is shipping free or charged at 15?', 'Which return period applies?'],
  })),
  'shipment-doc-reviewer': S('Sea bill of lading (example)', 'sample_shipment.pdf', G({
    conf: 0.92, note: NOTE, type: 'Sea bill of lading',
    summary: 'A bill of lading with three cargo lines. The delivery terms conflict with who pays the freight, and the insurance policy number is missing. See the number and date checks below.',
    checks: [['Total packages', 120, [50, 40, 20]], ['Total weight (kg)', 2400, [1000, 900, 500]], ['Freight costs', 1500, [1000, 300, 200]]],
    dates: [['Sailing and arrival', 'Departure 05/12/2026 and arrival 28/11/2026', '2026-12-05', '2026-11-28']],
    sections: [
      ['Terms', [
        ['Delivery terms', 'CIF, while freight is recorded as "paid by the consignee"', 'issue'],
        ['Insurance', 'Marked "insured" without a policy number', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Delivery terms conflict with who pays the freight.', 'The insurance policy number is missing.'],
    questions: ['Who actually bears the freight?', 'What is the insurance policy number?'],
  })),
  'farm-plan-reviewer': S('Farm season plan (example)', 'sample_farm_plan.pdf', G({
    conf: 0.9, note: NOTE, type: 'Season plan for wheat and legumes',
    summary: 'A season plan with three plots and itemised costs. The stated total production is based on yield per unit area and area, and the irrigation source is not stated. See the number checks below.',
    checks: [['Total area (donum)', 50, [20, 15, 10]], ['Total cost', 7000, [3000, 2500, 1500]]],
    dates: [['Growing season', 'From 15/11/2026 to 30/04/2027', '2026-11-15', '2027-04-30']],
    sections: [
      ['Expected production', [
        ['Yield per donum', '400 kg/donum', 'info'],
        ['Area applied', '50 donum', 'info'],
        ['Stated total production', '20000 kg; please confirm the multiplication', 'info'],
      ]],
      ['Plan', [
        ['Crop rotation', 'Wheat after wheat on the first plot', 'warn'],
        ['Irrigation source', 'Not stated', 'warn'],
      ]],
    ],
    att: 'soon',
    findings: ['Wheat is planted after wheat on the first plot.', 'The irrigation source is missing.'],
    questions: ['What is the irrigation source and is it reliable?', 'Should the rotation be confirmed with an agronomist?'],
  })),
  'trip-quote-reviewer': S('Trip package offer (example)', 'sample_trip.pdf', G({
    conf: 0.92, note: NOTE, type: 'Seven-night trip package offer',
    summary: 'A trip offer with three stay segments and three price lines. Meals are described as "all inclusive" yet lunch is excluded, the visa is not mentioned, and the cancellation policy is strict. See the number checks below.',
    checks: [['Total nights', 7, [3, 2, 3]], ['Total price', 1800, [1200, 400, 200]]],
    dates: [['Travel period', 'From 10/01/2027 to 17/01/2027', '2027-01-10', '2027-01-17']],
    sections: [
      ['Inclusions and exclusions', [
        ['Meals', 'Written as "all inclusive" while lunch is not included', 'issue'],
        ['Visa', 'Not listed as included or excluded', 'warn'],
        ['Cancellation', 'No refund within 30 days of departure', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['"All inclusive" contradicts the lunch exclusion.', 'Visa and cancellation need clarification.'],
    questions: ['Is lunch included or not?', 'Is the visa the traveller’s responsibility?'],
  })),
  'subcontract-reviewer': S('Works subcontract (example)', 'sample_subcontract.pdf', G({
    conf: 0.91, note: NOTE, type: 'Finishing works subcontract',
    summary: 'A contract with three payments and three stages. The delay penalty is described with a cap in one clause and as unlimited in another, and safety liability sits on the subcontractor with no ceiling. See the number checks below.',
    checks: [['Contract payments', 100000, [30000, 40000, 20000]], ['Stage percentages', 100, [40, 35, 25]]],
    dates: [['Execution period', 'From 01/12/2026 to 30/06/2027', '2026-12-01', '2027-06-30']],
    sections: [
      ['Penalties and warranty', [
        ['Delay penalty', 'Clause 8: "1% per day capped at 10%"; clause 14: "unlimited penalty"', 'issue'],
        ['Warranty period', 'One year', 'info'],
        ['Insurance and safety', 'Liability rests on the subcontractor with no ceiling', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Clauses 8 and 14 contradict each other on the delay penalty.', 'Safety liability has no ceiling.'],
    questions: ['Which clause governs the delay penalty?', 'Should a ceiling be set for safety liability?'],
  })),
  'engagement-letter-reviewer': S('Consulting engagement letter (example)', 'sample_engagement.pdf', G({
    conf: 0.92, note: NOTE, type: 'Consulting engagement letter - sales improvement',
    summary: 'An engagement letter for three phases with fees split across them. It promises a guaranteed result, its confidentiality clause conflicts with a clause allowing disclosure, and it has no termination clause or intellectual-property clause. See the number checks below.',
    checks: [['Phase durations (weeks)', 12, [4, 5, 4]], ['Fees', 30000, [10000, 10000, 10000]]],
    dates: [['Engagement period', 'From 01/12/2026 to 28/02/2027', '2026-12-01', '2027-02-28']],
    sections: [
      ['Conflicts and risks', [
        ['Guaranteed results', '"We guarantee a 100% increase in sales": an unrealistic promise', 'issue'],
        ['Confidentiality and disclosure', 'Clause 7: "confidentiality is perpetual"; clause 9: "information may be disclosed to partners"', 'issue'],
        ['Missing clauses', 'No termination clause and no intellectual-property clause', 'warn'],
        ['Scope of work', 'Clearly defined', 'ok'],
      ]],
    ],
    att: 'urgent',
    findings: ['A guaranteed-result promise.', 'Clauses 7 and 9 conflict.', 'No termination or IP clause.'],
    questions: ['Should the guarantee be removed?', 'Which clause governs confidentiality?'],
  })),
  'article-fact-reviewer': S('Pre-publication article (example)', 'sample_article.pdf', G({
    conf: 0.9, note: NOTE, type: 'News article - rising bread prices',
    summary: 'An article about rising prices. The headline gives a percentage that is compared with the body figure in the number checks below. It accuses a named company without its reply, contains two contradictory statements by the same person, and relies on an unsourced claim.',
    checks: [['Headline increase versus body text', 20, [25]], ['Shares of causes of the rise', 100, [50, 30, 20]]],
    sections: [
      ['Sources and claims', [
        ['"Observers say"', 'A claim with no named source', 'warn'],
        ['Named company accused of a monopoly', 'Legal risk (defamation) with no reply from the company published', 'issue'],
        ['Minister’s statements', 'Two contradictory statements by the same person in paragraphs 3 and 6', 'issue'],
        ['Language', 'The word "catastrophe" is not neutral', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['A named company is accused with no reply.', 'Two contradictory statements.', 'Unsourced claims.'],
    questions: ['Did you obtain a reply from the accused company?', 'Which of the two statements is correct?'],
  })),
  'production-report-reviewer': S('Factory production report (example)', 'sample_production.pdf', G({
    conf: 0.91, note: NOTE, type: 'Monthly production report - factory',
    summary: 'A monthly report for three production lines. The text says there were no injuries while the table records one, maintenance on one line is overdue, and the quality certificate expired before the report date. See the number checks below.',
    checks: [['Total production (units)', 10000, [4000, 3500, 2000]], ['Total defective', 300, [100, 120, 80]]],
    dates: [['Reporting period', 'From 01/10/2026 to 31/10/2026', '2026-10-01', '2026-10-31']],
    sections: [
      ['Defect rate', [['Stated rate', '3% as written in the report; worth verifying against the figures', 'info']]],
      ['Safety, maintenance and certification', [
        ['Work injuries', 'Report text: "no injuries"; the table lists one injury', 'issue'],
        ['Line 2 maintenance', 'Overdue by 15 days against the stated 30-day cycle', 'warn'],
        ['Quality certificate', 'It expired on 2026-09-30, before the report date', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Contradiction in recording work injuries.', 'Line 2 maintenance is overdue.', 'The quality certificate has expired.'],
    questions: ['What is the real status of the recorded injury?', 'When will the quality certificate be renewed?'],
  })),
};
