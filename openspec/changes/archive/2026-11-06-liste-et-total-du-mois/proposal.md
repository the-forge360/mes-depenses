# Proposition — Liste et total du mois

## Why

Le gérant peut enregistrer des dépenses, mais il ne les revoit nulle part : l'accueil n'affiche qu'un bouton. Or le but de l'app (PRD §1 et §8) est qu'il connaisse **son total du mois en un coup d'œil, sans calcul**. Cette tranche rend visibles les dépenses déjà saisies et donne ce total, mois par mois.

## What Changes

- **Accueil `/`** enrichi, de haut en bas :
  - **filtre du mois** : libellé du mois (« novembre 2026 ») entouré de deux boutons « mois précédent » et « mois suivant » ; le mois en cours est affiché par défaut et on ne peut pas avancer au-delà ;
  - **total du mois** en gros caractères, au format « 1 250 000 FCFA » ;
  - gros bouton **« + Ajouter une dépense »** (inchangé) ;
  - **liste des dépenses du mois**, la plus récente en haut : date, catégorie, description (si présente) et montant ;
  - message quand le mois ne contient aucune dépense, écran de chargement et message d'erreur avec « Réessayer ».
- **Mois dans l'adresse** (`/?mois=2026-11`, ARCHITECTURE §4) : un rafraîchissement ou un retour arrière garde le mois choisi ; une valeur invalide ou future ramène au mois en cours.
- **Lecture des dépenses** : une seule requête par mois (du 1er jour inclus au 1er jour du mois suivant exclu), le total étant calculé dans l'app (ARCHITECTURE §7).
- **Fonctions pures testées** : bornes d'un mois, mois précédent/suivant, lecture du paramètre `mois`, total, format des montants et des dates en français.
- Le bandeau « Dépense enregistrée » est conservé ; après un ajout, la nouvelle dépense apparaît dans la liste et dans le total.

Hors périmètre (changements suivants) : graphique des 3 catégories, modification et suppression d'une dépense (`/depenses/:id`) — les lignes de la liste ne sont donc pas encore cliquables —, affichage immédiat avant la réponse du serveur (« optimiste ») et fonctionnement hors ligne (V1), comparaison avec le mois précédent (V1).

## Capabilities

### New Capabilities
_Aucune._

### Modified Capabilities
- `depenses` : ajout de la consultation — liste des dépenses du mois choisi, total du mois, choix du mois conservé dans l'adresse, format des montants et des dates. Les exigences existantes (ajout, validation, enregistrement) ne changent pas.

## Impact

- **Code** : `src/ecrans/Accueil.tsx` réécrit ; nouveaux composants dans `src/composants/` (filtre du mois, total, liste) ; nouveaux modules dans `src/lib/` (calculs sur les mois, format) et une fonction de lecture dans `src/lib/depenses-api.ts`, avec leurs tests Vitest.
- **Base** : aucune modification. La table `depenses`, son index `(entreprise_id, date)` et sa politique RLS couvrent déjà la lecture.
- **Dépendances** : aucune nouvelle (`Intl` natif pour le format).
