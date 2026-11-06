# Tâches — Graphique des catégories

## 1. Calculs

- [x] 1.1 Créer `src/lib/categories.ts` avec `totauxParCategorie(depenses)` (design §1). Vérification : `src/lib/categories.test.ts` couvre l'exemple de la spec (10 000 / 40 000 / 200 000 → parts 0,04 / 0,16 / 0,8, dans l'ordre Abonnement, Fixe, Salaires), une catégorie absente (montant 0, part 0, entrée présente) et une liste vide (trois entrées à 0, aucune division par zéro) ; `npm test` passe.
- [x] 1.2 Ajouter `formaterPart(part)` à `src/lib/format.ts` (design §1). Vérification : `src/lib/format.test.ts`, espaces normalisés, vérifie « 80 % », « 0 % » pour 0, « < 1 % » pour 0,004, « 1 % » pour 0,005 et « 100 % » pour 1 ; `npm test` passe.

## 2. Interface

- [x] 2.1 Créer `src/composants/GraphiqueCategories.tsx` (design §2–3). Vérification manuelle : trois lignes dans l'ordre Abonnement, Fixe, Salaires, avec libellé, montant et part ; longueurs proportionnelles aux parts ; barre invisible pour une part nulle, visible (≥ 2 px) pour une part minuscule ; barres en `aria-hidden`, texte lisible par l'arbre d'accessibilité.
- [x] 2.2 Afficher le graphique dans `src/ecrans/Accueil.tsx` entre le total et le bouton d'ajout, uniquement quand la lecture a réussi et que la liste n'est pas vide (design §4). Vérification : `npm run build` passe ; vérification manuelle des scénarios « Graphique lié au mois et à son état » de la spec (changement de mois, après un ajout, mois vide, chargement et erreur).

## 3. Vérifications d'ensemble

- [x] 3.1 `npm run build`, `npm test` et `npm run lint` passent sans erreur.
- [x] 3.2 Parcours dans le navigateur avec des dépenses de test reproduisant l'exemple de la spec (Salaires 150 000 + 50 000, Fixe 40 000, Abonnement 10 000) : le graphique affiche 4 %, 16 % et 80 % avec les bons montants et les bonnes longueurs ; un ajout Fixe de 5 000 met à jour la barre sans rafraîchir. Les données de test sont supprimées ensuite.
- [x] 3.3 À 360 × 740 px : pas de défilement horizontal, montants et parts lisibles, et le bouton « + Ajouter une dépense » visible sans défiler quand le bandeau « Dépense enregistrée » n'est pas affiché.

## Workflow follow-up

- Archiver le changement (`/opsx:archive`) une fois les vérifications faites, pour fusionner les nouvelles exigences dans la spec principale `depenses`.
