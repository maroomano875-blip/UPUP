// Exemples français pour les agents génériques (2/2). Toutes les données sont fictives ; chaque exemple contient une erreur volontaire que les contrôles côté code détectent.
import type { Sample } from './helper';
import { G, S } from './helper';

const NOTE = 'Ceci est un exemple de démonstration avec des données fictives, pas un document réel.';

export const FR_GENERIC_B: Record<string, Sample> = {
  'shop-order-reviewer': S('Commande de boutique en ligne (exemple)', 'sample_order.pdf', G({
    conf: 0.93, note: NOTE, type: 'Bon de commande d’une boutique en ligne',
    summary: 'Une commande de deux produits avec frais de livraison et une remise. Elle indique « livraison gratuite » tout en listant des frais de livraison, et donne deux délais de retour différents. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Total à payer', 255, [200, 45, 15, -10]]],
    dates: [['Fenêtre de livraison', 'Livraison du 12/11/2026 au 18/11/2026', '2026-11-12', '2026-11-18']],
    sections: [
      ['Livraison et retours', [
        ['Livraison', 'Marquée « livraison gratuite » alors que la commande comprend des frais de livraison de 15', 'issue'],
        ['Délai de retour', 'Page produit : 14 jours ; politique de la boutique : 7 jours', 'issue'],
        ['Garantie', 'Un an, et aussi « aucune garantie sur les appareils soldés »', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['La livraison gratuite est contredite par des frais de livraison.', 'Deux délais de retour différents.'],
    questions: ['La livraison est-elle gratuite ou facturée 15 ?', 'Quel délai de retour s’applique ?'],
  })),
  'shipment-doc-reviewer': S('Connaissement maritime (exemple)', 'sample_shipment.pdf', G({
    conf: 0.92, note: NOTE, type: 'Connaissement maritime',
    summary: 'Un connaissement avec trois lignes de marchandises. Les conditions de livraison sont en conflit avec la personne qui paie le fret, et le numéro de la police d’assurance manque. Voir les contrôles de chiffres et de dates ci-dessous.',
    checks: [['Total des colis', 120, [50, 40, 20]], ['Poids total (kg)', 2400, [1000, 900, 500]], ['Coûts du fret', 1500, [1000, 300, 200]]],
    dates: [['Départ et arrivée', 'Départ le 05/12/2026 et arrivée le 28/11/2026', '2026-12-05', '2026-11-28']],
    sections: [
      ['Conditions', [
        ['Conditions de livraison', 'CIF, alors que le fret est enregistré comme « payé par le destinataire »', 'issue'],
        ['Assurance', 'Marquée « assuré » sans numéro de police', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Les conditions de livraison sont en conflit avec la personne qui paie le fret.', 'Le numéro de la police d’assurance manque.'],
    questions: ['Qui supporte réellement le fret ?', 'Quel est le numéro de la police d’assurance ?'],
  })),
  'farm-plan-reviewer': S('Plan de campagne agricole (exemple)', 'sample_farm_plan.pdf', G({
    conf: 0.9, note: NOTE, type: 'Plan de saison pour le blé et les légumineuses',
    summary: 'Un plan de saison avec trois parcelles et des coûts détaillés. La production totale indiquée repose sur le rendement par unité de surface et la surface, et la source d’irrigation n’est pas indiquée. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Surface totale (donum)', 50, [20, 15, 10]], ['Coût total', 7000, [3000, 2500, 1500]]],
    dates: [['Saison de culture', 'Du 15/11/2026 au 30/04/2027', '2026-11-15', '2027-04-30']],
    sections: [
      ['Production attendue', [
        ['Rendement par donum', '400 kg/donum', 'info'],
        ['Surface appliquée', '50 donum', 'info'],
        ['Production totale indiquée', '20000 kg ; veuillez confirmer la multiplication', 'info'],
      ]],
      ['Plan', [
        ['Rotation des cultures', 'Blé après blé sur la première parcelle', 'warn'],
        ['Source d’irrigation', 'Non indiquée', 'warn'],
      ]],
    ],
    att: 'soon',
    findings: ['Le blé est planté après du blé sur la première parcelle.', 'La source d’irrigation manque.'],
    questions: ['Quelle est la source d’irrigation et est-elle fiable ?', 'La rotation doit-elle être confirmée avec un agronome ?'],
  })),
  'trip-quote-reviewer': S('Offre de voyage organisé (exemple)', 'sample_trip.pdf', G({
    conf: 0.92, note: NOTE, type: 'Offre de voyage organisé de sept nuits',
    summary: 'Une offre de voyage avec trois séjours et trois lignes de prix. Les repas sont décrits comme « tout compris » alors que le déjeuner est exclu, le visa n’est pas mentionné et les conditions d’annulation sont strictes. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Total des nuits', 7, [3, 2, 3]], ['Prix total', 1800, [1200, 400, 200]]],
    dates: [['Période du voyage', 'Du 10/01/2027 au 17/01/2027', '2027-01-10', '2027-01-17']],
    sections: [
      ['Inclusions et exclusions', [
        ['Repas', 'Écrit « tout compris » alors que le déjeuner n’est pas inclus', 'issue'],
        ['Visa', 'Non indiqué comme inclus ni exclu', 'warn'],
        ['Annulation', 'Aucun remboursement dans les 30 jours précédant le départ', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['« Tout compris » contredit l’exclusion du déjeuner.', 'Le visa et l’annulation doivent être clarifiés.'],
    questions: ['Le déjeuner est-il inclus ou non ?', 'Le visa est-il à la charge du voyageur ?'],
  })),
  'subcontract-reviewer': S('Contrat de sous-traitance de travaux (exemple)', 'sample_subcontract.pdf', G({
    conf: 0.91, note: NOTE, type: 'Contrat de sous-traitance de travaux de finition',
    summary: 'Un contrat avec trois paiements et trois étapes. La pénalité de retard est décrite avec un plafond dans une clause et comme illimitée dans une autre, et la responsabilité en matière de sécurité pèse sur le sous-traitant sans plafond. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Paiements du contrat', 100000, [30000, 40000, 20000]], ['Pourcentages des étapes', 100, [40, 35, 25]]],
    dates: [['Durée d’exécution', 'Du 01/12/2026 au 30/06/2027', '2026-12-01', '2027-06-30']],
    sections: [
      ['Pénalités et garantie', [
        ['Pénalité de retard', 'Clause 8 : « 1 % par jour plafonné à 10 % » ; clause 14 : « pénalité illimitée »', 'issue'],
        ['Durée de garantie', 'Un an', 'info'],
        ['Assurance et sécurité', 'La responsabilité repose sur le sous-traitant sans plafond', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Les clauses 8 et 14 se contredisent sur la pénalité de retard.', 'La responsabilité en matière de sécurité n’a pas de plafond.'],
    questions: ['Quelle clause régit la pénalité de retard ?', 'Faut-il fixer un plafond à la responsabilité en matière de sécurité ?'],
  })),
  'engagement-letter-reviewer': S('Lettre de mission de conseil (exemple)', 'sample_engagement.pdf', G({
    conf: 0.92, note: NOTE, type: 'Lettre de mission de conseil - amélioration des ventes',
    summary: 'Une lettre de mission en trois phases avec des honoraires répartis entre elles. Elle promet un résultat garanti, sa clause de confidentialité entre en conflit avec une clause autorisant la divulgation, et elle n’a ni clause de résiliation ni clause de propriété intellectuelle. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Durées des phases (semaines)', 12, [4, 5, 4]], ['Honoraires', 30000, [10000, 10000, 10000]]],
    dates: [['Période de la mission', 'Du 01/12/2026 au 28/02/2027', '2026-12-01', '2027-02-28']],
    sections: [
      ['Conflits et risques', [
        ['Résultats garantis', '« Nous garantissons une hausse de 100 % des ventes » : une promesse irréaliste', 'issue'],
        ['Confidentialité et divulgation', 'Clause 7 : « la confidentialité est perpétuelle » ; clause 9 : « les informations peuvent être divulguées aux partenaires »', 'issue'],
        ['Clauses manquantes', 'Pas de clause de résiliation ni de clause de propriété intellectuelle', 'warn'],
        ['Périmètre des travaux', 'Clairement défini', 'ok'],
      ]],
    ],
    att: 'urgent',
    findings: ['Une promesse de résultat garanti.', 'Les clauses 7 et 9 sont en conflit.', 'Pas de clause de résiliation ni de PI.'],
    questions: ['La garantie doit-elle être supprimée ?', 'Quelle clause régit la confidentialité ?'],
  })),
  'article-fact-reviewer': S('Article avant publication (exemple)', 'sample_article.pdf', G({
    conf: 0.9, note: NOTE, type: 'Article de presse - hausse du prix du pain',
    summary: 'Un article sur la hausse des prix. Le titre donne un pourcentage comparé au chiffre du corps du texte dans les contrôles de chiffres ci-dessous. Il accuse une entreprise nommée sans sa réponse, contient deux déclarations contradictoires de la même personne et s’appuie sur une affirmation sans source.',
    checks: [['Hausse du titre par rapport au texte', 20, [25]], ['Parts des causes de la hausse', 100, [50, 30, 20]]],
    sections: [
      ['Sources et affirmations', [
        ['« Selon des observateurs »', 'Une affirmation sans source nommée', 'warn'],
        ['Entreprise nommée accusée de monopole', 'Risque juridique (diffamation) sans publication de la réponse de l’entreprise', 'issue'],
        ['Déclarations du ministre', 'Deux déclarations contradictoires de la même personne aux paragraphes 3 et 6', 'issue'],
        ['Langage', 'Le mot « catastrophe » n’est pas neutre', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Une entreprise nommée est accusée sans réponse.', 'Deux déclarations contradictoires.', 'Affirmations sans source.'],
    questions: ['Avez-vous obtenu une réponse de l’entreprise accusée ?', 'Laquelle des deux déclarations est exacte ?'],
  })),
  'production-report-reviewer': S('Rapport de production d’usine (exemple)', 'sample_production.pdf', G({
    conf: 0.91, note: NOTE, type: 'Rapport mensuel de production - usine',
    summary: 'Un rapport mensuel pour trois lignes de production. Le texte dit qu’il n’y a eu aucune blessure alors que le tableau en enregistre une, la maintenance d’une ligne est en retard et le certificat qualité a expiré avant la date du rapport. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Production totale (unités)', 10000, [4000, 3500, 2000]], ['Total des défectueux', 300, [100, 120, 80]]],
    dates: [['Période du rapport', 'Du 01/10/2026 au 31/10/2026', '2026-10-01', '2026-10-31']],
    sections: [
      ['Taux de défauts', [['Taux indiqué', '3 % comme écrit dans le rapport ; à vérifier avec les chiffres', 'info']]],
      ['Sécurité, maintenance et certification', [
        ['Accidents du travail', 'Texte du rapport : « aucune blessure » ; le tableau indique une blessure', 'issue'],
        ['Maintenance de la ligne 2', 'En retard de 15 jours sur le cycle indiqué de 30 jours', 'warn'],
        ['Certificat qualité', 'Il a expiré le 2026-09-30, avant la date du rapport', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['Contradiction dans l’enregistrement des accidents du travail.', 'La maintenance de la ligne 2 est en retard.', 'Le certificat qualité a expiré.'],
    questions: ['Quel est le statut réel de la blessure enregistrée ?', 'Quand le certificat qualité sera-t-il renouvelé ?'],
  })),
};
