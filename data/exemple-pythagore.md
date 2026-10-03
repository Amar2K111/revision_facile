# Théorème de Pythagore — Brevet 2027 · Maths

## L'essentiel

Dans un triangle **rectangle**, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.

$$a^2 + b^2 = c^2$$

- **c** = hypoténuse (le plus grand côté, face à l'angle droit)
- **a** et **b** = les deux côtés de l'angle droit

> **Astuce :** repère toujours l'angle droit avant de nommer les côtés. L'hypoténuse est toujours en face.

---

## Programme dense

### Cas direct — trouver l'hypoténuse

Si tu connais les deux côtés de l'angle droit :

1. Identifie l'angle droit et l'hypoténuse
2. Applique $c^2 = a^2 + b^2$
3. Calcule $c = \sqrt{a^2 + b^2}$

**Exemple :** triangle rectangle avec $a = 3$ cm et $b = 4$ cm.

$c^2 = 3^2 + 4^2 = 9 + 16 = 25$ → $c = 5$ cm

### Cas inverse — trouver un côté de l'angle droit

Si tu connais l'hypoténuse et un autre côté :

$$a^2 = c^2 - b^2$$

**Exemple :** $c = 13$ cm et $b = 5$ cm.

$a^2 = 13^2 - 5^2 = 169 - 25 = 144$ → $a = 12$ cm

### Réciproque du théorème de Pythagore

Si dans un triangle $a^2 + b^2 = c^2$, alors le triangle est **rectangle** en $C$ (angle opposé à $c$).

**Méthode au Brevet :**
1. Calcule $a^2 + b^2$ et $c^2$
2. Compare les résultats
3. Conclus : triangle rectangle ou non rectangle

---

## Astuces de mémorisation

- **Triplet pythagoricien classique :** 3 — 4 — 5 (et ses multiples : 6-8-10, 9-12-15…)
- **Autres triplets utiles :** 5-12-13, 8-15-17
- **Vérification :** l'hypoténuse est **toujours** le côté le plus long
- **Rédaction type :** « D'après le théorème de Pythagore appliqué au triangle rectangle $ABC$ en $A$… »

---

## Pièges fréquents au Brevet

- Confondre hypoténuse et côté de l'angle droit
- Oublier la racine carrée à la fin
- Appliquer Pythagore dans un triangle **non rectangle**
- Arrondir trop tôt (garde la valeur exacte sous la forme $\sqrt{...}$ si demandé)
