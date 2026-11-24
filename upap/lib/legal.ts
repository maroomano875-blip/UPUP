// نصوص الصفحات القانونية بثلاث لغات. بريد التواصل من NEXT_PUBLIC_CONTACT_EMAIL (يضبطه المالك في Vercel).
import type { Lang } from './i18n';

export type LegalKind = 'privacy' | 'terms' | 'refunds';
export type LegalDoc = { title: string; updated: string; sections: { h: string; p: string[] }[] };
export const LEGAL_UPDATED = '2026-11-24';
export const contactEmail = () => (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '').trim() || 'upapsupport@gmail.com';

const AR: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'سياسة الخصوصية', updated: 'آخر تحديث',
    sections: [
      { h: 'من نحن', p: ['UPAP (نظام تشغيل المهن) منصة وكلاء ذكاء اصطناعي تساعد أصحاب المهن على قراءة المستندات وتحليلها. هذه السياسة توضح ما نجمعه وكيف نستعمله.'] },
      { h: 'البيانات التي نجمعها', p: ['بيانات الحساب: بريدك الإلكتروني ومزوّد الدخول (Google أو البريد وكلمة المرور). لا نرى كلمة مرورك.', 'المستندات التي ترفعها: تُقرأ وتُحلَّل لحظة الطلب ولا نحتفظ بالملف الأصلي. نحفظ ملخصاً للنتيجة فقط.', 'بيانات الاشتراك والدفع: الخطة والمدة وتاريخ الانتهاء ومعرّف الطلب ومعرّف عملية USDT. عمليات البلوكتشين علنية بطبيعتها.', 'بيانات تشغيل: سجل تدقيق للعمليات، وعدّادات الاستخدام، وبصمة مشفّرة مختصرة للجهاز لتحديد معدّل الطلبات. لا نبيع هذه البيانات.', 'ملفات تعريف الارتباط والتخزين المحلي: لحفظ لغتك وجلسة الدخول فقط.'] },
      { h: 'كيف نستعمل بياناتك', p: ['لتشغيل الخدمة وتحليل مستنداتك، وإدارة اشتراكك وحصتك، وإرسال إشعارات وبريد تأكيد الاشتراك، ولحماية المنصة من إساءة الاستعمال.'] },
      { h: 'معالجة الذكاء الاصطناعي', p: ['نص مستندك (أو صورته) يُرسَل إلى مزوّدي ذكاء اصطناعي خارجيين لتنفيذ التحليل. لا ترفع ما لا ترغب بمعالجته بهذه الطريقة.'] },
      { h: 'مدة الاحتفاظ', p: ['ملخصات التحاليل تُحذف تلقائياً بعد 30 يوماً. سجلات الاشتراك والدفع تبقى ما دامت لازمة للمحاسبة ومنع الاحتيال. تُحذف بيانات حسابك عند طلبك، عدا ما يلزم نظامياً.'] },
      { h: 'العزل والمشاركة', p: ['بيانات كل مكتب معزولة عن غيره. يرى العضو تحاليله، ويرى المشرف والمالك تحاليل المكتب. لا نبيع بياناتك ولا نشاركها إلا مع مزوّدي الاستضافة وقاعدة البيانات والذكاء الاصطناعي والبريد اللازمين لتشغيل الخدمة.'] },
      { h: 'حقوقك', p: ['يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر بريد التواصل أدناه.'] },
      { h: 'الأطفال', p: ['المنصة موجهة للبالغين وأصحاب المهن، ولا نجمع عمداً بيانات من هم دون 18 عاماً.'] },
      { h: 'التغييرات', p: ['قد نحدّث هذه السياسة، ويظهر تاريخ آخر تحديث أعلاها.'] },
    ],
  },
  terms: {
    title: 'شروط الاستخدام', updated: 'آخر تحديث',
    sections: [
      { h: 'القبول', p: ['باستعمالك المنصة أو اشتراكك فيها فإنك توافق على هذه الشروط وعلى سياسة الخصوصية وسياسة الاسترجاع.'] },
      { h: 'طبيعة الخدمة', p: ['مخرجات المنصة مساعدة آلية تحتاج إلى مراجعة بشرية. ليست استشارة قانونية أو طبية أو مالية أو هندسية، ولا تغني عن رأي المختص. أنت المسؤول عن القرارات التي تتخذها بناءً عليها.'] },
      { h: 'الحساب', p: ['الحساب شخصي، ولكل مستخدم مكتب واحد فقط. تحافظ على سرّية دخولك وتتحمل ما يجري تحت حسابك. يملك مالك المكتب إدارة أعضائه.'] },
      { h: 'التجربة المجانية', p: ['لكل مستخدم مسجَّل تجربة من 3 فرص (تحليل واحد في اليوم لمدة 3 أيام). يُمنع التحايل لتكرارها بحسابات متعددة.'] },
      { h: 'الاشتراكات والدفع', p: ['الخطط: فردي، صغيرة، متوسطة، كبيرة، بمدد أسبوعية أو شهرية أو سنوية، ولكل خطة حد للأعضاء وحد للتحليلات حسب جدول الأسعار في صفحة الاشتراكات.', 'الدفع بعملة USDT على شبكة TRON (TRC20) فقط، وبالمبلغ المحدد في الطلب بالضبط. أي شبكة أخرى أو مبلغ مختلف قد يضيع أو يؤخر التفعيل. مدة صلاحية الطلب ساعتان.', 'لا تجديد تلقائياً: ينتهي الاشتراك بانتهاء مدته، ويتوقف التحليل مع بقاء سجلك ظاهراً. لا يمكن شراء نفس الخطة بنفس المدة وهي فعّالة.'] },
      { h: 'الاستعمال المقبول', p: ['يُمنع استعمال المنصة لأغراض غير مشروعة، أو لرفع محتوى لا تملك حق معالجته، أو لمحاولة اختراقها أو تعطيلها أو تجاوز حدودها.'] },
      { h: 'التوفر وحدود المسؤولية', p: ['نقدّم الخدمة «كما هي» ونسعى لاستمرارها دون ضمان خلوها من الأخطاء أو الانقطاع. في الحدود التي يسمح بها النظام، لا نتحمل أضراراً غير مباشرة ناتجة عن استعمالك، ولا تتجاوز مسؤوليتنا قيمة ما دفعته آخر مرة.'] },
      { h: 'الإيقاف والتغيير', p: ['يجوز إيقاف الحسابات المخالفة. قد نعدّل الخدمة أو الأسعار أو هذه الشروط، والتعديل لا يسري على مدة مدفوعة سلفاً.'] },
    ],
  },
  refunds: {
    title: 'سياسة الاسترجاع', updated: 'آخر تحديث',
    sections: [
      { h: 'الاسترجاع خلال 7 أيام', p: ['إن لم تستعمل أي تحليل ضمن اشتراكك، يمكنك طلب استرجاع المبلغ خلال 7 أيام من تاريخ التفعيل. يُخصم من المبلغ المسترد رسوم شبكة التحويل.'] },
      { h: 'الدفع المكرر أو العطل', p: ['إن دفعت أكثر من مرة للطلب نفسه، أو لم تعمل الخدمة بسبب عطل منّا، نردّ المبلغ أو نمدّد اشتراكك بحسب ما تختاره.'] },
      { h: 'ما لا يُسترد', p: ['الاشتراك الذي استُعمل فيه تحليل بعد مرور الأيام السبعة، وما أُرسل بشبكة غير TRC20 أو إلى عنوان غير الظاهر في نافذة الدفع، لأن عمليات البلوكتشين لا تُعكس. وفي حالة المبلغ المختلف عن المطلوب نحاول المساعدة دون ضمان.'] },
      { h: 'كيف تطلب', p: ['راسلنا على بريد التواصل أدناه بمبلغ الطلب ومعرّف العملية (Transaction hash) وعنوان محفظتك. نراجع الطلب ونردّ خلال 7 أيام، ويكون الاسترجاع بـ USDT إلى المحفظة التي دفعت منها.'] },
    ],
  },
};

const EN: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'Privacy Policy', updated: 'Last updated',
    sections: [
      { h: 'Who we are', p: ['UPAP (Universal Professions AI Platform) is an AI-agent platform that helps professionals read and analyze documents. This policy explains what we collect and how we use it.'] },
      { h: 'What we collect', p: ['Account data: your email and sign-in provider (Google, or email and password). We never see your password.', 'Documents you upload: read and analyzed at request time. We do not keep the original file, only a summary of the result.', 'Subscription and payment data: plan, period, expiry date, order ID and USDT transaction ID. Blockchain transactions are public by nature.', 'Operational data: an audit log, usage counters, and a short hashed device fingerprint used for rate limiting. We do not sell this data.', 'Cookies and local storage: only to remember your language and keep you signed in.'] },
      { h: 'How we use it', p: ['To run the service and analyze your documents, manage your subscription and quota, send notices and subscription confirmation emails, and protect the platform from abuse.'] },
      { h: 'AI processing', p: ['The text (or image) of your document is sent to third-party AI providers to perform the analysis. Do not upload anything you do not want processed this way.'] },
      { h: 'Retention', p: ['Analysis summaries are deleted automatically after 30 days. Subscription and payment records are kept as long as needed for accounting and fraud prevention. We delete your account data on request, except what we must keep by law.'] },
      { h: 'Isolation and sharing', p: ['Each office’s data is isolated from others. Members see their own analyses; supervisors and the owner see the office’s analyses. We do not sell your data and share it only with the hosting, database, AI and email providers needed to run the service.'] },
      { h: 'Your rights', p: ['You may ask to access, correct or delete your data through the contact email below.'] },
      { h: 'Children', p: ['The platform is intended for adults and professionals. We do not knowingly collect data from anyone under 18.'] },
      { h: 'Changes', p: ['We may update this policy; the last-updated date appears at the top.'] },
    ],
  },
  terms: {
    title: 'Terms of Use', updated: 'Last updated',
    sections: [
      { h: 'Acceptance', p: ['By using or subscribing to the platform you agree to these terms, the Privacy Policy and the Refund Policy.'] },
      { h: 'Nature of the service', p: ['Outputs are automated assistance that requires human review. They are not legal, medical, financial or engineering advice and do not replace a qualified professional. You are responsible for decisions you make based on them.'] },
      { h: 'Account', p: ['Accounts are personal, and each user may belong to only one office. Keep your sign-in secret; you are responsible for activity under your account. An office owner manages the office’s members.'] },
      { h: 'Free trial', p: ['Each registered user gets a trial of 3 tries (one analysis per day for 3 days). Creating multiple accounts to repeat it is prohibited.'] },
      { h: 'Subscriptions and payment', p: ['Plans: Individual, Small, Medium and Large, billed weekly, monthly or yearly, each with a member limit and an analysis limit as shown on the plans page.', 'Payment is in USDT on the TRON network (TRC20) only, for the exact amount shown in the order. Another network or a different amount may be lost or delay activation. An order is valid for two hours.', 'No automatic renewal: a subscription ends when its period ends, analysis stops and your history stays visible. The same plan and period cannot be bought while it is active.'] },
      { h: 'Acceptable use', p: ['You may not use the platform unlawfully, upload content you have no right to process, or try to hack, disrupt or bypass its limits.'] },
      { h: 'Availability and liability', p: ['The service is provided “as is”. We work to keep it available but do not guarantee it is error-free or uninterrupted. To the extent permitted by law we are not liable for indirect damages, and our liability does not exceed what you last paid.'] },
      { h: 'Suspension and changes', p: ['Accounts that violate these terms may be suspended. We may change the service, prices or these terms; changes do not affect a period already paid for.'] },
    ],
  },
  refunds: {
    title: 'Refund Policy', updated: 'Last updated',
    sections: [
      { h: '7-day refund', p: ['If you have not used any analysis under your subscription, you may request a refund within 7 days of activation. Network transfer fees are deducted from the refund.'] },
      { h: 'Duplicate payment or fault', p: ['If you paid more than once for the same order, or the service did not work because of a fault on our side, we refund or extend your subscription as you prefer.'] },
      { h: 'What is not refundable', p: ['A subscription in which an analysis was used after the 7 days, and funds sent on a network other than TRC20 or to an address other than the one shown in the payment window, because blockchain transactions cannot be reversed. If the amount differs from the one requested we will try to help, without guarantee.'] },
      { h: 'How to request', p: ['Email us at the contact address below with the order amount, the transaction hash and your wallet address. We review and reply within 7 days, and refunds are made in USDT to the wallet you paid from.'] },
    ],
  },
};

const FR: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'Politique de confidentialité', updated: 'Dernière mise à jour',
    sections: [
      { h: 'Qui nous sommes', p: ['UPAP (Universal Professions AI Platform) est une plateforme d’agents IA qui aide les professionnels à lire et analyser des documents. Cette politique explique ce que nous collectons et comment nous l’utilisons.'] },
      { h: 'Données collectées', p: ['Compte : votre e-mail et le mode de connexion (Google, ou e-mail et mot de passe). Nous ne voyons jamais votre mot de passe.', 'Documents envoyés : lus et analysés au moment de la demande. Nous ne conservons pas le fichier d’origine, seulement un résumé du résultat.', 'Abonnement et paiement : forfait, période, date d’expiration, identifiant de commande et identifiant de transaction USDT. Les transactions blockchain sont publiques par nature.', 'Données techniques : journal d’audit, compteurs d’usage et courte empreinte hachée de l’appareil pour limiter le débit. Nous ne vendons pas ces données.', 'Cookies et stockage local : uniquement pour retenir votre langue et votre session.'] },
      { h: 'Utilisation', p: ['Pour fournir le service et analyser vos documents, gérer votre abonnement et votre quota, envoyer des notifications et e-mails de confirmation, et protéger la plateforme contre les abus.'] },
      { h: 'Traitement par IA', p: ['Le texte (ou l’image) de votre document est envoyé à des fournisseurs d’IA tiers pour réaliser l’analyse. N’envoyez rien que vous ne souhaitez pas faire traiter ainsi.'] },
      { h: 'Conservation', p: ['Les résumés d’analyse sont supprimés automatiquement après 30 jours. Les dossiers d’abonnement et de paiement sont conservés le temps nécessaire à la comptabilité et à la prévention de la fraude. Nous supprimons vos données sur demande, hors obligations légales.'] },
      { h: 'Isolation et partage', p: ['Les données de chaque bureau sont isolées. Un membre voit ses analyses ; superviseur et propriétaire voient celles du bureau. Nous ne vendons pas vos données et ne les partageons qu’avec les prestataires d’hébergement, de base de données, d’IA et d’e-mail nécessaires au service.'] },
      { h: 'Vos droits', p: ['Vous pouvez demander l’accès, la rectification ou la suppression de vos données via l’adresse de contact ci-dessous.'] },
      { h: 'Enfants', p: ['La plateforme s’adresse aux adultes et aux professionnels. Nous ne collectons pas sciemment de données de personnes de moins de 18 ans.'] },
      { h: 'Modifications', p: ['Nous pouvons mettre à jour cette politique ; la date de dernière mise à jour figure en haut.'] },
    ],
  },
  terms: {
    title: 'Conditions d’utilisation', updated: 'Dernière mise à jour',
    sections: [
      { h: 'Acceptation', p: ['En utilisant la plateforme ou en vous abonnant, vous acceptez ces conditions, la politique de confidentialité et la politique de remboursement.'] },
      { h: 'Nature du service', p: ['Les résultats sont une aide automatisée qui nécessite une relecture humaine. Ils ne constituent pas un conseil juridique, médical, financier ou d’ingénierie et ne remplacent pas un professionnel qualifié. Vous restez responsable des décisions prises à partir de ceux-ci.'] },
      { h: 'Compte', p: ['Le compte est personnel et chaque utilisateur ne peut appartenir qu’à un seul bureau. Gardez votre accès secret ; vous êtes responsable de l’activité de votre compte. Le propriétaire d’un bureau gère ses membres.'] },
      { h: 'Essai gratuit', p: ['Chaque utilisateur inscrit dispose d’un essai de 3 tentatives (une analyse par jour pendant 3 jours). Il est interdit de créer plusieurs comptes pour le répéter.'] },
      { h: 'Abonnements et paiement', p: ['Forfaits : Individuel, Petit, Moyen et Grand, facturés à la semaine, au mois ou à l’année, chacun avec une limite de membres et d’analyses indiquée sur la page des abonnements.', 'Le paiement se fait en USDT sur le réseau TRON (TRC20) uniquement, pour le montant exact indiqué dans la commande. Un autre réseau ou un autre montant peut être perdu ou retarder l’activation. Une commande est valable deux heures.', 'Pas de renouvellement automatique : l’abonnement prend fin à l’échéance, l’analyse s’arrête et l’historique reste visible. Le même forfait et la même période ne peuvent être achetés tant qu’ils sont actifs.'] },
      { h: 'Usage acceptable', p: ['Il est interdit d’utiliser la plateforme de façon illégale, d’envoyer du contenu que vous n’avez pas le droit de traiter, ou de tenter de la pirater, la perturber ou contourner ses limites.'] },
      { h: 'Disponibilité et responsabilité', p: ['Le service est fourni « en l’état ». Nous cherchons à le maintenir disponible sans garantir l’absence d’erreurs ou d’interruptions. Dans les limites de la loi, nous ne répondons pas des dommages indirects et notre responsabilité n’excède pas ce que vous avez payé en dernier.'] },
      { h: 'Suspension et modifications', p: ['Les comptes contrevenants peuvent être suspendus. Nous pouvons modifier le service, les prix ou ces conditions ; cela n’affecte pas une période déjà payée.'] },
    ],
  },
  refunds: {
    title: 'Politique de remboursement', updated: 'Dernière mise à jour',
    sections: [
      { h: 'Remboursement sous 7 jours', p: ['Si vous n’avez utilisé aucune analyse dans votre abonnement, vous pouvez demander un remboursement dans les 7 jours suivant l’activation. Les frais de transfert réseau sont déduits.'] },
      { h: 'Double paiement ou panne', p: ['Si vous avez payé plusieurs fois la même commande, ou si le service n’a pas fonctionné à cause d’une panne de notre côté, nous remboursons ou prolongeons votre abonnement selon votre choix.'] },
      { h: 'Non remboursable', p: ['Un abonnement dont une analyse a été utilisée après les 7 jours, et les fonds envoyés sur un réseau autre que TRC20 ou vers une adresse autre que celle de la fenêtre de paiement, car les transactions blockchain sont irréversibles. Si le montant diffère de celui demandé, nous essaierons d’aider sans garantie.'] },
      { h: 'Comment demander', p: ['Écrivez-nous à l’adresse de contact ci-dessous avec le montant de la commande, le hash de transaction et l’adresse de votre portefeuille. Nous répondons sous 7 jours et remboursons en USDT vers le portefeuille d’origine.'] },
    ],
  },
};

export const LEGAL: Record<Lang, Record<LegalKind, LegalDoc>> = { ar: AR, en: EN, fr: FR };
