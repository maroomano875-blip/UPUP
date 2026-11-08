// نتائج تجريبية محفوظة: تُعرض فوراً بلا أي استدعاء للذكاء الاصطناعي (تكلفتها صفر).
// لكل وكيل مثال بالعربية وآخر بالإنجليزية، ويُختار حسب لغة التحليل المحددة في الواجهة.
import type { Sample } from './sample-data/helper';
import { AR_LEGACY } from './sample-data/ar-legacy';
import { AR_CORE } from './sample-data/ar-core';
import { AR_GENERIC_A } from './sample-data/ar-generic-a';
import { AR_GENERIC_B } from './sample-data/ar-generic-b';
import { EN_LEGACY } from './sample-data/en-legacy';
import { EN_CORE } from './sample-data/en-core';
import { EN_GENERIC_A } from './sample-data/en-generic-a';
import { EN_GENERIC_B } from './sample-data/en-generic-b';

export type { Sample };
export type SampleLang = 'ar' | 'en';

const AR: Record<string, Sample> = { ...AR_CORE, ...AR_LEGACY, ...AR_GENERIC_A, ...AR_GENERIC_B };
const EN: Record<string, Sample> = { ...EN_CORE, ...EN_LEGACY, ...EN_GENERIC_A, ...EN_GENERIC_B };

export const SAMPLES: Record<string, Record<SampleLang, Sample>> = Object.fromEntries(
  Object.keys(AR).map((slug) => [slug, { ar: AR[slug], en: EN[slug] ?? AR[slug] }]),
);

// أي لغة تحليل عربية → مثال عربي، وغيرها → إنجليزي
export const sampleLang = (lang: string): SampleLang => (lang.toLowerCase().startsWith('ar') ? 'ar' : 'en');
