// نتائج تجريبية محفوظة: تُعرض فوراً بلا أي استدعاء للذكاء الاصطناعي.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SAMPLES: Record<string, { label: string; file: string; data: Record<string, any> }> = {
  'invoice-reader': {
    label: 'فاتورة سورية (مثال)',
    file: 'sample_invoice_SY.jpg',
    data: {
      confidence_score: 0.95,
      needs_human_review: false,
      warnings: [],
      output: {
        vendor_name: 'شركة النور للتجارة',
        invoice_number: '1043',
        invoice_date: '2026-10-12',
        total: '1,850,000',
        currency: 'SYP',
        category: 'مستلزمات مكتبية',
        suggested_journal_entry: { debit_account: 'مصاريف مكتبية', credit_account: 'الموردون' },
      },
    },
  },
  'contract-reviewer': {
    label: 'عقد إيجار مكتب (مثال)',
    file: 'sample_lease_contract.pdf',
    data: {
      confidence_score: 0.98,
      needs_human_review: true,
      warnings: ['لم يتم تحديد تاريخ بدء العقد أو انتهائه.', 'لم يذكر العقد القانون الحاكم بشكل صريح.'],
      output: {
        contract_type: 'عقد إيجار مكتب',
        governing_law: '',
        jurisdiction: 'محاكم بلد الطرف الأول (الجمهورية العربية السورية)',
        executive_summary_ar: 'يحتوي هذا العقد على درجات خطورة عالية جداً لصالح المؤجر: حق مطلق في زيادة الأجرة دون إشعار، وفسخ فوري دون تعويض، ومصادرة مبلغ التأمين (3,000 دولار)، وتحميل المستأجر الصيانات الكبرى ومصاريف التقاضي. يوصى بعدم التوقيع بصيغته الحالية وإعادة التفاوض على بنوده.',
        clauses: [
          { clause_id: 'c1', type: 'تعديل الأجرة', risk_level: 'critical', risk_explanation: 'بند مجحف وغير محدد يعطي المؤجر حق زيادة بدل الإيجار بشكل تعسفي وفي أي وقت ودون إشعار مسبق.', recommendation: 'حذف البند واستبداله بنسبة زيادة سنوية ثابتة وفترة إشعار لا تقل عن 60 يوماً.' },
          { clause_id: 'c2', type: 'فسخ العقد', risk_level: 'critical', risk_explanation: 'بند غير متوازن يمنح المؤجر الإنهاء الفوري دون أسباب أو تعويض، ويحرم المستأجر من ذلك.', recommendation: 'صياغة بند متبادل يحدد حالات الفسخ مع إشعار خطي مسبق (30-60 يوماً).' },
          { clause_id: 'c3', type: 'مبلغ التأمين', risk_level: 'critical', risk_explanation: 'مصادرة التأمين بالكامل ومسبقاً دون النظر لسبب التسليم أو حالة العقار تعد شرطاً جزائياً تعسفياً.', recommendation: 'النص على رد التأمين كاملاً عند نهاية العقد ما لم تكن هناك أضرار مثبتة.' },
          { clause_id: 'c4', type: 'الصيانة والإصلاحات', risk_level: 'high', risk_explanation: 'تحميل المستأجر الصيانة الكبرى والهيكلية يخالف العرف والتكليف القانوني.', recommendation: 'قصر التزام المستأجر على الصيانة التشغيلية، وتكليف المؤجر بالصيانة الهيكلية.' },
          { clause_id: 'c5', type: 'التجديد والإخطار', risk_level: 'high', risk_explanation: 'التجديد التلقائي لـ 5 سنوات بإرادة المؤجر وحده دون خيار للمستأجر.', recommendation: 'إعطاء المستأجر الحق بإخطار عدم التجديد قبل 60-90 يوماً وتقليل مدة التجديد.' },
          { clause_id: 'c6', type: 'بدل الإيجار وطريقة الدفع', risk_level: 'medium', risk_explanation: 'اشتراط دفع أجرة سنة كاملة مقدماً يفرض عبئاً مالياً على المستأجر.', recommendation: 'التفاوض على دفعات ربع سنوية أو شهرية.' },
        ],
      },
    },
  },
  'lab-summarizer': {
    label: 'تقرير طبي (مثال)',
    file: 'sample_lab_report.pdf',
    data: {
      confidence_score: 0.93,
      needs_human_review: true,
      warnings: ['هذا مثال تجريبي بقيم افتراضية وليس تقريراً حقيقياً.'],
      output: {
        document_type: 'تحليل دم عام (مثال)',
        report_date: '2026-10-20',
        patient: { age: '35', sex: 'ذكر' },
        tests: [
          { name: 'Hemoglobin', value: '11.2', unit: 'g/dL', reference_range: '13.5 - 17.5', status: 'low', note: '' },
          { name: 'WBC', value: '7.1', unit: '10^3/uL', reference_range: '4.5 - 11.0', status: 'normal', note: '' },
          { name: 'Platelets', value: '255', unit: '10^3/uL', reference_range: '150 - 450', status: 'normal', note: '' },
          { name: 'Fasting Glucose', value: '118', unit: 'mg/dL', reference_range: '70 - 99', status: 'high', note: '' },
          { name: 'Creatinine', value: '0.9', unit: 'mg/dL', reference_range: '0.7 - 1.3', status: 'normal', note: '' },
        ],
        key_findings: [
          'قيمة الهيموغلوبين أقل من المجال المرجعي المكتوب في التقرير.',
          'سكر الدم الصيامي أعلى من المجال المرجعي المكتوب.',
          'بقية الفحوص المذكورة ضمن المجال المرجعي.',
        ],
        summary: 'يضم التقرير خمسة فحوص: قيمتان خارج المجال المرجعي (الهيموغلوبين منخفض وسكر الدم الصيامي مرتفع)، والفحوص الثلاثة الأخرى ضمن المجال. هذا ملخص لما كُتب في التقرير فقط، وتفسير هذه القيم من اختصاص الطبيب المعالج.',
        questions_for_doctor: [
          'هل يلزم إعادة فحص الهيموغلوبين أو إضافة فحوص أخرى؟',
          'هل تحتاج قيمة السكر الصيامي إلى متابعة أو فحص تأكيدي؟',
          'هل لنمط حياتي أو أدويتي الحالية علاقة بهذه القيم؟',
        ],
        attention_level: 'soon',
        attention_note: 'يُنصح بعرض التقرير على الطبيب المعالج لتقييم القيم الخارجة عن المجال.',
        disclaimer: 'هذا تلخيص آلي لما ورد في التقرير وليس رأياً طبياً ولا بديلاً عن استشارة الطبيب.',
      },
    },
  },
};
