# Design — Graphique des catégories

## Context

L'accueil charge déjà les dépenses du mois choisi avec TanStack Query (clé `['depenses', entrepriseId, mois]`) et en calcule le total avec `calculerTotal` (`src/lib/format.ts`). `CATEGORIES` (`src/lib/depense.ts`) donne l'ordre et les libellés des trois catégories. ARCHITECTURE §2 prévoit des barres horizontales en CSS, sans librairie ; §7 prévoit que total et graphique soient calculés dans l'app à partir de la même liste. Motivation : voir `proposal.md`. Comportements : voir `specs/depenses/spec.md`.

## Goals / Non-Goals

**Goals :**
- Un calcul pur et testé des totaux par catégorie, réutilisable plus tard pour la comparaison avec le mois précédent (V1) et les budgets (V2).

**Non-Goals :**
- Animation des barres, couleurs différentes par catégorie, interaction (toucher une barre pour filtrer la liste).

## Decisions

### 1. `totauxParCategorie(depenses)` dans un nouveau module `src/lib/categories.ts`
Renvoie toujours trois entrées, dans l'ordre de `CATEGORIES` : `{ categorie, libelle, montant, part }`, où `part` est un nombre entre 0 et 1 (`montant / total`, 0 si le total est nul).
- Module dédié plutôt que `format.ts` : ce n'est pas du formatage, et la fonction grossira avec la V1 (mois précédent).
- `formaterPart(part)` dans `src/lib/format.ts` : `Math.round(part * 100) + ' %'`, mais « < 1 % » si la part est non nulle et s'arrondit à 0. L'espace avant « % » est insécable (règle typographique française), comme celle avant « FCFA ».
- Les pourcentages arrondis peuvent ne pas totaliser exactement 100 % (par exemple 33 + 33 + 33). C'est accepté : chaque part est juste à l'arrondi près, et corriger artificiellement l'une d'elles serait plus trompeur.

### 2. Largeur des barres = part du total
`style={{ width: `${part * 100}%` }}` sur une piste grise pleine largeur. Une part de 100 % remplit la piste, ce qui rend la comparaison visuelle honnête (les longueurs se lisent comme des proportions du total).
- *Alternative écartée* : barres relatives à la plus grande catégorie (la plus grande toujours pleine). Plus lisible quand toutes les parts sont faibles, mais avec trois catégories l'une dépasse toujours 33 % ; et les longueurs ne correspondraient plus aux pourcentages affichés.
- Une part non nulle mais minuscule reçoit une largeur minimale de 2 px pour rester visible ; une part nulle n'a pas de barre (spec).

### 3. Composant `src/composants/GraphiqueCategories.tsx`
Reçoit la liste des dépenses du mois, appelle `totauxParCategorie`, et rend une liste `<ul aria-label="Dépenses par catégorie">`. Chaque `<li>` contient une ligne de texte (libellé à gauche ; montant et part à droite, en chiffres tabulaires) puis la piste et la barre, marquées `aria-hidden` : le lecteur d'écran lit le texte, pas les barres. Une seule couleur (`bg-primary`) : la comparaison se fait par la longueur, et les libellés sont écrits.

### 4. Place dans l'accueil
Ordre : en-tête, bandeau, filtre du mois, total, **graphique**, bouton « + Ajouter une dépense », liste. Le graphique n'est rendu que si la requête a réussi **et** que la liste n'est pas vide ; il réutilise `depenses.data`, donc se met à jour avec la liste après un ajout (invalidation `['depenses']` existante). Hauteur estimée : environ 150 px pour trois barres ; à 360 × 740 px, le bouton d'ajout reste visible sans défiler.

## Risks / Trade-offs

- [Le bouton d'ajout descend d'environ 150 px] → Il reste dans le premier écran sur un téléphone courant ; à vérifier à 360 × 740 px (tâches). Si ce n'est pas le cas, le graphique passera sous le bouton.
- [Une seule couleur pour les trois barres] → Les libellés sont toujours écrits à côté ; des couleurs par catégorie pourront venir avec la comparaison V1, où elles serviront à distinguer les mois.
