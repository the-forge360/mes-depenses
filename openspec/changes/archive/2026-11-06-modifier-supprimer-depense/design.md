# Design — Modifier et supprimer une dépense

## Context

L'ajout passe par `FormulaireDepense` (état local + Zod, validation à l'envoi), `NouvelleDepense` (mutation TanStack Query, retour à `/?mois=…` avec un message) et `ajouterDepense` (`src/lib/depenses-api.ts`, client Supabase passé en paramètre pour les tests). L'accueil lit la clé `['depenses', entrepriseId, mois]` ; invalider `['depenses']` rafraîchit liste, total et graphique. La politique RLS de `depenses` est `for all` (lecture, ajout, modification, suppression pour les membres). `modifie_le` a une valeur par défaut `now()` mais rien ne la met à jour. supabase-js 2.119 réessaie seul les lectures (GET) en échec, pas les écritures. Motivation : voir `proposal.md`. Comportements : voir `specs/depenses/spec.md`.

## Goals / Non-Goals

**Goals :**
- Réutiliser le formulaire de l'ajout tel quel, avec des valeurs initiales.
- Comportements d'erreur explicites : introuvable, échec de lecture, d'enregistrement et de suppression.

**Non-Goals :**
- Détection des conflits entre deux appareils qui modifient la même dépense (« le dernier enregistrement gagne »).
- Alerte « modifications non enregistrées » en quittant l'écran.

## Decisions

### 1. Trois fonctions d'accès dans `src/lib/depenses-api.ts`
- `lireDepense(client, id)` : `select('id, date, montant, categorie, description').eq('id', id).maybeSingle()` → la dépense ou `null`. La RLS rend une dépense d'une autre entreprise invisible : elle donne aussi `null`, donc le même message que « introuvable », sans rien révéler (spec).
- `modifierDepense(client, id, depense)` : `update({ date, montant, categorie, description }).eq('id', id).select('id')`. Zéro ligne renvoyée = dépense supprimée entre-temps ou invisible → erreur `DepenseIntrouvable` (classe dédiée), affichée comme « introuvable ». Un `update` ne recrée jamais de ligne (spec « supprimée entre-temps »).
- `supprimerDepense(client, id)` : `delete().eq('id', id)`. Zéro ligne supprimée est traité comme un succès : la dépense n'existe plus, ce qui est le résultat voulu (un second essai après une réponse perdue ne doit pas afficher d'erreur).
- `entreprise_id`, `cree_par` et `cree_le` ne sont jamais envoyés à la modification.

### 2. `modifie_le` par un trigger en base
Nouvelle migration `supabase/migrations/20261106010000_modifie_le.sql` : fonction `public.avant_modification_depense()` (`language plpgsql`, `set search_path = ''`, `security invoker`) déclenchée `before update` sur `depenses`, qui fixe `new.modifie_le := now()` et remet `new.cree_le := old.cree_le` et `new.cree_par := old.cree_par`.
- *Pourquoi en base* : l'horloge du téléphone n'est pas fiable, et la règle s'applique même à une écriture directe avec la clé publique.
- Une fonction qui renvoie `trigger` n'est pas appelable via `/rpc` ; `search_path = ''` évite l'alerte « search_path mutable » du Security Advisor.
- Exécution sur le projet Supabase via l'API de gestion, comme la migration initiale ; retour arrière : `drop trigger … ; drop function …`.

### 3. Formulaire réutilisé avec des valeurs initiales
`FormulaireDepense` reçoit une prop facultative `valeursInitiales?: SaisieDepense` ; sans elle, comportement actuel (date du jour). Le montant initial est `String(montant)` (« 1250000 »), la description `?? ''`. Le `max` de la date reste « aujourd'hui ». Le libellé du bouton reste « Enregistrer ».

### 4. Écran `src/ecrans/ModifierDepense.tsx`, route `/depenses/:id`
- Lecture : `useQuery(['depense', id], lireDepense)` avec `retry: false` (supabase-js réessaie déjà, voir le changement précédent). États : « Chargement… », erreur de lecture avec « Réessayer », introuvable (`null`) avec « Retour à l'accueil », sinon formulaire.
- Le formulaire n'est monté qu'une fois la dépense chargée (`key={depense.id}`), pour que les valeurs initiales soient prises en compte par l'état local.
- Modification : `useMutation(modifierDepense)`. Succès → invalider `['depenses']`, retirer `['depense', id]` du cache, naviguer vers `/?mois=<mois de la NOUVELLE date>` avec `{ message: 'Dépense modifiée' }`. Erreur `DepenseIntrouvable` → écran introuvable ; autre erreur → message sous le formulaire, saisie conservée.
- Lien « ← Retour » vers `/?mois=<mois de la dépense>` : on revient sur le mois d'où l'on vient dans le cas normal.
- Route ajoutée sous `RouteConnectee` dans `src/main.tsx`.

### 5. Suppression avec `AlertDialog` (shadcn/ui, Base UI)
- `npx shadcn@latest add alert-dialog` ajoute `src/components/ui/alert-dialog.tsx` (dépendances : `@base-ui/react` et `cn`, déjà installés). Le composant gère le focus, Échap et l'annonce aux lecteurs d'écran.
- Bouton « Supprimer cette dépense » (`variant="destructive"`) sous le formulaire, séparé du bouton « Enregistrer » pour éviter un appui par erreur.
- Boîte contrôlée (`open` en état local) : titre « Voulez-vous vraiment supprimer cette dépense ? », rappel de la dépense (date, catégorie, montant), boutons « Annuler » et « Supprimer ». Pendant la suppression, « Supprimer » affiche « Suppression… » et est désactivé ; la boîte ne se ferme pas toute seule.
- Succès → invalider `['depenses']`, retirer `['depense', id]`, naviguer vers `/?mois=<mois de la dépense>` avec `{ message: 'Dépense supprimée' }`. Échec → fermer la boîte, afficher le message d'échec sur l'écran, saisie conservée.

### 6. Lignes de la liste en liens
Dans `ListeDepenses`, le contenu de chaque `<li>` devient un `<Link to={`/depenses/${id}`}>` occupant toute la ligne (zone de toucher ≥ 48 px), avec un chevron « › » décoratif et un `aria-label` du type « 6 nov., Fixe, 15 000 FCFA — modifier ». Survol et focus visibles.

## Risks / Trade-offs

- [Deux appareils modifient la même dépense] → La dernière modification l'emporte, sans avertissement. Acceptable avec un seul gérant ; à revoir avec l'invitation d'un collaborateur (V1).
- [Suppression définitive, sans corbeille] → La boîte de confirmation rappelle la dépense concernée ; pas de sauvegarde avant l'export CSV (V1, ARCHITECTURE §12).
- [Migration à exécuter avant la mise en ligne] → Sans le trigger, l'app fonctionne mais `modifie_le` reste figé ; la migration est exécutée dans les tâches, avant les tests dans le navigateur.
