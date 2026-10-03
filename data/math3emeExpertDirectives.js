/**
 * Base « haute précision » — Mathématiques 3ᵉ.
 * Chaque entrée enrichit la requête Gemini (contenu unique à respecter).
 * Structure pensée pour étendre à ~800 fiches (nouvelles entrées dans le tableau).
 */

export const MATH_3E_EXPERT_DIRECTIVES = [
  {
    id: "pythagore",
    topicLabel: "Théorème de Pythagore",
    directive: `Structure forcée : 1. Condition (Triangle rectangle). 2. L'égalité. 3. Le calcul.

Exemple imposé : Une échelle de 5 m contre un mur.

Point critique : Montrer l'étape x = √… et préciser d'arrondir au millimètre si besoin.`,
  },
  {
    id: "thalès",
    topicLabel: "Théorème de Thalès",
    directive: `Focus : La rédaction « type Brevet ». Citer explicitement les points alignés et les droites parallèles.

Schéma textuel : Utiliser des tirets pour montrer les rapports Petit côté / Grand côté.

Astuce : Expliquer le produit en croix pour trouver la longueur manquante.`,
  },
  {
    id: "trigo",
    topicLabel: "Trigonométrie (SOH CAH TOA)",
    directive: `Méthode : Apprendre à l'élève à « flécher » le triangle (Hypoténuse, Opposé, Adjacent) par rapport à l'angle choisi.

Exemple : Calculer un angle avec la calculatrice (2nd + cos / Arccos).

Rappel : Vérifier que la calculatrice est en mode DEGRÉ.`,
  },
  {
    id: "calcul-litteral",
    topicLabel: "Calcul littéral (identités)",
    directive: `Focus : La double distributivité avec des flèches textuelles sur (a+b)(c+d).

Priorité : Développer (x-3)² pour montrer que le résultat est x² - 6x + 9 (et pas x² - 9).

Exercice flash : Factoriser avec un facteur commun évident.`,
  },
  {
    id: "arithmetique",
    topicLabel: "Arithmétique (nombres premiers)",
    directive: `Méthode : Décomposition en facteurs premiers (barre verticale).

Exemple : Rendre la fraction 48/72 irréductible.

Interdiction : Ne pas donner le résultat direct — montrer les divisions successives par 2, 3, 5…`,
  },
  {
    id: "fonctions-affines",
    topicLabel: "Fonctions affines et linéaires",
    directive: `Visuel : Décrire l'allure de la droite (passe par l'origine ou non).

Calcul : Montrer comment trouver le coefficient a avec (yB - yA) / (xB - xA).

Exemple concret : Un forfait mobile (prix fixe + prix au Go).`,
  },
  {
    id: "equations-produits",
    topicLabel: "Équations-produits",
    directive: `Règle d'or : « Si un produit de facteurs est nul, alors au moins un des facteurs est nul ».

Exemple : Résoudre (2x + 4)(x - 5) = 0.

Rédaction : Séparer clairement les deux solutions finales.`,
  },
  {
    id: "probabilites",
    topicLabel: "Probabilités",
    directive: `Structure : Arbre de probabilité à deux niveaux (ex. : tirer deux boules).

Règle : « OU » = addition des probabilités ; « ET » = multiplication.

Vérification : La somme des probabilités des branches finales doit faire 1.`,
  },
];

export function getMath3eDirectiveByTopic(topicLabel) {
  const row = MATH_3E_EXPERT_DIRECTIVES.find((d) => d.topicLabel === topicLabel);
  return row ?? null;
}
