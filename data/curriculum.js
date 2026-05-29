/** Programme 3ème (Brevet) — matières et sujets officiels */

export const CLASSES = [
  {
    id: "3e",
    label: "3ème — Brevet",
    short: "3ème",
    available: true,
  },
  {
    id: "term",
    label: "Terminale — Bac",
    short: "Terminale",
    available: true,
  },
  {
    id: "bts2",
    label: "BTS — 2ᵉ année",
    short: "BTS 2",
    available: true,
  },
];

export const SUBJECTS_3E = [
  {
    id: "math",
    name: "Mathématiques",
    color: "math",
    topics: [
      "Théorème de Pythagore",
      "Théorème de Thalès",
      "Trigonométrie (SOH CAH TOA)",
      "Calcul littéral (identités)",
      "Arithmétique (nombres premiers)",
      "Fonctions affines et linéaires",
      "Équations-produits",
      "Probabilités",
    ],
  },
  {
    id: "fr",
    name: "Français",
    color: "fr",
    topics: [
      "Grammaire (classes grammaticales, fonctions)",
      "Conjugaison (temps du récit, subjonctif, conditionnel)",
      "L'autobiographie (récit de soi)",
      "La poésie (engagée et lyrique)",
      "Le théâtre (tragédie et comédie)",
      "Dénoncer les travers de la société (satire)",
      "Figures de style",
      "Méthodologie : la dictée et la rédaction",
    ],
  },
  {
    id: "hist",
    name: "Histoire",
    color: "hist",
    topics: [
      "La Première Guerre mondiale (1914-1918)",
      "L'entre-deux-guerres (régimes totalitaires)",
      "La Seconde Guerre mondiale (1939-1945)",
      "La France défaite et occupée (Vichy et Résistance)",
      "La Guerre froide",
      "Indépendances et construction de nouveaux États",
      "La construction européenne",
      "La France depuis 1945 (Vᵉ République)",
    ],
  },
  {
    id: "geo",
    name: "Géographie",
    color: "geo",
    topics: [
      "Les aires urbaines en France",
      "Les espaces productifs français",
      "Les espaces de faible densité",
      "Aménager le territoire français",
      "Les territoires ultramarins (DROM-COM)",
      "La France et l'UE dans le monde",
    ],
  },
  {
    id: "pc",
    name: "Physique-Chimie",
    color: "pc",
    topics: [
      "Constitution de la matière (atomes, ions, molécules)",
      "Les solutions acides et basiques (pH)",
      "L'Univers et le système solaire",
      "Mouvements et interactions (vitesse, forces)",
      "L'énergie (cinétique, potentielle, conservation)",
      "Les circuits électriques (lois de la tension et intensité)",
    ],
  },
  {
    id: "svt",
    name: "SVT",
    color: "svt",
    topics: [
      "Génétique (ADN, chromosomes, caractères)",
      "Le monde microbien et la santé",
      "Le système nerveux et les récepteurs",
      "Tectonique des plaques (séismes, volcans)",
      "La reproduction humaine",
      "L'évolution des espèces",
    ],
  },
  {
    id: "tech",
    name: "Technologie",
    color: "tech",
    topics: [
      "Analyse du besoin et fonctionnement",
      "Chaîne d'information et chaîne d'énergie",
      "Algorithmique et programmation (Scratch / robotique)",
      "Les réseaux informatiques et Internet",
      "Design et innovation (matériaux)",
    ],
  },
  {
    id: "emc",
    name: "EMC",
    color: "emc",
    topics: [
      "Les valeurs et principes de la République",
      "La citoyenneté française et européenne",
      "La Défense nationale et la sécurité",
      "Le fonctionnement de la justice",
    ],
  },
];

/** Texte du programme pour les niveaux « bientôt » (vide pour l’instant) */
export const SUBJECTS_PLACEHOLDER = [];

/** Matières et notions — Terminale générale (`gen-*` = id de spécialité) */
export const SUBJECTS_BY_TERM_SPEC = {
  "gen-math": [
    {
      id: "term-math",
      name: "Mathématiques",
      color: "math",
      topics: [
        "Combinatoire et dénombrement",
        "Suites (limites et récurrence)",
        "Fonctions (limites, continuité, convexité)",
        "Fonction logarithme népérien",
        "Fonction exponentielle",
        "Primitives et équations différentielles",
        "Calcul intégral",
        "Géométrie dans l'espace (vecteurs, droites, plans)",
        "Probabilités (loi binomiale, lois à densité, somme de variables)",
      ],
    },
  ],
  "gen-pc": [
    {
      id: "term-phys",
      name: "Physique",
      color: "pc",
      topics: [
        "Mouvements dans un champ uniforme",
        "Mécanique céleste (lois de Kepler)",
        "Modèle du gaz parfait et thermodynamique",
        "Ondes et phénomènes d'interférences",
        "Électricité (circuit RC et stockage d'énergie)",
        "Lunette astronomique",
      ],
    },
    {
      id: "term-chim",
      name: "Chimie",
      color: "pc",
      topics: [
        "Équilibres chimiques et pH-métrie",
        "Cinétique chimique (vitesse de réaction)",
        "Titrages acido-basiques",
        "Synthèse organique et spectroscopie (IR et RMN)",
        "Force des acides et bases",
      ],
    },
  ],
  "gen-ses": [
    {
      id: "term-econ",
      name: "Économie",
      color: "geo",
      topics: [
        "Sources et limites de la croissance",
        "Commerce international et mondialisation",
        "Instabilité de la croissance (crises)",
        "Économie de l'environnement (politiques climatiques)",
      ],
    },
    {
      id: "term-ses-soc",
      name: "Sociologie & science politique",
      color: "hist",
      topics: [
        "Structure de la société française",
        "Engagement politique et action collective",
        "Mobilité sociale",
        "Mutations du travail et de l'emploi",
      ],
    },
  ],
  "gen-svt": [
    {
      id: "term-svt",
      name: "SVT",
      color: "svt",
      topics: [
        "Génétique (méiose, brassages, complexification des génomes)",
        "Passé géologique de la Terre",
        "De la plante sauvage à la plante domestiquée",
        "Comportement et mouvement (système nerveux et muscles)",
        "Stress et santé humaine",
        "Climats de la Terre (passé et futur)",
      ],
    },
  ],
  "gen-hggsp": [
    {
      id: "term-hggsp",
      name: "HGGSP",
      color: "hist",
      topics: [
        "De la guerre à la paix (conflits et traités)",
        "Nouveaux espaces de conquête (espace et océans)",
        "Histoire et mémoire (génocides, conflits)",
        "L'environnement : un enjeu mondial",
        "L'enjeu de la connaissance (cyber, recherche, éducation)",
      ],
    },
  ],
  "gen-hlp": [
    {
      id: "term-hlp",
      name: "Littérature & philosophie",
      color: "fr",
      topics: [
        "Les expressions de la sensibilité",
        "Les métamorphoses du moi",
        "L'histoire et la violence",
        "L'humain et ses limites (technique et nature)",
      ],
    },
  ],
  "gen-nsi": [
    {
      id: "term-nsi",
      name: "Informatique",
      color: "tech",
      topics: [
        "Structures de données (piles, files, arbres, graphes)",
        "Bases de données (langage SQL)",
        "Algorithmique (programmation dynamique, diviser pour régner)",
        "Architecture matérielle et réseaux",
        "Systèmes d'exploitation",
      ],
    },
  ],
  "gen-llcer": [
    {
      id: "term-llcer",
      name: "Anglais (ou autre langue)",
      color: "fr",
      topics: [
        "Arts et débats d'idées",
        "Expression et construction de soi",
        "Voyages et territoires",
        "Échanges et transmissions",
      ],
    },
  ],
  "gen-si": [
    {
      id: "term-si",
      name: "Sciences de l'ingénieur",
      color: "tech",
      topics: [
        "Analyse des systèmes multiphysiques",
        "Modélisation et simulation",
        "Traitement de l'information (capteurs / actionneurs)",
        "Robotique et intelligence artificielle",
      ],
    },
  ],
  "gen-bio-eco": [
    {
      id: "term-bio-eco",
      name: "Biologie-écologie",
      color: "svt",
      topics: [
        "Biodiversité et préservation des milieux (lycée agricole)",
        "Agroécologie et transition des systèmes de production",
      ],
    },
  ],
};

/** Matières et notions — Terminale technologique (`tech-*` = id de série) */
export const SUBJECTS_BY_TERM_TECH = {
  "tech-stmg": [
    {
      id: "tech-stmg-msgn",
      name: "Management, sciences de gestion et numérique",
      color: "geo",
      topics: [
        "Stratégie d'organisation",
        "Analyse de la valeur (performance)",
        "Gestion des ressources humaines (GRH)",
        "Systèmes d'information (numérique)",
        "Marketing et relation client",
      ],
    },
    {
      id: "tech-stmg-de",
      name: "Droit et économie",
      color: "hist",
      topics: [
        "Le contrat de travail",
        "La responsabilité civile",
        "Le droit de propriété",
        "La croissance économique",
        "Le chômage",
        "Les politiques de l'État",
      ],
    },
  ],
  "tech-sti2d": [
    {
      id: "tech-sti2d-2i2d",
      name: "Ingénierie, innovation et développement durable (2I2D)",
      color: "tech",
      topics: [
        "Analyse cycle de vie",
        "Performance énergétique",
        "Chaîne d'énergie et d'information",
        "Architecture et construction",
        "Innovations technologiques",
      ],
    },
    {
      id: "tech-sti2d-pcm",
      name: "Physique-chimie et mathématiques",
      color: "pc",
      topics: [
        "Nombres complexes",
        "Énergie électrique (puissance)",
        "Ondes et signaux",
        "Transformations de la matière",
      ],
    },
  ],
  "tech-st2s": [
    {
      id: "tech-st2s-stss",
      name: "Sciences et techniques sanitaires et sociales",
      color: "svt",
      topics: [
        "État de santé et bien-être social",
        "Politiques publiques de santé",
        "Protection sociale",
        "Dispositifs d'accès aux soins",
        "Diagnostic social",
      ],
    },
    {
      id: "tech-st2s-bph",
      name: "Biologie et physiopathologie humaines",
      color: "svt",
      topics: [
        "Système nerveux et muscles",
        "Appareil respiratoire",
        "Circulation sanguine et cœur",
        "Transmission de la vie et génétique",
      ],
    },
  ],
  "tech-stl": [
    {
      id: "tech-stl-pcl",
      name: "Physique-chimie en laboratoire",
      color: "pc",
      topics: [
        "Optique et image",
        "Ondes sonores et lumière",
        "Chimie organique",
        "Mesures et incertitudes",
      ],
    },
    {
      id: "tech-stl-bbb",
      name: "Biochimie, biologie et biotechnologies",
      color: "svt",
      topics: [
        "Étude des micro-organismes",
        "Analyse biochimique (sang / urine)",
        "Génétique moléculaire",
        "Métabolisme cellulaire",
      ],
    },
  ],
  "tech-std2a": [
    {
      id: "tech-std2a-design",
      name: "Analyse et méthodes en design",
      color: "arts",
      topics: [
        "Design graphique et numérique",
        "Design d'objet",
        "Design d'espace (architecture)",
        "Design de mode et textile",
        "Culture design",
      ],
    },
  ],
  "tech-sthr": [
    {
      id: "tech-sthr-sts",
      name: "Sciences et technologies des services",
      color: "geo",
      topics: [
        "Économie du tourisme",
        "Gestion hôtelière",
        "Techniques de cuisine et service",
        "Mercatique hôtelière",
      ],
    },
  ],
  "tech-stav": [
    {
      id: "tech-stav-gra",
      name: "Gestion des ressources et de l'alimentation",
      color: "svt",
      topics: [
        "Écosystèmes et biodiversité",
        "Production agricole",
        "Enjeux de l'alimentation mondiale",
        "Énergies et environnement",
      ],
    },
  ],
};

/** Programmes BTS — 2ᵉ année (`bts-*` = code du BTS) */
export const SUBJECTS_BY_BTS = {
  "bts-mco": [
    {
      id: "bts-mco-dcu",
      name: "Développement de l'unité commerciale",
      color: "geo",
      topics: [
        "Étude de zone de chalandise",
        "Merchandising (e-commerce et physique)",
        "Animation commerciale",
        "Suivi des ventes",
      ],
    },
    {
      id: "bts-mco-go",
      name: "Gestion opérationnelle",
      color: "hist",
      topics: [
        "Seuil de rentabilité",
        "Gestion des stocks",
        "Analyse du compte de résultat",
        "Plan de trésorerie",
        "Budget d'investissement",
      ],
    },
    {
      id: "bts-mco-mec",
      name: "Management de l'équipe commerciale",
      color: "geo",
      topics: [
        "Recrutement",
        "Animation d'équipe",
        "Évaluation des performances",
        "Conduite de réunion",
      ],
    },
  ],
  "bts-ndrc": [
    {
      id: "bts-ndrc-rcnv",
      name: "Relation client et négociation-vente",
      color: "geo",
      topics: [
        "Prospection ciblée",
        "Entretien de vente",
        "Stratégie de fidélisation",
        "Négociation B2B",
      ],
    },
    {
      id: "bts-ndrc-rcd",
      name: "Relation client à distance et digitalisation",
      color: "tech",
      topics: [
        "Social selling (LinkedIn / Insta)",
        "Gestion de la e-réputation",
        "Analyse de trafic web",
        "Campagnes d'e-mailing",
      ],
    },
  ],
  "bts-cg": [
    {
      id: "bts-cg-cpif",
      name: "Contrôle et production de l'information financière",
      color: "hist",
      topics: [
        "Opérations de clôture",
        "Établissement du bilan",
        "État de rapprochement bancaire",
        "Affectation du résultat",
      ],
    },
    {
      id: "bts-cg-gf",
      name: "Gestion fiscale et relations avec l'administration",
      color: "hist",
      topics: [
        "Déclaration de TVA",
        "Impôt sur les sociétés (IS)",
        "Impôt sur le revenu (IR)",
        "Taxes assises sur les salaires",
      ],
    },
    {
      id: "bts-cg-cga",
      name: "Contrôle de gestion et analyse financière",
      color: "math",
      topics: [
        "Calcul des coûts (complet / partiel)",
        "Analyse des écarts",
        "Tableaux de bord",
        "Analyse de la rentabilité",
      ],
    },
  ],
  "bts-sio": [
    {
      id: "bts-sio-slam",
      name: "Solutions logicielles et applications (SLAM)",
      color: "tech",
      topics: [
        "Programmation orientée objet (POO)",
        "SQL et bases de données",
        "Gestion de projet (Agile / Git)",
        "Tests unitaires",
      ],
    },
    {
      id: "bts-sio-sisr",
      name: "Solutions d'infrastructure, systèmes et réseaux (SISR)",
      color: "tech",
      topics: [
        "Routage et commutation (VLAN)",
        "Sécurité informatique (pare-feu / VPN)",
        "Virtualisation",
        "Administration système (Linux / Windows Server)",
      ],
    },
  ],
  "bts-comm": [
    {
      id: "bts-comm-cra",
      name: "Conseil et relation annonceur",
      color: "geo",
      topics: [
        "Brief annonceur",
        "Veille stratégique",
        "Stratégie de communication",
        "Devis et facturation",
      ],
    },
    {
      id: "bts-comm-ccc",
      name: "Cultures de la communication",
      color: "fr",
      topics: [
        "Analyse sémiologique",
        "Théories de l'information",
        "Publicité et société",
        "Analyse de l'image",
      ],
    },
  ],
  "bts-gpme": [
    {
      id: "bts-gpme-grcf",
      name: "Gérer les relations avec les clients et les fournisseurs",
      color: "geo",
      topics: [
        "Administration des ventes",
        "Gestion du risque client",
        "Choix des fournisseurs",
        "Suivi des achats",
      ],
    },
    {
      id: "bts-gpme-sfp",
      name: "Soutien au fonctionnement et au développement de la PME",
      color: "hist",
      topics: [
        "Gestion des RH",
        "Communication interne",
        "Organisation du travail",
        "Amélioration du système d'information",
      ],
    },
  ],
  "bts-ci": [
    {
      id: "bts-ci-eve",
      name: "Étude et veille commerciale internationale",
      color: "geo",
      topics: [
        "Diagnostic export",
        "Sélection des marchés étrangers",
        "Veille concurrentielle internationale",
      ],
    },
    {
      id: "bts-ci-vex",
      name: "Vente à l'export",
      color: "geo",
      topics: [
        "Incoterms 2020",
        "Calcul de prix export",
        "Techniques de paiement international (crédit documentaire)",
      ],
    },
  ],
};

export const BTS_SPECIALIZATION_GROUPS = [
  {
    groupLabel: "BTS — 2ᵉ année",
    options: [
      { id: "bts-mco", label: "BTS MCO (Management commercial opérationnel)" },
      { id: "bts-ndrc", label: "BTS NDRC (Négociation et digitalisation de la relation client)" },
      { id: "bts-cg", label: "BTS CG (Comptabilité et gestion)" },
      { id: "bts-sio", label: "BTS SIO (Services informatiques aux organisations)" },
      { id: "bts-comm", label: "BTS Communication" },
      { id: "bts-gpme", label: "BTS GPME (Gestion de la PME)" },
      { id: "bts-ci", label: "BTS Commerce international (CI)" },
    ],
  },
];

/**
 * Spécialités (générale) et séries (technologique) pour le sélecteur Terminale.
 * Les `id` sont stables pour le filtrage des matières plus tard.
 */
export const TERMINALE_SPECIALIZATION_GROUPS = [
  {
    groupLabel: "Terminale générale — Spécialités",
    options: [
      { id: "gen-math", label: "Mathématiques" },
      { id: "gen-pc", label: "Physique-chimie" },
      { id: "gen-svt", label: "SVT (Sciences de la Vie et de la Terre)" },
      { id: "gen-ses", label: "SES (Sciences Économiques et Sociales)" },
      {
        id: "gen-hggsp",
        label: "HGGSP (Histoire-géo, Géopolitique et Sciences Politiques)",
      },
      {
        id: "gen-hlp",
        label: "HLP (Humanités, Littérature et Philosophie)",
      },
      {
        id: "gen-llcer",
        label: "LLCER (Langues, Littératures et Cultures Étrangères)",
      },
      {
        id: "gen-nsi",
        label: "NSI (Numérique et Sciences Informatiques)",
      },
      { id: "gen-si", label: "SI (Sciences de l'Ingénieur)" },
      {
        id: "gen-bio-eco",
        label: "Biologie-Écologie (lycées agricoles uniquement)",
      },
    ],
  },
  {
    groupLabel: "Terminale technologique — Séries",
    options: [
      { id: "tech-stmg", label: "STMG (Management et Gestion)" },
      { id: "tech-sti2d", label: "STI2D (Industrie et Développement Durable)" },
      { id: "tech-st2s", label: "ST2S (Santé et Social)" },
      { id: "tech-stl", label: "STL (Laboratoire)" },
      { id: "tech-std2a", label: "STD2A (Design et Arts Appliqués)" },
      { id: "tech-sthr", label: "STHR (Hôtellerie et Restauration)" },
      { id: "tech-stav", label: "STAV (Agronomie et Vivant)" },
    ],
  },
];

export function getSubjectsForClass(classId, specializationId = "") {
  if (classId === "3e") return SUBJECTS_3E;
  if (classId === "term") {
    if (!specializationId) return [];
    if (specializationId.startsWith("tech-")) {
      return SUBJECTS_BY_TERM_TECH[specializationId] ?? [];
    }
    return SUBJECTS_BY_TERM_SPEC[specializationId] ?? [];
  }
  if (classId === "bts2") {
    if (!specializationId) return [];
    return SUBJECTS_BY_BTS[specializationId] ?? [];
  }
  return [];
}
