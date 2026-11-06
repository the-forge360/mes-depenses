# Proposition — Graphique des catégories

## Why

Le total du mois dit combien le gérant a dépensé, mais pas **où**. Le PRD (§8) attend qu'après un mois il ait « repéré au moins 1 dépense à réduire grâce au graphique ». Comparer les trois catégories (Abonnement, Fixe, Salaires) d'un coup d'œil est le moyen le plus direct d'y arriver.

## What Changes

- **Graphique sur l'accueil**, juste sous le total du mois : trois barres horizontales, toujours dans le même ordre (Abonnement, Fixe, Salaires). Chaque barre affiche le libellé de la catégorie, son total au format « 150 000 FCFA » et sa part du total du mois en pourcentage ; sa longueur est proportionnelle à cette part.
- Le graphique suit le **mois choisi** et se met à jour après un ajout, comme la liste et le total.
- Il est **masqué** quand le mois ne contient aucune dépense, pendant le chargement et en cas d'erreur de lecture.
- Barres en CSS, sans librairie de graphique (ARCHITECTURE §2), calculées à partir de la liste du mois déjà chargée (ARCHITECTURE §7) : aucune requête supplémentaire.
- Fonction pure testée qui calcule le total et la part de chaque catégorie.

Hors périmètre : comparaison avec le mois précédent (V1), budget par catégorie (V2), filtrage de la liste en touchant une barre.

## Capabilities

### New Capabilities
_Aucune._

### Modified Capabilities
- `depenses` : ajout du graphique des totaux par catégorie pour le mois choisi. Les exigences existantes ne changent pas.

## Impact

- **Code** : nouveau composant `src/composants/GraphiqueCategories.tsx`, nouvelle fonction de calcul dans `src/lib/format.ts` ou un module dédié, avec ses tests ; `src/ecrans/Accueil.tsx` affiche le graphique.
- **Base** : aucune modification.
- **Dépendances** : aucune nouvelle.
