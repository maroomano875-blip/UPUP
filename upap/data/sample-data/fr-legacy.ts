// Équivalents français des exemples contrat et analyses (même schéma que les exemples arabes).
import type { Sample } from './helper';

export const FR_LEGACY: Record<string, Sample> = {
  'contract-reviewer': {
    label: 'Bail de bureau (exemple)',
    file: 'sample_lease_contract.pdf',
    data: {
      confidence_score: 0.98,
      needs_human_review: true,
      warnings: ['Les dates de début et de fin du bail ne sont pas indiquées.', 'Le contrat n’indique pas le droit applicable.'],
      output: {
        contract_type: 'Contrat de bail de bureau',
        governing_law: '',
        jurisdiction: 'Tribunaux du pays de la première partie',
        // اسم الحقل عربي لأن الواجهة تقرؤه بهذا الاسم؛ النص هنا فرنسي
        executive_summary_ar: 'Ce bail est très déséquilibré en faveur du bailleur : droit illimité d’augmenter le loyer sans préavis, résiliation immédiate sans indemnité, perte du dépôt de garantie de 3 000 USD, et grosses réparations ainsi que frais juridiques reportés sur le locataire. Ne le signez pas en l’état ; renégociez les clauses ci-dessous.',
        clauses: [
          { clause_id: 'c1', type: 'Révision du loyer', risk_level: 'critical', risk_explanation: 'Une clause ouverte permet au bailleur d’augmenter le loyer à tout moment, arbitrairement et sans préavis.', recommendation: 'La remplacer par une hausse annuelle fixe et un préavis d’au moins 60 jours.' },
          { clause_id: 'c2', type: 'Résiliation', risk_level: 'critical', risk_explanation: 'Déséquilibrée : le bailleur peut mettre fin au bail immédiatement, sans motif ni indemnité, alors que le locataire n’a pas ce droit.', recommendation: 'Rédiger une clause réciproque listant les motifs de résiliation avec un préavis écrit de 30 à 60 jours.' },
          { clause_id: 'c3', type: 'Dépôt de garantie', risk_level: 'critical', risk_explanation: 'La perte anticipée de tout le dépôt, quel que soit le motif de la restitution ou l’état du local, fonctionne comme une pénalité abusive.', recommendation: 'Prévoir la restitution intégrale du dépôt en fin de bail, sauf dommage prouvé.' },
          { clause_id: 'c4', type: 'Entretien et réparations', risk_level: 'high', risk_explanation: 'Faire payer au locataire les grosses réparations et celles de structure est contraire à la pratique courante.', recommendation: 'Limiter le locataire à l’entretien courant et laisser au bailleur les réparations de structure.' },
          { clause_id: 'c5', type: 'Renouvellement et préavis', risk_level: 'high', risk_explanation: 'Renouvellement automatique de 5 ans à la seule volonté du bailleur, sans option pour le locataire.', recommendation: 'Accorder au locataire un préavis de non-renouvellement de 60 à 90 jours et raccourcir la durée de renouvellement.' },
          { clause_id: 'c6', type: 'Loyer et modalités de paiement', risk_level: 'medium', risk_explanation: 'Exiger un an de loyer d’avance fait peser une lourde charge financière sur le locataire.', recommendation: 'Négocier un paiement trimestriel ou mensuel.' },
        ],
      },
    },
  },
  'lab-summarizer': {
    label: 'Bilan d’analyses (exemple)',
    file: 'sample_lab_report.pdf',
    data: {
      confidence_score: 0.93,
      needs_human_review: true,
      warnings: ['Ceci est un exemple de démonstration avec des valeurs fictives, pas un rapport réel.'],
      output: {
        document_type: 'Numération sanguine et biochimie (exemple)',
        report_date: '2026-10-20',
        patient: { age: '35', sex: 'Homme' },
        tests: [
          { name: 'Hémoglobine', value: '11.2', unit: 'g/dL', reference_range: '13.5 - 17.5', status: 'low', note: '' },
          { name: 'Globules blancs', value: '7.1', unit: '10^3/uL', reference_range: '4.5 - 11.0', status: 'normal', note: '' },
          { name: 'Plaquettes', value: '255', unit: '10^3/uL', reference_range: '150 - 450', status: 'normal', note: '' },
          { name: 'Glycémie à jeun', value: '118', unit: 'mg/dL', reference_range: '70 - 99', status: 'high', note: '' },
          { name: 'Créatinine', value: '0.9', unit: 'mg/dL', reference_range: '0.7 - 1.3', status: 'normal', note: '' },
        ],
        key_findings: [
          'L’hémoglobine est inférieure à la plage de référence imprimée sur le rapport.',
          'La glycémie à jeun est supérieure à la plage de référence imprimée sur le rapport.',
          'Les autres analyses listées sont dans leur plage de référence.',
        ],
        summary: 'Le rapport liste cinq analyses : deux sont hors de la plage de référence (hémoglobine basse et glycémie à jeun élevée) et les trois autres sont dans la norme. Ceci résume seulement ce que dit le rapport ; l’interprétation de ces valeurs revient au médecin traitant.',
        questions_for_doctor: [
          'L’hémoglobine doit-elle être recontrôlée, ou d’autres analyses sont-elles nécessaires ?',
          'La glycémie à jeun nécessite-t-elle un suivi ou un test de confirmation ?',
          'Mon mode de vie ou mon traitement actuel pourraient-ils expliquer ces valeurs ?',
        ],
        attention_level: 'soon',
        attention_note: 'Il est conseillé de montrer ce rapport au médecin traitant pour évaluer les valeurs hors norme.',
        disclaimer: 'Ceci est un résumé automatique de ce que dit le rapport. Ce n’est pas un avis médical et cela ne remplace pas une consultation.',
      },
    },
  },
};
