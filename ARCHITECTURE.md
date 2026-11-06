# Architecture — Mes dépenses

> Choix techniques retenus pour l'app décrite dans `PRD.md`. Dernière mise à jour : 5 novembre 2026.

## 1. Vue d'ensemble

Une **application web** (pas une app mobile) : elle s'ouvre dans le navigateur, sur téléphone comme sur ordinateur, à partir d'une simple adresse web. Rien à installer depuis un store. En option, le gérant peut ajouter un raccourci sur l'écran d'accueil de son téléphone (PWA).

L'app est un ensemble de fichiers statiques hébergés sur **Vercel**. Elle parle directement à **Supabase**, qui fournit la base de données PostgreSQL, les comptes utilisateurs et, plus tard, le stockage de fichiers. Il n'y a **aucun serveur applicatif** à écrire ni à maintenir.

```
  Téléphone ou ordinateur (navigateur)
  ┌──────────────────────────────────────┐
  │  App React (SPA)                     │
  │   ├─ Écrans : Connexion, Accueil,    │
  │   │           Formulaire             │
  │   ├─ TanStack Query : cache local    │
  │   └─ Service worker (PWA)            │
  └──────────────────┬───────────────────┘
                     │ HTTPS (supabase-js)
  ┌──────────────────▼───────────────────┐
  │  Supabase (région Europe de l'Ouest) │
  │   ├─ Auth : e-mail + mot de passe    │
  │   ├─ PostgreSQL + RLS : données      │
  │   ├─ Storage : reçus (V2)            │
  │   └─ Cron, Edge Functions (V1)       │
  └──────────────────────────────────────┘
  Fichiers de l'app servis par Vercel (CDN)
  E-mails d'authentification envoyés via Brevo (SMTP)
```

## 2. Stack technique

| Couche | Choix | Rôle |
|---|---|---|
| Langage | **TypeScript** | Erreurs détectées avant l'exécution. |
| Interface | **React 19 + Vite** | Application monopage (SPA), build en fichiers statiques. |
| Navigation | **React Router** | Routes de l'app (voir §4). |
| Style | **Tailwind CSS 4 + shadcn/ui** | Design simple, clair et aéré ; composants accessibles (boîte de confirmation, etc.). |
| Données côté app | **TanStack Query** | Chargement, cache, mise à jour immédiate de l'écran après enregistrement. |
| Validation | **Zod** | Règles du PRD, messages d'erreur en français. |
| Graphique | **Barres horizontales en CSS**, sans librairie | 3 valeurs à comparer : pas besoin de dépendance. |
| Formatage | **`Intl.NumberFormat('fr-FR')`, `Intl.DateTimeFormat('fr-FR')`** | « 1 250 000 FCFA », « novembre 2026 », sans librairie. |
| Base de données | **Supabase PostgreSQL** | Données de l'app, sécurité ligne par ligne (RLS). |
| Authentification | **Supabase Auth**, e-mail + mot de passe | Session persistante : le gérant se connecte une seule fois. Pas d'e-mail de confirmation à l'inscription : le compte est utilisable immédiatement. |
| E-mails d'auth | **Brevo** (SMTP, offre gratuite 300 e-mails/jour) | Réinitialisation du mot de passe ; invitation d'un collaborateur (V1). |
| PWA | **vite-plugin-pwa** | Raccourci sur l'écran d'accueil, ouverture rapide. |
| Hébergement | **Vercel** | Déploiement automatique à chaque push sur Git. |
| Tests | **Vitest** | Calculs : total du mois, bornes de mois, formatage des montants. |

## 3. Conventions

- **Code en français** : tables, colonnes, variables, fonctions, fichiers (`depenses`, `montant`, `categorie`, `calculerTotalDuMois`, `FormulaireDepense.tsx`). Les mots-clés du langage et les API des librairies restent évidemment en anglais.
- **Interface 100 % en français.**
- **Montants** : nombres entiers en FCFA, jamais de nombres à virgule, ni en base ni dans le code.
- **Dates** : type `date` (jour seulement, sans heure). « Aujourd'hui » est calculé à l'heure locale du téléphone, jamais en UTC (sinon, en zone UTC+1, une dépense saisie entre minuit et 1 h serait datée de la veille).

## 4. Écrans et routes

| Route | Écran | Accès |
|---|---|---|
| `/connexion` | Connexion, création de compte, mot de passe oublié | Public |
| `/` | Accueil : filtre du mois, total, graphique, liste des dépenses, bouton « + Ajouter une dépense » | Connecté |
| `/depenses/nouvelle` | Formulaire d'ajout | Connecté |
| `/depenses/:id` | Même formulaire, en modification | Connecté |

Le mois choisi est conservé dans l'adresse (`/?mois=2026-11`) : un retour arrière ou un rafraîchissement garde le bon mois.

## 5. Modèle de données

Les dépenses appartiennent à une **entreprise**, pas à un utilisateur. Dans le MVP, l'entreprise n'a qu'un membre (le gérant). L'invitation d'un collaborateur (V1) consistera simplement à ajouter une ligne dans `membres`.

```sql
create table entreprises (
  id   uuid primary key default gen_random_uuid(),
  nom  text not null
);

create table membres (
  entreprise_id uuid references entreprises on delete cascade,
  utilisateur_id uuid references auth.users on delete cascade,
  role          text not null default 'gerant' check (role in ('gerant', 'collaborateur')),
  primary key (entreprise_id, utilisateur_id)
);

create table depenses (
  id            uuid primary key default gen_random_uuid(), -- fourni par l'app (crypto.randomUUID)
  entreprise_id uuid not null references entreprises on delete cascade,
  date          date not null,
  montant       integer not null check (montant > 0),
  categorie     text not null check (categorie in ('abonnement', 'fixe', 'salaires')),
  description   text check (char_length(description) <= 100),
  cree_par      uuid references auth.users,
  cree_le       timestamptz not null default now(),
  modifie_le    timestamptz not null default now()
);
create index on depenses (entreprise_id, date);
```

**Création de l'entreprise** : à la première connexion, si l'utilisateur n'est membre d'aucune entreprise, l'app en crée une et l'y ajoute comme `gerant`.

**Identifiants générés par l'app** : chaque nouvelle dépense reçoit son identifiant dans le navigateur (`crypto.randomUUID()`). Un envoi répété (réseau instable) ne crée donc jamais de doublon.

## 6. Sécurité

- **RLS activée sur toutes les tables, dès leur création.** La clé publique de Supabase est visible dans l'app : sans RLS, n'importe qui pourrait lire la base.
- Règle de base : un utilisateur n'accède qu'aux lignes des entreprises dont il est membre.

```sql
alter table depenses enable row level security;
create policy "membres de l'entreprise" on depenses for all
  using      (entreprise_id in (select entreprise_id from membres where utilisateur_id = auth.uid()))
  with check (entreprise_id in (select entreprise_id from membres where utilisateur_id = auth.uid()));
-- Même principe sur entreprises et membres.
```

- Vérification avec le « Security Advisor » de Supabase et un test avec un second compte avant chaque mise en production.
- La clé secrète Supabase (service role) n'est **jamais** dans le code de l'app ; elle n'est utilisée que dans les Edge Functions (V1).

## 7. Règles métier et calculs

| Règle (PRD) | Formulaire (Zod) | Base de données |
|---|---|---|
| Montant entier > 0 | ✅ message en français | `check (montant > 0)`, type `integer` |
| Date obligatoire, pas dans le futur | ✅ + attribut `max` = aujourd'hui | — (dépend du fuseau, vérifié côté app) |
| Catégorie : abonnement, fixe ou salaires | ✅ | `check (categorie in (...))` |
| Description ≤ 100 caractères | ✅ + `maxLength` | `check (char_length(description) <= 100)` |
| Confirmation avant suppression | Boîte « Voulez-vous vraiment supprimer cette dépense ? » | — |

- **Total du mois et graphique** : calculés dans l'app à partir de la liste des dépenses du mois (un seul appel réseau). Filtre : `date >= premier jour du mois` et `date < premier jour du mois suivant`.
- **Format des montants** : `Intl.NumberFormat('fr-FR')`, suivi de « FCFA ».
- Les fonctions de calcul (total, totaux par catégorie, bornes du mois, formatage) sont des fonctions pures, testées avec Vitest.

## 8. Expérience mobile (objectif : ajout en moins de 30 secondes)

- Date pré-remplie avec aujourd'hui, champ natif `type="date"`.
- Montant avec le pavé numérique (`inputmode="numeric"`).
- Catégorie choisie avec **3 gros boutons**, pas une liste déroulante.
- Après « Enregistrer », la dépense apparaît immédiatement dans la liste ; l'envoi se fait en arrière-plan.
- Session persistante : pas de reconnexion à chaque ouverture.

## 9. Hébergement et environnements

| Élément | Service | Plan |
|---|---|---|
| App (fichiers statiques) | Vercel | Hobby (gratuit) |
| Base, auth, fichiers | Supabase, région Europe de l'Ouest (Paris ou Londres) | Free |
| E-mails d'authentification | Brevo, branché en SMTP personnalisé dans Supabase | Gratuit |

- Le code est versionné avec **Git** ; Vercel redéploie automatiquement à chaque push sur la branche principale.
- Variables d'environnement côté app : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (clé publique uniquement).
- Le SMTP Brevo doit être configuré **avant** la mise en production : le serveur d'e-mails intégré de Supabase n'envoie qu'aux membres de l'équipe du projet.

## 10. Sauvegarde des données

- **Export CSV (V1)** : le gérant télécharge ses dépenses à tout moment ; ce fichier sert aussi de sauvegarde.
- Format pour Excel en français : séparateur `;`, encodage UTF-8 avec BOM (pour les accents), montants en entiers sans espaces.
- Pas de sauvegarde automatique sur l'offre gratuite de Supabase.

## 11. Évolutions prévues

| Fonction | Version | Réalisation |
|---|:-:|---|
| Export CSV | V1 | Généré dans le navigateur, sans librairie (voir §10). |
| Export PDF | V1 | Page imprimable + « Imprimer → Enregistrer en PDF » ; `pdfmake` si une mise en forme poussée est nécessaire. |
| Invitation d'un collaborateur | V1 | Ligne `collaborateur` dans `membres` ; envoi de l'invitation par une Edge Function (e-mail via Brevo). |
| Dépenses récurrentes | V1 | Table de modèles + tâche quotidienne Supabase Cron ; contrainte d'unicité (modèle, date) contre les doublons. |
| Comparaison avec le mois précédent | V1 | Deuxième requête mise en cache, barres doubles. |
| Réseau faible | V1 | Cache persistant de TanStack Query + file d'attente des enregistrements, renvoyés au retour du réseau. |
| Entrées d'argent et solde | V2 | Table `entrees`, même modèle que `depenses`. |
| Budget par catégorie avec alerte | V2 | Table `budgets`, bandeau d'alerte dans l'app. |
| Photo du reçu | V2 | `<input type="file" accept="image/*" capture="environment">`, compression dans le navigateur (~150 Ko), Supabase Storage. |

## 12. Points d'attention

- **Vercel Hobby est réservé à l'usage non commercial.** Si l'app est utilisée par une entreprise en production (ou réalisée par un prestataire payé), le plan Pro est exigé.
- **Supabase Free se met en pause après 7 jours sans activité.** Les données restent intactes ; réactivation en un clic depuis le tableau de bord. Les tâches Cron (V1) s'arrêtent pendant la pause.
- **Pas de sauvegarde avant la V1** : tant que l'export CSV n'existe pas, une erreur de manipulation dans la base est irréversible.
- **Photos de reçus (V2)** : sans compression, le 1 Go de stockage gratuit serait plein en un mois environ.
