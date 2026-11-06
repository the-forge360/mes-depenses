# Design — Ajouter une dépense

## Context

Le projet est un squelette sans fonctionnalité : Vite + React 19 + TypeScript, Tailwind 4 + shadcn/ui (seul le composant `button` est présent), vite-plugin-pwa, Vitest. `src/lib/supabase.ts` crée un client Supabase s'il trouve `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`, sinon il vaut `null`. React Router, TanStack Query et Zod sont installés mais pas encore utilisés. Il n'y a encore aucune table dans Supabase.

Les choix de fond (modèle de données, RLS, conventions en français, montants entiers, dates locales) sont fixés par `ARCHITECTURE.md` ; ce document précise uniquement comment les appliquer pour cette tranche. Motivation : voir `proposal.md`. Comportements attendus : voir `specs/`.

## Goals / Non-Goals

**Goals :**
- Poser des fondations réutilisables par les changements suivants : schéma SQL complet du MVP, routeur avec routes protégées, contexte de session, accès à l'entreprise courante.
- Garder la logique de validation et de dates dans des fonctions pures, testées avec Vitest.

**Non-Goals :**
- Mise à jour optimiste d'une liste (il n'y a pas encore de liste) et file d'attente hors ligne (V1).
- Typage généré du schéma Supabase (`supabase gen types`) : un type `Depense` écrit à la main suffit tant qu'il n'y a qu'une table utilisée.
- Mise en forme définitive de l'accueil : il sera refait avec la liste, le total et le graphique.

## Decisions

### 1. Schéma SQL dans un fichier de migration, exécuté à la main
Un fichier `supabase/migrations/20261106000000_schema_initial.sql` contient les trois tables, l'index, la RLS et la fonction `assurer_entreprise()`. On l'exécute une fois dans l'éditeur SQL de Supabase.
- *Alternative écartée* : la CLI Supabase (`supabase db push`). Elle ajoute un outil, une connexion et Docker pour le développement local, ce qui est disproportionné pour un projet à une seule personne. Le fichier reste versionné et compatible si l'on adopte la CLI plus tard.

### 2. Création de l'entreprise par une fonction SQL `security definer`
`assurer_entreprise()` renvoie l'`entreprise_id` de l'utilisateur courant (`auth.uid()`). S'il n'est membre d'aucune entreprise, elle crée « Mon entreprise » et la ligne `membres` (rôle `gerant`) dans la même transaction. L'app l'appelle par `supabase.rpc('assurer_entreprise')` juste après l'ouverture de la session.
- *Pourquoi* : avec la RLS « membres uniquement », un client ne peut ni lire l'entreprise qu'il vient d'insérer, ni s'ajouter dans `membres` sans politique d'insertion permissive (qui laisserait n'importe qui s'ajouter à n'importe quelle entreprise). Une fonction contrôlée côté serveur évite ce trou. Elle est idempotente : deux onglets qui l'appellent en même temps ne créent qu'une entreprise grâce à un verrou consultatif sur l'utilisateur (`pg_advisory_xact_lock`).
- *Alternative écartée* : un trigger sur `auth.users`. Il fonctionne aussi, mais il s'écarte de l'architecture (« l'app la crée à la première connexion ») et il est plus difficile à déboguer : une erreur dans le trigger bloque l'inscription.
- La fonction fixe `search_path = ''` et n'est exécutable que par le rôle `authenticated` (révoquée pour `anon` et `public`), conformément au Security Advisor.

### 3. Politiques RLS
- `depenses` : une politique `for all` pour les membres de l'entreprise (ARCHITECTURE §6).
- `entreprises` : lecture seule pour les membres.
- `membres` : lecture de ses propres lignes uniquement (`utilisateur_id = auth.uid()`). Cela évite une politique qui interroge `membres` depuis `membres`, ce qui provoquerait une récursion infinie.
- Aucune politique d'insertion sur `entreprises` ni `membres` : seule `assurer_entreprise()` y écrit.
- `cree_par` a pour valeur par défaut `auth.uid()`.

### 4. Session et routes protégées
Un `FournisseurSession` (contexte React) lit `supabase.auth.getSession()` au démarrage, s'abonne à `onAuthStateChange`, puis appelle `assurer_entreprise()` et expose `{ session, entrepriseId, chargement }`. Deux composants de route, `RouteConnectee` et `RoutePublique`, redirigent selon l'état de la session. Tant que l'état est inconnu, on affiche un écran de chargement : on évite ainsi d'envoyer à tort vers `/connexion` un utilisateur déjà connecté.
- Inscription sans confirmation d'e-mail : l'option « Confirm email » est désactivée dans Supabase, donc `signUp` renvoie directement une session. `onAuthStateChange` la capte comme une connexion : `assurer_entreprise()` est appelée, puis `RoutePublique` redirige vers l'accueil. Le même code sert à l'inscription et à la connexion, sans écran d'attente d'e-mail.
- Routes : `/connexion` (écran inscription/connexion, publique), `/` et `/depenses/nouvelle` (connectées). Le mode de données de React Router (`createBrowserRouter`) suffit ; pas de loaders, car TanStack Query gère les données.
- Si `supabase` vaut `null` (`.env.local` absent), l'app affiche un message explicite en français au lieu de planter.

### 5. Formulaire : état React + Zod, sans librairie de formulaire
Quatre champs ne justifient pas `react-hook-form`. L'état est local (`useState`), la validation se fait à l'envoi avec un schéma Zod `schemaDepense` dans `src/lib/depense.ts`, et les erreurs s'affichent sous chaque champ.
- Le montant est saisi dans un `<input type="text" inputMode="numeric">`, et non `type="number"` : ce dernier accepte « e » et les virgules, et il renvoie une chaîne vide pour une saisie invalide, ce qui empêche d'afficher le bon message. La chaîne est nettoyée de ses espaces puis validée par `/^\d+$/` puis `> 0`.
- La date utilise `<input type="date">` avec `max` égal à aujourd'hui. `aujourdhuiLocal()` construit `AAAA-MM-JJ` à partir de `getFullYear/getMonth/getDate`, jamais avec `toISOString()`, qui travaille en UTC.
- Catégorie : trois boutons formant un groupe de type radio (`role="radiogroup"`, `aria-checked`), au moins 48 px de haut pour le pouce.
- Description : `maxLength={100}`, vidée de ses espaces de début et de fin ; une chaîne vide est enregistrée comme `null`.
- Composants shadcn ajoutés : `input`, `label`, `textarea`.

### 6. Enregistrement idempotent
Un identifiant est généré une fois par formulaire (`crypto.randomUUID()` dans un `useState` initial). L'enregistrement est une mutation TanStack Query qui fait un `insert` dans `depenses`. Si la base répond par une violation de clé primaire (code Postgres `23505`), c'est que l'envoi précédent avait abouti : on le traite comme un succès.
- *Alternative écartée* : `upsert` avec `ignoreDuplicates`. Le résultat est équivalent, mais l'intention est moins lisible et une politique de mise à jour devient nécessaire sur certaines versions.
- Pendant l'envoi, le bouton est désactivé et affiche « Enregistrement… ». En cas de succès, on navigue vers `/` avec l'état `{ message: 'Dépense enregistrée' }`, que l'accueil affiche dans un bandeau. On invalide aussi la clé de requête `['depenses']` pour préparer la future liste.
- On attend la réponse plutôt que de revenir tout de suite à l'accueil : sans liste, il n'y a rien à afficher de façon optimiste, et un échec silencieux ferait perdre la saisie. L'envoi en arrière-plan prévu en ARCHITECTURE §8 arrivera avec la liste.

### 7. Organisation des fichiers
```
src/
  main.tsx                  routeur + QueryClientProvider + FournisseurSession
  ecrans/InscriptionConnexion.tsx
  ecrans/Accueil.tsx
  ecrans/NouvelleDepense.tsx
  composants/FormulaireDepense.tsx
  composants/ChoixCategorie.tsx
  composants/routes.tsx     RouteConnectee, RoutePublique
  lib/session.tsx           FournisseurSession, useSession
  lib/dates.ts              aujourdhuiLocal
  lib/depense.ts            CATEGORIES, schemaDepense, type Depense
  lib/depenses-api.ts       ajouterDepense
  lib/*.test.ts
supabase/migrations/20261106000000_schema_initial.sql
```
`src/App.tsx` est supprimé.

## Risks / Trade-offs

- [Sans confirmation, rien ne prouve que l'adresse appartient à l'utilisateur, et une faute de frappe crée un compte avec une adresse fausse] → Accepté pour le MVP : un seul gérant, qui crée lui-même son compte. Le mot de passe oublié arrivera avec Brevo dans un changement dédié ; d'ici là, une réinitialisation se fait depuis le tableau de bord Supabase.
- [Le fuseau de l'appareil peut être faux] → On accepte : l'architecture choisit volontairement l'heure locale. La base ne vérifie pas la date future.
- [Une dépense datée « aujourd'hui » à 23 h 59 sur un appareil, envoyée après minuit] → La date vient du formulaire, pas du serveur : la dépense garde la date choisie. C'est le comportement attendu.
- [Messages d'erreur de Supabase Auth en anglais] → Traduction par code d'erreur (`invalid_credentials`, `user_already_exists`, `weak_password`…), avec un message générique en français par défaut.
- [Une erreur dans `assurer_entreprise()` bloque l'app après connexion] → Écran d'erreur en français avec un bouton « Réessayer » et la possibilité de se déconnecter.

## Migration Plan

1. Créer le projet Supabase (région Europe de l'Ouest), désactiver « Confirm email » (Authentication → fournisseur Email), puis remplir `.env.local`.
2. Exécuter `supabase/migrations/20261106000000_schema_initial.sql` dans l'éditeur SQL.
3. Vérifier le Security Advisor (aucune alerte RLS), puis faire le test à deux comptes (spec `authentification`, isolation).
4. Retour arrière : `drop table depenses, membres, entreprises; drop function assurer_entreprise;`. Il n'y a encore aucune donnée réelle.
