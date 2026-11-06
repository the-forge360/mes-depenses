# Proposition — Ajouter une dépense

## Why

L'ajout d'une dépense est le geste principal de l'app (PRD §7, MVP) : sans lui, le gérant ne peut rien noter. Pour qu'une dépense soit réellement enregistrée, il faut aussi que le gérant soit connecté et rattaché à une entreprise, car la sécurité ligne par ligne (RLS) de Supabase refuse toute écriture anonyme. Ce changement livre donc la première tranche utilisable de bout en bout : se connecter, saisir une dépense, la retrouver en base.

## What Changes

- **Base de données Supabase** : création des tables `entreprises`, `membres` et `depenses` (ARCHITECTURE §5), avec RLS activée dès la création (§6), et d'une fonction `assurer_entreprise()` qui crée l'entreprise du gérant à sa première connexion.
- **Écran inscription/connexion (`/connexion`)** : création de compte et connexion par e-mail + mot de passe, messages en français. **Pas d'e-mail de confirmation** : le compte est utilisable dès l'inscription. La session est persistante.
- **Protection des routes** : les écrans `/` et `/depenses/nouvelle` ne sont accessibles qu'une fois connecté ; sinon, redirection vers `/connexion`.
- **Écran `/depenses/nouvelle`** : formulaire avec date (aujourd'hui par défaut, heure locale), montant en FCFA (entier > 0, pavé numérique), catégorie (3 gros boutons : abonnement, fixe, salaires) et description facultative (100 caractères max). Bouton « Enregistrer ».
- **Validation** : règles du PRD §5–6 avec Zod, messages en français ; mêmes contraintes en base (§7).
- **Enregistrement** : identifiant généré dans le navigateur (`crypto.randomUUID()`) pour qu'un envoi répété ne crée jamais de doublon.
- **Accueil minimal `/`** : bouton « + Ajouter une dépense », confirmation « Dépense enregistrée » après un ajout, bouton de déconnexion. Il remplace l'écran temporaire actuel.

Hors périmètre (changements suivants) : liste des dépenses, total du mois, graphique, filtre par mois, modification et suppression (`/depenses/:id`), mot de passe oublié. Ce changement n'envoie aucun e-mail ; le mot de passe oublié et le branchement de Brevo feront l'objet d'un changement dédié.

## Capabilities

### New Capabilities
- `authentification` : création de compte, connexion, session persistante, déconnexion, accès réservé aux utilisateurs connectés, rattachement automatique du gérant à une entreprise.
- `depenses` : enregistrement des dépenses d'une entreprise et règles de validation (date, montant, catégorie, description). Elle accueillera plus tard la modification, la suppression et la consultation.

### Modified Capabilities
_Aucune : il n'existe encore aucune spec dans le projet._

## Impact

- **Code** : `src/main.tsx` (routeur, TanStack Query), `src/App.tsx` remplacé par des écrans dans `src/ecrans/`, nouveaux modules dans `src/lib/` (dates, validation, accès aux données). Ajout de composants shadcn/ui (champ, libellé…).
- **Base** : nouveau fichier de migration SQL dans `supabase/migrations/`, à exécuter dans le projet Supabase.
- **Prérequis hors code** : un projet Supabase (région Europe de l'Ouest), avec l'option « Confirm email » désactivée (Authentication → fournisseur Email), et un fichier `.env.local` rempli à partir de `.env.example`.
- **Dépendances** : aucune nouvelle ; tout est déjà installé (supabase-js, React Router, TanStack Query, Zod).
