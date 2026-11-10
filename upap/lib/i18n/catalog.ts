// ترجمات الفهرس (المهن والوكلاء) حسب slug. العربية تأتي من data/catalog.ts نفسه.
// لإضافة لغة: أضف مفتاحها هنا. أي slug ناقص يعود للعربية/الإنجليزية تلقائياً.
import type { Lang } from './index';
import type { Profession, LiveAgent } from '../../data/catalog';

type PT = { name: string; desc: string };
type AT = { name: string; desc: string };

const PROF: Record<string, Record<'en' | 'fr', PT>> = {
  accounting: { en: { name: 'Accounting', desc: 'Invoices, taxes, financial reports, monthly close.' }, fr: { name: 'Comptabilité', desc: 'Factures, impôts, rapports financiers, clôture mensuelle.' } },
  law: { en: { name: 'Law', desc: 'Contracts, memos, legal research, risk analysis.' }, fr: { name: 'Droit', desc: 'Contrats, notes juridiques, recherche, analyse des risques.' } },
  medicine: { en: { name: 'Medicine', desc: 'Clinical summaries, diagnostic coding, patient follow-up.' }, fr: { name: 'Médecine', desc: 'Résumés cliniques, codage diagnostique, suivi du patient.' } },
  engineering: { en: { name: 'Engineering', desc: 'Specifications, quantity take-off, drawing review.' }, fr: { name: 'Ingénierie', desc: 'Cahiers des charges, métrés, revue de plans.' } },
  education: { en: { name: 'Education', desc: 'Curricula, exams, grading, lesson plans.' }, fr: { name: 'Éducation', desc: 'Programmes, examens, correction, plans de cours.' } },
  marketing: { en: { name: 'Marketing', desc: 'Campaigns, content, performance analysis, local audience.' }, fr: { name: 'Marketing', desc: 'Campagnes, contenu, analyse de performance, audience locale.' } },
  hr: { en: { name: 'Human Resources', desc: 'Hiring, employment contracts, payroll, labour compliance.' }, fr: { name: 'Ressources humaines', desc: 'Recrutement, contrats de travail, paie, conformité sociale.' } },
  real_estate: { en: { name: 'Real Estate', desc: 'Valuation, lease contracts, unit marketing.' }, fr: { name: 'Immobilier', desc: 'Évaluation, baux, commercialisation de biens.' } },
  insurance: { en: { name: 'Insurance', desc: 'Claims, policies, risk estimation.' }, fr: { name: 'Assurance', desc: 'Sinistres, contrats, estimation des risques.' } },
  translation: { en: { name: 'Translation', desc: 'Certified translation, localisation, terminology.' }, fr: { name: 'Traduction', desc: 'Traduction certifiée, localisation, terminologie.' } },
  programming: { en: { name: 'Programming', desc: 'Code review, documentation, tests, migration.' }, fr: { name: 'Programmation', desc: 'Revue de code, documentation, tests, migration.' } },
  design: { en: { name: 'Design', desc: 'Visual identity, design briefs, ad copy.' }, fr: { name: 'Design', desc: 'Identité visuelle, cahiers de design, textes publicitaires.' } },
  ecommerce: { en: { name: 'E-commerce', desc: 'Product descriptions, pricing, customer service.' }, fr: { name: 'Commerce en ligne', desc: 'Fiches produits, tarification, service client.' } },
  logistics: { en: { name: 'Logistics', desc: 'Shipping, customs clearance, tracking.' }, fr: { name: 'Logistique', desc: 'Expédition, dédouanement, suivi.' } },
  agriculture: { en: { name: 'Agriculture', desc: 'Farm advice, irrigation scheduling, pest diagnosis.' }, fr: { name: 'Agriculture', desc: 'Conseil agricole, planification de l’irrigation, diagnostic des ravageurs.' } },
  tourism: { en: { name: 'Tourism', desc: 'Trip programmes, visas, bookings.' }, fr: { name: 'Tourisme', desc: 'Programmes de voyage, visas, réservations.' } },
  contracting: { en: { name: 'Contracting', desc: 'Tenders, payment certificates, work scheduling.' }, fr: { name: 'Entreprise de travaux', desc: 'Appels d’offres, situations de travaux, planification.' } },
  consulting: { en: { name: 'Consulting', desc: 'Feasibility studies, business plans, market analysis.' }, fr: { name: 'Conseil', desc: 'Études de faisabilité, plans d’affaires, analyse de marché.' } },
  journalism: { en: { name: 'Journalism', desc: 'Editing, fact-checking, news summaries.' }, fr: { name: 'Journalisme', desc: 'Rédaction, vérification des faits, synthèses d’actualité.' } },
  industry: { en: { name: 'Industry', desc: 'Quality, preventive maintenance, production planning.' }, fr: { name: 'Industrie', desc: 'Qualité, maintenance préventive, planification de production.' } },
};

const AGENT: Record<string, Record<'en' | 'fr', AT>> = {
  'invoice-reader': { en: { name: 'Invoice reader', desc: 'Extracts invoice data (vendor, date, items, tax, total) and has a second agent review it.' }, fr: { name: 'Lecteur de factures', desc: 'Extrait les données de la facture (fournisseur, date, lignes, taxe, total) et les fait relire par un second agent.' } },
  'contract-reviewer': { en: { name: 'Contract reviewer', desc: 'Analyses a contract, extracts risky clauses and suggests edits; needs human approval before delivery.' }, fr: { name: 'Relecteur de contrats', desc: 'Analyse un contrat, repère les clauses risquées et propose des modifications ; validation humaine requise avant livraison.' } },
  'lab-summarizer': { en: { name: 'Medical report summariser', desc: 'Summarises lab results and medical reports in plain language, flags out-of-range values and suggests questions for the doctor — no diagnosis, no treatment.' }, fr: { name: 'Synthèse de rapports médicaux', desc: 'Résume analyses et rapports médicaux en langage simple, signale les valeurs hors norme et propose des questions pour le médecin — sans diagnostic ni traitement.' } },
  'boq-reviewer': { en: { name: 'Bill of quantities reviewer', desc: 'Checks bill-of-quantities calculations, totals, duplicated and missing items — no engineering sign-off.' }, fr: { name: 'Relecteur de métrés', desc: 'Vérifie les calculs, totaux, doublons et postes manquants d’un bordereau de quantités — sans validation d’ingénieur.' } },
  'exam-reviewer': { en: { name: 'Exam reviewer', desc: 'Reads an exam paper and checks total marks, duplicated or unclear questions, the answer key and difficulty balance — help for the teacher, not a student assessment.' }, fr: { name: 'Relecteur d’examens', desc: 'Lit un sujet d’examen et vérifie le total des points, les questions dupliquées ou ambiguës, le corrigé et l’équilibre des niveaux — une aide pour l’enseignant, pas une évaluation des élèves.' } },
  'campaign-reviewer': { en: { name: 'Campaign reviewer', desc: 'Reads a campaign plan or ad copy and checks exaggerated claims, dates, offer terms, total budget and missing calls to action — no promises of results.' }, fr: { name: 'Relecteur de campagnes', desc: 'Lit un plan de campagne ou des textes publicitaires et vérifie les promesses exagérées, les dates, les conditions de l’offre, le budget total et l’absence d’appel à l’action — sans promesse de résultats.' } },
  'offer-reviewer': { en: { name: 'Job offer reviewer', desc: 'Reviews job offers and employment contracts: pay, periods, working hours and unbalanced clauses.' }, fr: { name: 'Relecteur d’offres d’emploi', desc: 'Relit offres d’emploi et contrats de travail : salaires, durées, horaires et clauses déséquilibrées.' } },
  'property-contract-reviewer': { en: { name: 'Property contract reviewer', desc: 'Reviews sale and lease contracts: areas, price and instalments, dates, mortgages and unfair clauses.' }, fr: { name: 'Relecteur de contrats immobiliers', desc: 'Relit contrats de vente et de bail : surfaces, prix et échéances, dates, hypothèques et clauses abusives.' } },
  'policy-reviewer': { en: { name: 'Insurance policy reviewer', desc: 'Reviews insurance policies: premiums, payments, cover limits and conflicts between cover and exclusions.' }, fr: { name: 'Relecteur de polices d’assurance', desc: 'Relit les polices d’assurance : primes, paiements, plafonds de garantie et contradictions entre garanties et exclusions.' } },
  'translation-reviewer': { en: { name: 'Translation reviewer', desc: 'Compares the source text with its translation: omissions, additions, reversed parties, changed numbers and consistent terminology.' }, fr: { name: 'Relecteur de traductions', desc: 'Compare le texte source à sa traduction : omissions, ajouts, parties inversées, chiffres modifiés et cohérence terminologique.' } },
  'code-reviewer': { en: { name: 'Code reviewer', desc: 'Reviews code: security flaws, logic errors and documentation that contradicts actual behaviour.' }, fr: { name: 'Relecteur de code', desc: 'Relit le code : failles de sécurité, erreurs de logique et documentation en contradiction avec le comportement réel.' } },
  'design-quote-reviewer': { en: { name: 'Design quote reviewer', desc: 'Reviews design quotes and agreements: prices, payment percentages, revisions and ownership.' }, fr: { name: 'Relecteur de devis de design', desc: 'Relit devis et accords de design : prix, pourcentages de paiement, révisions et propriété.' } },
  'shop-order-reviewer': { en: { name: 'Online store reviewer', desc: 'Reviews orders and product pages: totals, shipping, returns, warranty and health claims.' }, fr: { name: 'Relecteur de boutique en ligne', desc: 'Relit commandes et pages produits : totaux, livraison, retours, garantie et allégations de santé.' } },
  'shipment-doc-reviewer': { en: { name: 'Shipping document reviewer', desc: 'Reviews bills of lading and packing lists: quantities, weights, costs, delivery terms and insurance.' }, fr: { name: 'Relecteur de documents d’expédition', desc: 'Relit connaissements et listes de colisage : quantités, poids, coûts, conditions de livraison et assurance.' } },
  'farm-plan-reviewer': { en: { name: 'Farm plan reviewer', desc: 'Reviews farm plans: areas, costs, expected production, irrigation and pesticides.' }, fr: { name: 'Relecteur de plans agricoles', desc: 'Relit les plans agricoles : surfaces, coûts, production attendue, irrigation et pesticides.' } },
  'trip-quote-reviewer': { en: { name: 'Trip quote reviewer', desc: 'Reviews trip offers: nights, prices, what is included and cancellation terms.' }, fr: { name: 'Relecteur d’offres de voyage', desc: 'Relit les offres de voyage : nuits, prix, prestations incluses et conditions d’annulation.' } },
  'subcontract-reviewer': { en: { name: 'Subcontract reviewer', desc: 'Reviews subcontracts: payments, completion percentages, penalties, warranty and liability.' }, fr: { name: 'Relecteur de contrats de sous-traitance', desc: 'Relit les contrats de sous-traitance : paiements, pourcentages d’avancement, pénalités, garantie et responsabilité.' } },
  'engagement-letter-reviewer': { en: { name: 'Engagement letter reviewer', desc: 'Reviews consulting engagement letters: phases, fees, guaranteed promises, contradictions and missing clauses.' }, fr: { name: 'Relecteur de lettres de mission', desc: 'Relit les lettres de mission de conseil : phases, honoraires, promesses garanties, contradictions et clauses manquantes.' } },
  'article-fact-reviewer': { en: { name: 'Article reviewer', desc: 'Reviews articles before publication: figures, sources, legal risks and contradictory statements.' }, fr: { name: 'Relecteur d’articles', desc: 'Relit les articles avant publication : chiffres, sources, risques juridiques et déclarations contradictoires.' } },
  'production-report-reviewer': { en: { name: 'Production report reviewer', desc: 'Reviews industrial production reports: totals, defect rates, safety, maintenance and certificates.' }, fr: { name: 'Relecteur de rapports de production', desc: 'Relit les rapports de production industrielle : totaux, taux de défauts, sécurité, maintenance et certificats.' } },
};

const PLANNED: Record<string, Record<'en' | 'fr', string>> = {
  'مطابقة كشوف البنك': { en: 'Bank statement reconciliation', fr: 'Rapprochement bancaire' },
  'إقرار ضريبي': { en: 'Tax return', fr: 'Déclaration fiscale' },
  'صياغة المذكرات': { en: 'Memo drafting', fr: 'Rédaction de notes' },
  'بحث قانوني': { en: 'Legal research', fr: 'Recherche juridique' },
  'حساب كميات': { en: 'Quantity take-off', fr: 'Calcul des métrés' },
  'مولّد اختبارات': { en: 'Exam generator', fr: 'Générateur d’examens' },
  'خطة محتوى': { en: 'Content plan', fr: 'Plan de contenu' },
  'فرز السير الذاتية': { en: 'CV screening', fr: 'Tri des CV' },
  'مراجع عقود الإيجار': { en: 'Lease reviewer', fr: 'Relecteur de baux' },
  'فرز المطالبات': { en: 'Claims triage', fr: 'Tri des sinistres' },
  'مترجم وثائق': { en: 'Document translator', fr: 'Traducteur de documents' },
  'مراجع كود': { en: 'Code reviewer', fr: 'Relecteur de code' },
  'موجز تصميم': { en: 'Design brief', fr: 'Cahier de design' },
  'كاتب أوصاف المنتجات': { en: 'Product description writer', fr: 'Rédacteur de fiches produits' },
  'مستندات الشحن': { en: 'Shipping documents', fr: 'Documents d’expédition' },
  'مرشد زراعي': { en: 'Farm advisor', fr: 'Conseiller agricole' },
  'مخطط رحلات': { en: 'Trip planner', fr: 'Planificateur de voyages' },
  'مراجع عطاءات': { en: 'Tender reviewer', fr: 'Relecteur d’appels d’offres' },
  'دراسة جدوى': { en: 'Feasibility study', fr: 'Étude de faisabilité' },
  'مدقق حقائق': { en: 'Fact-checker', fr: 'Vérificateur de faits' },
  'جدولة صيانة': { en: 'Maintenance scheduling', fr: 'Planification de la maintenance' },
};

const tr = <T,>(table: Record<string, Record<'en' | 'fr', T>>, key: string, lang: Lang): T | undefined =>
  lang === 'ar' ? undefined : table[key]?.[lang];

export const profName = (p: Profession, lang: Lang) => (lang === 'ar' ? p.name_ar : tr(PROF, p.slug, lang)?.name ?? p.name_en);
export const profDesc = (p: Profession, lang: Lang) => (lang === 'ar' ? p.desc_ar : tr(PROF, p.slug, lang)?.desc ?? p.desc_ar);
export const agentName = (a: Pick<LiveAgent, 'slug' | 'name_ar'>, lang: Lang) => (lang === 'ar' ? a.name_ar : tr(AGENT, a.slug, lang)?.name ?? a.name_ar);
export const agentDesc = (a: Pick<LiveAgent, 'slug' | 'desc_ar'>, lang: Lang) => (lang === 'ar' ? a.desc_ar : tr(AGENT, a.slug, lang)?.desc ?? a.desc_ar);
export const plannedName = (ar: string, lang: Lang) => (lang === 'ar' ? ar : tr(PLANNED, ar, lang) ?? ar);
export const CATALOG_TR = { PROF, AGENT, PLANNED };

// نصوص ثابتة عربية داخل بيانات الدول (نظام ضريبي / لوائح). غير الموجود يُعرض كما هو (أغلبها أسماء لاتينية).
const STATIC: Record<string, Record<'en' | 'fr', string>> = {
  'ضريبة دخل / رسوم': { en: 'Income tax / fees', fr: 'Impôt sur le revenu / droits' },
  'ضريبة دخل': { en: 'Income tax', fr: 'Impôt sur le revenu' },
  'ضريبة مبيعات': { en: 'Sales tax', fr: 'Taxe sur les ventes' },
  'ضريبة مبيعات 16%': { en: 'Sales tax 16%', fr: 'Taxe sur les ventes 16 %' },
  'ضريبة مبيعات 18%': { en: 'Sales tax 18%', fr: 'Taxe sur les ventes 18 %' },
  'بدون VAT حالياً': { en: 'No VAT currently', fr: 'Pas de TVA actuellement' },
  'VAT 14% / الفاتورة الإلكترونية': { en: 'VAT 14% / e-invoicing', fr: 'TVA 14 % / facturation électronique' },
  'قانون حماية البيانات (قيد الإعداد)': { en: 'Data protection law (in preparation)', fr: 'Loi sur la protection des données (en préparation)' },
  'قانون المعاملات الإلكترونية': { en: 'Electronic transactions law', fr: 'Loi sur les transactions électroniques' },
};
export const staticText = (ar: string, lang: Lang) => (lang === 'ar' ? ar : STATIC[ar]?.[lang] ?? ar);
