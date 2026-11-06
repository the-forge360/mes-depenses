# Tâches — Modifier et supprimer une dépense

## 1. Base de données

- [x] 1.1 Écrire `supabase/migrations/20261106010000_modifie_le.sql` (trigger `before update` sur `depenses`, design §2) et l'exécuter sur le projet Supabase. Vérification : une modification directe en SQL change `modifie_le` sans changer `cree_le` ni `cree_par` ; le Security Advisor ne signale aucune nouvelle alerte.

## 2. Accès aux données

- [x] 2.1 Ajouter `lireDepense`, `modifierDepense` (avec l'erreur `DepenseIntrouvable`) et `supprimerDepense` dans `src/lib/depenses-api.ts` (design §1). Vérification : `src/lib/depenses-api.test.ts`, avec un client simulé, couvre la lecture (dépense trouvée, `null` si absente, erreur propagée), la modification (colonnes envoyées sans `entreprise_id` ni `cree_par`, filtre sur `id`, `DepenseIntrouvable` si zéro ligne, erreur propagée) et la suppression (filtre sur `id`, succès même sans ligne supprimée, erreur propagée) ; `npm test` passe.

## 3. Interface

- [x] 3.1 Ajouter la prop `valeursInitiales` à `src/composants/FormulaireDepense.tsx` (design §3). Vérification : `npm run build` passe et l'écran d'ajout est inchangé (date du jour, champs vides).
- [x] 3.2 Ajouter le composant shadcn `alert-dialog` (`npx shadcn@latest add alert-dialog`). Vérification : `src/components/ui/alert-dialog.tsx` existe et `npm run build` passe.
- [x] 3.3 Créer `src/ecrans/ModifierDepense.tsx` et la route `/depenses/:id` dans `src/main.tsx` (design §4–5). Vérification manuelle : scénarios « Formulaire de modification pré-rempli », « Enregistrement d'une modification », « Suppression avec confirmation » et « Dépense introuvable ou illisible » de la spec.
- [x] 3.4 Transformer les lignes de `src/composants/ListeDepenses.tsx` en liens vers `/depenses/:id` (design §6). Vérification manuelle : scénarios « Ouverture d'une dépense depuis la liste » (toucher et clavier) ; nom accessible de chaque lien dans l'arbre d'accessibilité.

## 4. Vérifications d'ensemble

- [x] 4.1 `npm run build`, `npm test` et `npm run lint` passent sans erreur.
- [x] 4.2 Parcours dans le navigateur avec des dépenses de test : modification du montant (liste, total et graphique à jour), changement de mois par la date, échec réseau à l'enregistrement et à la suppression (saisie conservée), suppression annulée puis confirmée, identifiant inconnu. Les données de test sont supprimées ensuite.
- [x] 4.3 Isolation : un second compte qui ouvre `/depenses/<id de la première entreprise>` voit « Cette dépense n'existe pas ou a été supprimée. », et ses `update` / `delete` directs sur cette dépense ne touchent aucune ligne ; la base refuse une modification à montant 0 ou à catégorie « transport ».
- [x] 4.4 À 360 × 740 px : formulaire de modification et boîte de confirmation lisibles et utilisables au pouce, sans défilement horizontal.

## Workflow follow-up

- Archiver le changement (`/opsx:archive`) une fois les vérifications faites, pour fusionner les nouvelles exigences dans la spec principale `depenses`.
