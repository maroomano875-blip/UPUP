// English examples for the generic agents (1/2). All data is fictional; each example contains a deliberate error that the code-side checks catch.
import type { Sample } from './helper';
import { G, S } from './helper';

const NOTE = 'This is a demo example with fictional data, not a real document.';

export const EN_GENERIC_A: Record<string, Sample> = {
  'exam-reviewer': S('Maths exam paper (example)', 'sample_exam.pdf', G({
    conf: 0.92, note: NOTE, type: 'Mathematics exam paper - Grade 9',
    summary: 'A five-question paper that needs review before approval: one question is missing data needed to solve it and one sub-question has no mark. See the number and date checks below.',
    checks: [['Total marks', 100, [10, 15, 20, 25, 20]]],
    dates: [['Results announcement', 'Results are announced from 20/11/2026 until 10/11/2026', '2026-11-20', '2026-11-10']],
    sections: [
      ['Questions', [
        ['Question 1: evaluate the expression', 'Clear and complete', 'ok'],
        ['Question 3: find the value of x', 'Missing data needed to solve it (the value of y is not given)', 'issue'],
        ['Question 4 part (b)', 'The mark for this part is not written', 'warn'],
      ]],
      ['Balance', [['Difficulty mix', 'Most questions test direct recall; there is no reasoning question', 'info']]],
    ],
    att: 'urgent',
    findings: ['Question 3 is missing data.', 'The mark of question 4 (b) is not written.'],
    questions: ['Which value of y is intended in question 3?', 'How many marks does part (b) of question 4 carry?'],
  })),
  'campaign-reviewer': S('Ad campaign plan (example)', 'sample_campaign.pdf', G({
    conf: 0.9, note: NOTE, type: 'Advertising campaign plan - online store launch',
    summary: 'A one-month campaign plan with a budget spread over four channels. It contains absolute advertising claims with no source and influencer posts not labelled as advertising. See the number checks below.',
    checks: [['Total budget', 12000, [5000, 3500, 2000, 1500]], ['Channel share percentages', 100, [40, 30, 20, 15]]],
    dates: [['Campaign period', 'From 01/12/2026 to 31/12/2026', '2026-12-01', '2026-12-31']],
    sections: [
      ['Claims and compliance', [
        ['"Cheapest in the market"', 'Absolute comparison claim with no source to support it', 'issue'],
        ['Influencer posts', 'Nothing says they are paid advertising', 'warn'],
      ]],
      ['Offer and dates', [['30% discount', 'The duration and conditions of the offer are not defined', 'warn']]],
      ['Message quality', [
        ['Call to action', 'Clear in every ad', 'ok'],
        ['Target audience', 'Not defined in the plan', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['The "cheapest" claim is unsupported.', 'Influencer content is not labelled.'],
    questions: ['What is the source of the price comparison?', 'Who is the target audience and how long does the discount last?'],
  })),
  'offer-reviewer': S('Job offer (example)', 'sample_offer.pdf', G({
    conf: 0.93, note: NOTE, type: 'Job offer - accounts manager',
    summary: 'An offer with a three-component salary and weekly working hours. The notice period and annual leave are not stated. See the number checks below.',
    checks: [['Total monthly salary', 1700, [1200, 300, 100]]],
    dates: [['Probation period', 'Probation from 01/12/2026 to 01/03/2027', '2026-12-01', '2027-03-01']],
    sections: [
      ['Core terms', [
        ['Probation period', 'Three months', 'info'],
        ['Notice period on resignation', 'Not stated', 'warn'],
        ['Annual leave', 'The number of leave days is not stated', 'warn'],
      ]],
      ['Working hours', [['8 hours a day x 5 days', 'The text says 8 hours a day and 5 days a week, but the stated weekly hours are 45', 'issue']]],
    ],
    att: 'urgent',
    findings: ['The stated weekly hours contradict the daily hours and number of days.', 'Notice period and leave are missing.'],
    questions: ['What total salary is intended?', 'How many days of notice and annual leave apply?'],
  })),
  'property-contract-reviewer': S('Apartment sale contract (example)', 'sample_property.pdf', G({
    conf: 0.91, note: NOTE, type: 'Residential apartment sale contract',
    summary: 'A sale contract for a second-floor apartment with a table of areas, instalments and a handover date. The late-payment penalty has no cap. See the number and date checks below.',
    checks: [['Room areas (m²)', 100, [35, 25, 20, 12, 8]], ['Price instalments', 100000, [30000, 20000, 20000, 20000]]],
    dates: [['Handover date', 'The property is handed over from 01/12/2026 until 15/11/2026', '2026-12-01', '2026-11-15']],
    sections: [
      ['Parties and property', [
        ['Property description', 'Second floor, area 100 m²', 'ok'],
        ['Title deed', 'The deed number is not stated', 'warn'],
      ]],
      ['Price and terms', [
        ['Price per m², area and total', 'Price per m² 1000, area 100, total 100000; please confirm the multiplication', 'info'],
        ['Penalty clause', 'The late-delivery penalty is open-ended with no cap', 'issue'],
      ]],
    ],
    att: 'urgent',
    findings: ['The late-delivery penalty has no maximum.', 'The title deed number is missing.'],
    questions: ['What is the title deed number?', 'Is there an agreed cap on the late penalty?'],
  })),
  'policy-reviewer': S('Health insurance policy (example)', 'sample_policy.pdf', G({
    conf: 0.92, note: NOTE, type: 'Individual health insurance policy',
    summary: 'A one-year health policy with a premium made of three components. Pre-existing conditions are excluded while the general cover clause suggests they are included. See the number checks below.',
    checks: [['Total annual premium', 950, [800, 80, 20]]],
    dates: [['Coverage period', 'From 01/01/2026 to 31/12/2026', '2026-01-01', '2026-12-31']],
    sections: [
      ['Exclusions and limits', [
        ['Pre-existing conditions', 'Excluded entirely, while the "comprehensive cover" clause suggests they are included', 'issue'],
        ['Waiting period', 'Six months for surgery', 'warn'],
      ]],
      ['Coverage limits', [
        ['Annual limit', '50000', 'info'],
        ['Deductible per claim', '200', 'info'],
        ['Core cover', 'Inpatient care and emergencies', 'ok'],
      ]],
    ],
    att: 'urgent',
    findings: ['Conflict between the pre-existing exclusion and the comprehensive cover.', 'Six-month waiting period for surgery.'],
    questions: ['What premium is intended?', 'Are pre-existing conditions covered or not?'],
  })),
  'translation-reviewer': S('Contract translation (example)', 'sample_translation.pdf', G({
    conf: 0.9, note: NOTE, type: 'Services agreement translation (English to Arabic)',
    summary: 'The Arabic translation was compared with the English source sentence by sentence. The subject and object are reversed in the payment clause and a sentence is missing from the termination clause. Numbers in the translation are compared with the source in the number checks below.',
    checks: [['Total amount', 15000, [12000]], ['Contract term in months', 12, [12]]],
    dates: [['Contract term', 'From 01/01/2027 to 31/12/2027', '2027-01-01', '2027-12-31']],
    sections: [
      ['Sentence-by-sentence alignment', [
        ['Clause 1: provider duties', 'Source: "The Provider shall deliver the services"; translation: "The service provider undertakes to deliver the services" - consistent', 'ok'],
        ['Clause 4: payment', 'Source: "The Client pays the Provider"; translation says the provider pays the client - subject and object are reversed', 'issue'],
        ['Clause 6: termination', 'A sentence present in the source is missing from the translation (omission)', 'warn'],
      ]],
      ['Terminology', [['Liability', 'Translated one way in one place and another way elsewhere', 'warn']]],
    ],
    att: 'urgent',
    findings: ['Meaning reversed in the payment clause.', 'A sentence is omitted from the termination clause.'],
    questions: ['Which amount is authoritative: the source or the translation?', 'What single term should be used for "Liability"?'],
  })),
  'code-reviewer': S('Python source file (example)', 'sample_code.py', G({
    conf: 0.9, note: NOTE, type: 'Python file computing averages',
    summary: 'A read-only review of a small Python file. A secret key is written in the code, one query is open to injection, and some inputs are unguarded (division by the length of a list that may be empty). The docstring example states a result that is checked below.',
    checks: [['Docstring example result total([2, 3, 5])', 11, [2, 3, 5]]],
    sections: [
      ['Security', [
        ['Line 3: API_KEY = "sk-a…"', 'A secret key is hardcoded (only the first 4 characters are shown)', 'issue'],
        ['Line 12: SQL built by string concatenation', 'Open to SQL injection; use bound parameters', 'issue'],
      ]],
      ['Logic errors', [
        ['Line 7: division by len(items)', 'Crashes when the list is empty', 'warn'],
        ['Line 15: range(len(x) + 1)', 'Off-by-one error that can raise IndexError', 'warn'],
      ]],
      ['Note', [['The code was not run', 'This is a read-only review; it does not confirm that the code works or passes its tests', 'info']]],
    ],
    att: 'urgent',
    findings: ['Secret key in the source.', 'SQL injection risk.', 'Unguarded empty-list cases.'],
    questions: ['Can the key move to an environment variable?', 'What should happen on an empty list?'],
  })),
  'design-quote-reviewer': S('Brand identity quote (example)', 'sample_design_quote.pdf', G({
    conf: 0.92, note: NOTE, type: 'Brand identity quote for a start-up',
    summary: 'A quote with four priced items and a payment schedule. Ownership of the rights and delivery of source files are not mentioned. See the number checks below.',
    checks: [['Total of priced items', 2500, [800, 900, 500, 400]], ['Payment percentages', 100, [50, 30, 20]]],
    dates: [['Delivery period', 'From 01/12/2026 to 20/12/2026', '2026-12-01', '2026-12-20']],
    sections: [
      ['Deliverables', [['Logo in three formats', 'Clearly specified', 'ok']]],
      ['Revisions and ownership', [
        ['Revision rounds', 'Two free rounds, then charged by the hour', 'info'],
        ['Rights ownership', 'It does not say when ownership of the design passes to the client', 'warn'],
        ['Source files', 'It does not say whether they are delivered to the client', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Rights ownership and source files are not defined.'],
    questions: ['What total is intended?', 'When does ownership pass, and are source files delivered?'],
  })),
};
