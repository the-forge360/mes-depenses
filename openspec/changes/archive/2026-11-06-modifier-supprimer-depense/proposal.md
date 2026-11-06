# Proposition — Modifier et supprimer une dépense

## Why

Une faute de frappe sur un montant ou une mauvaise catégorie fausse le total et le graphique du mois, et le gérant n'a aucun moyen de la corriger. Le PRD (§4 et §7, MVP) prévoit que chaque dépense de la liste puisse être modifiée ou supprimée, avec une confirmation avant suppression. C'est la dernière fonction du MVP.

## What Changes

- **Lignes de la liste cliquables** : toucher une dépense ouvre l'écran de modification `/depenses/:id` (ARCHITECTURE §4).
- **Écran de modification** : le même formulaire que l'ajout, pré-rempli avec la dépense ; mêmes règles de validation ; bouton « Enregistrer ». Après succès, retour à l'accueil sur le mois de la dépense avec le message « Dépense modifiée ».
- **Suppression** depuis cet écran : bouton « Supprimer cette dépense », puis boîte de confirmation « Voulez-vous vraiment supprimer cette dépense ? » (« Annuler » / « Supprimer »). Après succès, retour à l'accueil sur le mois de la dépense avec le message « Dépense supprimée ».
- **Cas d'erreur** : dépense introuvable (lien faux, déjà supprimée, ou d'une autre entreprise), échec réseau à la lecture, à l'enregistrement ou à la suppression — chaque fois un message en français, sans perte de saisie.
- **Date de modification** : la colonne `modifie_le` est mise à jour par la base à chaque modification (nouvelle migration SQL avec un trigger).
- Ajout du composant shadcn/ui `alert-dialog` pour la confirmation.

Hors périmètre : suppression directement depuis la liste (glissement ou menu), annulation d'une suppression, historique des modifications, suppression de plusieurs dépenses à la fois.

## Capabilities

### New Capabilities
_Aucune._

### Modified Capabilities
- `depenses` : ajout de la modification et de la suppression d'une dépense, et de l'ouverture d'une dépense depuis la liste. Les exigences existantes ne changent pas.

## Impact

- **Code** : nouvel écran `src/ecrans/ModifierDepense.tsx` et route `/depenses/:id` dans `src/main.tsx` ; `FormulaireDepense` accepte des valeurs initiales ; lignes de `ListeDepenses` transformées en liens ; nouvelles fonctions `lireDepense`, `modifierDepense`, `supprimerDepense` dans `src/lib/depenses-api.ts`, avec leurs tests ; composant `src/components/ui/alert-dialog.tsx`.
- **Base** : nouvelle migration `supabase/migrations/20261106010000_modifie_le.sql` (trigger sur `depenses`), à exécuter sur le projet Supabase. La politique RLS existante (`for all`) couvre déjà la modification et la suppression.
- **Dépendances** : aucune nouvelle (`@base-ui/react` est déjà installé).
