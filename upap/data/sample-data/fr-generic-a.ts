// Exemples français pour les agents génériques (1/2). Toutes les données sont fictives ; chaque exemple contient une erreur volontaire que les contrôles côté code détectent.
import type { Sample } from './helper';
import { G, S } from './helper';

const NOTE = 'Ceci est un exemple de démonstration avec des données fictives, pas un document réel.';

export const FR_GENERIC_A: Record<string, Sample> = {
  'exam-reviewer': S('Sujet d’examen de mathématiques (exemple)', 'sample_exam.pdf', G({
    conf: 0.92, note: NOTE, type: 'Sujet d’examen de mathématiques - classe de 3e',
    summary: 'Un sujet de cinq questions à revoir avant validation : une question manque de données pour être résolue et une sous-question n’a pas de barème. Voir les contrôles de chiffres et de dates ci-dessous.',
    checks: [['Total des points', 100, [10, 15, 20, 25, 20]]],
    dates: [['Annonce des résultats', 'Les résultats sont annoncés à partir du 20/11/2026 jusqu’au 10/11/2026', '2026-11-20', '2026-11-10']],
    sections: [
      ['Questions', [
        ['Question 1 : calculer l’expression', 'Claire et complète', 'ok'],
        ['Question 3 : trouver la valeur de x', 'Il manque des données pour la résoudre (la valeur de y n’est pas donnée)', 'issue'],
        ['Question 4 partie (b)', 'Le barème de cette partie n’est pas indiqué', 'warn'],
      ]],
      ['Équilibre', [['Répartition des niveaux', 'La plupart des questions testent le rappel direct ; il n’y a aucune question de raisonnement', 'info']]],
    ],
    att: 'urgent',
    findings: ['La question 3 manque de données.', 'Le barème de la question 4 (b) n’est pas indiqué.'],
    questions: ['Quelle valeur de y est prévue à la question 3 ?', 'Combien de points vaut la partie (b) de la question 4 ?'],
  })),
  'campaign-reviewer': S('Plan de campagne publicitaire (exemple)', 'sample_campaign.pdf', G({
    conf: 0.9, note: NOTE, type: 'Plan de campagne publicitaire - lancement d’une boutique en ligne',
    summary: 'Un plan de campagne d’un mois avec un budget réparti sur quatre canaux. Il contient des allégations publicitaires absolues sans source et des publications d’influenceurs non signalées comme publicité. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Budget total', 12000, [5000, 3500, 2000, 1500]], ['Pourcentages par canal', 100, [40, 30, 20, 15]]],
    dates: [['Période de la campagne', 'Du 01/12/2026 au 31/12/2026', '2026-12-01', '2026-12-31']],
    sections: [
      ['Allégations et conformité', [
        ['« Le moins cher du marché »', 'Allégation comparative absolue sans source à l’appui', 'issue'],
        ['Publications d’influenceurs', 'Rien n’indique qu’il s’agit de publicité payée', 'warn'],
      ]],
      ['Offre et dates', [['Remise de 30 %', 'La durée et les conditions de l’offre ne sont pas définies', 'warn']]],
      ['Qualité du message', [
        ['Appel à l’action', 'Clair dans chaque annonce', 'ok'],
        ['Public cible', 'Non défini dans le plan', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['L’allégation « le moins cher » n’est pas étayée.', 'Le contenu des influenceurs n’est pas signalé.'],
    questions: ['Quelle est la source de la comparaison de prix ?', 'Qui est le public cible et combien de temps dure la remise ?'],
  })),
  'offer-reviewer': S('Offre d’emploi (exemple)', 'sample_offer.pdf', G({
    conf: 0.93, note: NOTE, type: 'Offre d’emploi - responsable comptable',
    summary: 'Une offre avec un salaire en trois composantes et des horaires hebdomadaires. Le préavis et les congés annuels ne sont pas indiqués. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Salaire mensuel total', 1700, [1200, 300, 100]]],
    dates: [['Période d’essai', 'Période d’essai du 01/12/2026 au 01/03/2027', '2026-12-01', '2027-03-01']],
    sections: [
      ['Conditions essentielles', [
        ['Période d’essai', 'Trois mois', 'info'],
        ['Préavis de démission', 'Non indiqué', 'warn'],
        ['Congés annuels', 'Le nombre de jours de congé n’est pas indiqué', 'warn'],
      ]],
      ['Horaires de travail', [['8 heures par jour × 5 jours', 'Le texte indique 8 heures par jour et 5 jours par semaine, mais les heures hebdomadaires indiquées sont 45', 'issue']]],
    ],
    att: 'urgent',
    findings: ['Les heures hebdomadaires indiquées contredisent les heures par jour et le nombre de jours.', 'Le préavis et les congés manquent.'],
    questions: ['Quel salaire total est prévu ?', 'Combien de jours de préavis et de congés annuels s’appliquent ?'],
  })),
  'property-contract-reviewer': S('Contrat de vente d’appartement (exemple)', 'sample_property.pdf', G({
    conf: 0.91, note: NOTE, type: 'Contrat de vente d’un appartement résidentiel',
    summary: 'Un contrat de vente d’un appartement au deuxième étage avec un tableau des surfaces, des échéances et une date de remise. La pénalité de retard de paiement n’est pas plafonnée. Voir les contrôles de chiffres et de dates ci-dessous.',
    checks: [['Surfaces des pièces (m²)', 100, [35, 25, 20, 12, 8]], ['Échéances du prix', 100000, [30000, 20000, 20000, 20000]]],
    dates: [['Date de remise', 'Le bien est remis à partir du 01/12/2026 jusqu’au 15/11/2026', '2026-12-01', '2026-11-15']],
    sections: [
      ['Parties et bien', [
        ['Description du bien', 'Deuxième étage, surface 100 m²', 'ok'],
        ['Titre de propriété', 'Le numéro de l’acte n’est pas indiqué', 'warn'],
      ]],
      ['Prix et conditions', [
        ['Prix au m², surface et total', 'Prix au m² 1000, surface 100, total 100000 ; veuillez confirmer la multiplication', 'info'],
        ['Clause pénale', 'La pénalité de retard de livraison est ouverte, sans plafond', 'issue'],
      ]],
    ],
    att: 'urgent',
    findings: ['La pénalité de retard de livraison n’a pas de maximum.', 'Le numéro du titre de propriété manque.'],
    questions: ['Quel est le numéro du titre de propriété ?', 'Un plafond de la pénalité de retard a-t-il été convenu ?'],
  })),
  'policy-reviewer': S('Police d’assurance santé (exemple)', 'sample_policy.pdf', G({
    conf: 0.92, note: NOTE, type: 'Police d’assurance santé individuelle',
    summary: 'Une police santé d’un an avec une prime en trois composantes. Les maladies préexistantes sont exclues alors que la clause de garantie générale laisse penser qu’elles sont couvertes. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Prime annuelle totale', 950, [800, 80, 20]]],
    dates: [['Période de couverture', 'Du 01/01/2026 au 31/12/2026', '2026-01-01', '2026-12-31']],
    sections: [
      ['Exclusions et plafonds', [
        ['Maladies préexistantes', 'Exclues totalement, alors que la clause « couverture complète » laisse penser qu’elles sont incluses', 'issue'],
        ['Délai de carence', 'Six mois pour la chirurgie', 'warn'],
      ]],
      ['Plafonds de garantie', [
        ['Plafond annuel', '50000', 'info'],
        ['Franchise par sinistre', '200', 'info'],
        ['Garantie principale', 'Hospitalisation et urgences', 'ok'],
      ]],
    ],
    att: 'urgent',
    findings: ['Conflit entre l’exclusion des maladies préexistantes et la couverture complète.', 'Délai de carence de six mois pour la chirurgie.'],
    questions: ['Quelle prime est prévue ?', 'Les maladies préexistantes sont-elles couvertes ou non ?'],
  })),
  'translation-reviewer': S('Traduction d’un contrat (exemple)', 'sample_translation.pdf', G({
    conf: 0.9, note: NOTE, type: 'Traduction d’un contrat de services (anglais vers arabe)',
    summary: 'La traduction arabe a été comparée phrase par phrase au texte source anglais. Le sujet et l’objet sont inversés dans la clause de paiement et une phrase manque dans la clause de résiliation. Les chiffres de la traduction sont comparés à la source dans les contrôles ci-dessous.',
    checks: [['Montant total', 15000, [12000]], ['Durée du contrat en mois', 12, [12]]],
    dates: [['Durée du contrat', 'Du 01/01/2027 au 31/12/2027', '2027-01-01', '2027-12-31']],
    sections: [
      ['Alignement phrase par phrase', [
        ['Clause 1 : obligations du prestataire', 'Source : « The Provider shall deliver the services » ; traduction : « Le prestataire s’engage à fournir les services » - cohérent', 'ok'],
        ['Clause 4 : paiement', 'Source : « The Client pays the Provider » ; la traduction dit que le prestataire paie le client - sujet et objet inversés', 'issue'],
        ['Clause 6 : résiliation', 'Une phrase présente dans la source manque dans la traduction (omission)', 'warn'],
      ]],
      ['Terminologie', [['Responsabilité', 'Traduite d’une façon à un endroit et d’une autre ailleurs', 'warn']]],
    ],
    att: 'urgent',
    findings: ['Sens inversé dans la clause de paiement.', 'Une phrase est omise dans la clause de résiliation.'],
    questions: ['Quel montant fait foi : la source ou la traduction ?', 'Quel terme unique employer pour « Liability » ?'],
  })),
  'code-reviewer': S('Fichier source Python (exemple)', 'sample_code.py', G({
    conf: 0.9, note: NOTE, type: 'Fichier Python calculant des moyennes',
    summary: 'Une revue en lecture seule d’un petit fichier Python. Une clé secrète est écrite dans le code, une requête est ouverte à l’injection et certaines entrées ne sont pas protégées (division par la longueur d’une liste éventuellement vide). L’exemple de la docstring annonce un résultat vérifié ci-dessous.',
    checks: [['Résultat de l’exemple de la docstring total([2, 3, 5])', 11, [2, 3, 5]]],
    sections: [
      ['Sécurité', [
        ['Ligne 3 : API_KEY = "sk-a…"', 'Une clé secrète est écrite en dur (seuls les 4 premiers caractères sont montrés)', 'issue'],
        ['Ligne 12 : SQL construit par concaténation', 'Ouvert à l’injection SQL ; utiliser des paramètres liés', 'issue'],
      ]],
      ['Erreurs de logique', [
        ['Ligne 7 : division par len(items)', 'Plante quand la liste est vide', 'warn'],
        ['Ligne 15 : range(len(x) + 1)', 'Erreur d’un cran pouvant lever IndexError', 'warn'],
      ]],
      ['Remarque', [['Le code n’a pas été exécuté', 'Il s’agit d’une revue en lecture seule ; elle ne confirme pas que le code fonctionne ni qu’il passe ses tests', 'info']]],
    ],
    att: 'urgent',
    findings: ['Clé secrète dans la source.', 'Risque d’injection SQL.', 'Cas de liste vide non protégés.'],
    questions: ['La clé peut-elle passer dans une variable d’environnement ?', 'Que doit-il se passer avec une liste vide ?'],
  })),
  'design-quote-reviewer': S('Devis d’identité visuelle (exemple)', 'sample_design_quote.pdf', G({
    conf: 0.92, note: NOTE, type: 'Devis d’identité visuelle pour une start-up',
    summary: 'Un devis de quatre postes chiffrés avec un échéancier de paiement. La propriété des droits et la remise des fichiers sources ne sont pas mentionnées. Voir les contrôles de chiffres ci-dessous.',
    checks: [['Total des postes chiffrés', 2500, [800, 900, 500, 400]], ['Pourcentages de paiement', 100, [50, 30, 20]]],
    dates: [['Délai de livraison', 'Du 01/12/2026 au 20/12/2026', '2026-12-01', '2026-12-20']],
    sections: [
      ['Livrables', [['Logo en trois formats', 'Clairement spécifié', 'ok']]],
      ['Révisions et propriété', [
        ['Tours de révision', 'Deux tours gratuits, puis facturation à l’heure', 'info'],
        ['Propriété des droits', 'Le devis ne dit pas quand la propriété du design passe au client', 'warn'],
        ['Fichiers sources', 'Le devis ne dit pas s’ils sont remis au client', 'warn'],
      ]],
    ],
    att: 'urgent',
    findings: ['La propriété des droits et les fichiers sources ne sont pas définis.'],
    questions: ['Quel total est prévu ?', 'Quand la propriété est-elle transférée, et les fichiers sources sont-ils remis ?'],
  })),
};
