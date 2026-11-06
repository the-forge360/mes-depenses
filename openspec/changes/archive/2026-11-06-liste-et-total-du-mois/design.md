# Design — Liste et total du mois

## Context

L'accueil actuel (`src/ecrans/Accueil.tsx`) n'affiche qu'un titre, le bouton « + Ajouter une dépense », le bandeau « Dépense enregistrée » (lu dans l'état de navigation puis effacé) et « Se déconnecter ». `NouvelleDepense` invalide déjà la clé TanStack Query `['depenses']` après un ajout, puis navigue vers `/`. Le contexte de session fournit `entrepriseId`. La table `depenses` a un index `(entreprise_id, date)` et une politique RLS « membres de l'entreprise » qui couvre la lecture.

Les dates sont des chaînes `AAAA-MM-JJ` (type `date`, sans heure), et « aujourd'hui » est calculé à l'heure locale (`aujourdhuiLocal`, ARCHITECTURE §3). Motivation : voir `proposal.md`. Comportements : voir `specs/depenses/spec.md`.

## Goals / Non-Goals

**Goals :**
- Fonctions pures et testées pour tout ce qui touche aux mois, au total et au format, réutilisables par le graphique (tranche suivante) et l'export (V1).
- Une seule requête par mois, mise en cache par TanStack Query.

**Non-Goals :**
- Pagination ou défilement infini : une petite entreprise n'atteint pas des centaines de dépenses par mois.
- Mise à jour optimiste et cache persistant (V1, « réseau faible »).

## Decisions

### 1. Mois représenté par une chaîne `AAAA-MM`, calculs sans `Date` en UTC
Nouveau module `src/lib/mois.ts` : `moisCourant(maintenant)`, `lireMois(parametre, maintenant)` (valeur valide et non future, sinon mois en cours), `moisPrecedent`, `moisSuivant`, `bornesDuMois(mois)` → `{ debut: '2026-11-01', finExclue: '2026-12-01' }`, `moisDeLaDate('2026-10-28')` → `'2026-10'`, `libelleMois(mois)` → « novembre 2026 ».
- Les bornes et le mois précédent/suivant sont calculés sur les nombres (année, mois), sans `toISOString()`, pour éviter tout décalage de fuseau. Les chaînes `AAAA-MM` se comparent dans l'ordre lexicographique, ce qui suffit pour refuser un mois futur.
- `libelleMois` utilise `Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })` sur `new Date(annee, mois - 1, 1)` (date locale).
- *Alternative écartée* : `date-fns`. Une dépendance pour cinq fonctions de quelques lignes n'est pas justifiée (ARCHITECTURE §2 : `Intl`, sans librairie).

### 2. Filtre de la requête : `date >= debut` et `date < finExclue`
Conforme à ARCHITECTURE §7. La borne supérieure exclue évite de calculer le dernier jour du mois (28, 29, 30 ou 31).

### 3. Lecture : `listerDepensesDuMois(client, entrepriseId, mois)` dans `src/lib/depenses-api.ts`
`select('id, date, montant, categorie, description')`, filtre `entreprise_id = entrepriseId` (explicite, même si la RLS filtre déjà : il prépare un utilisateur membre de plusieurs entreprises et utilise l'index), bornes du mois, tri `date` décroissant puis `cree_le` décroissant. Une erreur Supabase est propagée. Le client est passé en paramètre, comme pour `ajouterDepense`, pour pouvoir être simulé dans les tests.
- Type `DepenseEnregistree` = `Depense` + `id`.

### 4. Clé de cache `['depenses', entrepriseId, mois]`
Elle commence par `['depenses']` : l'invalidation déjà faite par `NouvelleDepense` rafraîchit donc la liste après un ajout, sans autre code.
- `retry: false` : supabase-js (2.119) réessaie déjà une lecture en échec réseau, 3 fois avec 1, 2 puis 4 s d'attente. Les 3 essais par défaut de TanStack Query s'y ajouteraient et l'erreur mettrait environ 35 s à s'afficher, au lieu d'environ 7 s.
- Pas de `placeholderData: keepPreviousData` : en changeant de mois, l'écran afficherait brièvement le total de l'ancien mois sous le nom du nouveau, ce qu'interdit la spec (« sans afficher un total faux »). Les mois déjà visités restent en cache et s'affichent instantanément au retour.

### 5. Mois dans l'adresse avec `useSearchParams`
- Le mois affiché = `lireMois(searchParams.get('mois'), new Date())`. Sans paramètre, l'adresse reste `/` (mois en cours).
- Les boutons précédent/suivant font `setSearchParams({ mois })` **sans** `replace` : chaque changement crée une entrée d'historique, et le retour arrière revient au mois précédent (spec).
- Une valeur invalide ou future est simplement ignorée à l'affichage ; elle n'est pas réécrite dans l'adresse (pas d'effet de bord au rendu).
- Après un ajout, `NouvelleDepense` navigue vers `/?mois=<moisDeLaDate(depense.date)>` : la dépense est visible même si elle est datée d'un mois passé.
- L'effacement du bandeau dans `Accueil` remplace l'état de navigation en **gardant** les paramètres de l'adresse (`navigate({ search: location.search }, { replace: true, state: null })`) ; aujourd'hui, `navigate('.')` les perdrait.

### 6. Format dans `src/lib/format.ts`
- `formaterMontant(1250000)` → « 1 250 000 FCFA » avec `Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })`. Le séparateur produit est une espace fine insécable (U+202F) ; on la garde, et l'espace avant « FCFA » est insécable (U+00A0), pour qu'un montant ne soit jamais coupé en fin de ligne.
- `formaterDateCourte('2026-11-06')` → « 6 nov. » avec `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })` sur une date locale construite à partir des nombres.
- `calculerTotal(depenses)` : somme des montants (entiers, pas d'arrondi).
- Les tests normalisent les espaces (U+202F, U+00A0 → espace) avant de comparer, pour ne pas dépendre de la version d'ICU.

### 7. Composants et mise en page
- `src/composants/FiltreMois.tsx` : boutons « ‹ » et « › » avec `aria-label` « Mois précédent » / « Mois suivant », au moins 44 px ; libellé du mois au centre, en `aria-live="polite"` ; « › » désactivé sur le mois en cours.
- `src/composants/ListeDepenses.tsx` : `<ul>` ; chaque `<li>` montre la date et la catégorie (avec la description en dessous si elle existe) à gauche, le montant aligné à droite en chiffres tabulaires (`tabular-nums`).
- `Accueil` : en-tête (titre + déconnexion), bandeau, filtre du mois, total en gros (`text-4xl`), bouton d'ajout, puis la liste. Le bouton d'ajout reste au-dessus de la liste pour être atteint sans défiler.
- États : chargement (« Chargement… » à la place du total et de la liste), erreur (message + « Réessayer » via `refetch`), vide (« Aucune dépense ce mois-ci. »).

## Risks / Trade-offs

- [Supabase limite une réponse à 1 000 lignes par défaut] → Hors d'atteinte pour une petite entreprise sur un mois ; à revoir si l'usage le contredit.
- [Le format exact d'`Intl` varie légèrement selon le navigateur (espace fine ou normale, « nov. »)] → Rendu correct dans tous les cas ; tests indépendants des variantes d'espaces.
- [L'utilisateur garde l'app ouverte au passage de minuit en fin de mois] → Le mois en cours est recalculé à chaque rendu ; au pire, un rafraîchissement suffit.
- [Retour à l'accueil sur le mois de la dépense plutôt que sur le mois consulté avant l'ajout] → Choix volontaire : montrer la dépense que l'on vient d'enregistrer, avec son total.
