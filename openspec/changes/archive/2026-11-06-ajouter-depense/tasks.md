# Tâches — Ajouter une dépense

## 1. Base de données Supabase

- [x] 1.1 Écrire `supabase/migrations/20261106000000_schema_initial.sql` : tables `entreprises`, `membres`, `depenses` et index (ARCHITECTURE §5), `cree_par default auth.uid()`, RLS activée sur les trois tables avec les politiques du design §3. Vérification : relecture du fichier contre ARCHITECTURE §5–6 et design §3.
- [x] 1.2 Ajouter au même fichier la fonction `assurer_entreprise()` (`security definer`, `search_path = ''`, verrou consultatif, exécution réservée à `authenticated`). Vérification : deux appels successifs dans l'éditeur SQL, en tant qu'utilisateur connecté, renvoient le même `entreprise_id`.
- [x] 1.3 **Action manuelle du gérant** : créer le projet Supabase (Europe de l'Ouest), désactiver « Confirm email » (Authentication → fournisseur Email), remplir `.env.local` depuis `.env.example`, puis exécuter la migration dans l'éditeur SQL. Vérification : les trois tables apparaissent dans le Table Editor avec la mention « RLS enabled », le Security Advisor ne signale aucune alerte, et « Confirm email » est bien désactivé.

## 2. Fonctions pures et validation

- [x] 2.1 Créer `src/lib/dates.ts` avec `aujourdhuiLocal(maintenant = new Date())` qui renvoie `AAAA-MM-JJ` en heure locale. Vérification : `src/lib/dates.test.ts` couvre un cas « 0 h 30 en UTC+1 » (TZ fixée dans le test) et passe avec `npm test`.
- [x] 2.2 Créer `src/lib/depense.ts` : `CATEGORIES` (valeur + libellé), schéma Zod `schemaDepense` (montant avec espaces retirés, entier > 0 ; date obligatoire et ≤ aujourd'hui ; catégorie parmi les trois ; description ≤ 100 caractères, vide → `null`), avec les messages en français exacts de la spec `depenses`. Vérification : `src/lib/depense.test.ts` couvre chaque scénario de validation de la spec et passe avec `npm test`.

## 3. Session et routes

- [x] 3.1 Créer `src/lib/session.tsx` (`FournisseurSession`, `useSession`) : lecture de la session, abonnement à `onAuthStateChange`, appel de `assurer_entreprise()`, états chargement / erreur avec « Réessayer » ; message en français si `supabase` vaut `null`. Vérification : `npm run build` passe ; sans `.env.local`, l'app affiche le message de configuration au lieu de planter.
- [x] 3.2 Créer `src/composants/routes.tsx` (`RouteConnectee`, `RoutePublique`), et réécrire `src/main.tsx` avec `createBrowserRouter` (`/connexion`, `/`, `/depenses/nouvelle`), `QueryClientProvider` et `FournisseurSession` ; supprimer `src/App.tsx`. Vérification : non connecté, l'ouverture de `/` ou de `/depenses/nouvelle` redirige vers `/connexion`.

## 4. Écran inscription/connexion

- [x] 4.1 Ajouter les composants shadcn `input`, `label`, `textarea` (`npx shadcn@latest add input label textarea`). Vérification : les fichiers existent dans `src/components/ui/` et `npm run build` passe.
- [x] 4.2 Créer `src/ecrans/InscriptionConnexion.tsx` (écran inscription/connexion) : deux modes, « Créer un compte » et « Se connecter » ; mot de passe d'au moins 8 caractères ; traduction des erreurs Supabase en français (design, Risks) ; après inscription, arrivée directe sur l'accueil, sans e-mail de confirmation. Vérification manuelle : chaque scénario de la spec `authentification` (création, aucun e-mail envoyé, mot de passe trop court, e-mail déjà utilisé, connexion, identifiants incorrects) se comporte comme décrit.
- [x] 4.3 Vérification manuelle de la session : après connexion, fermer puis rouvrir l'onglet → accueil sans reconnexion ; ouvrir `/connexion` connecté → redirection vers `/` ; une ligne `membres` (rôle `gerant`) existe en base, et une seule après une seconde connexion.

## 5. Accueil minimal

- [x] 5.1 Créer `src/ecrans/Accueil.tsx` : titre « Mes dépenses », gros bouton « + Ajouter une dépense » vers `/depenses/nouvelle`, bandeau « Dépense enregistrée » lu depuis l'état de navigation, bouton « Se déconnecter ». Vérification manuelle : la déconnexion ramène à `/connexion` ; le bandeau disparaît après un rafraîchissement.

## 6. Formulaire d'ajout

- [x] 6.1 Créer `src/composants/ChoixCategorie.tsx` : trois gros boutons (≥ 48 px de haut) en `role="radiogroup"` avec `aria-checked`. Vérification manuelle : un seul bouton est sélectionné à la fois ; navigation possible au clavier.
- [x] 6.2 Créer `src/lib/depenses-api.ts` avec `ajouterDepense(depense)` : `insert` dans `depenses`, le code `23505` étant traité comme un succès. Vérification : `src/lib/depenses-api.test.ts`, avec un client Supabase simulé, montre que `23505` renvoie un succès et qu'une autre erreur est propagée ; `npm test` passe.
- [x] 6.3 Créer `src/composants/FormulaireDepense.tsx` et `src/ecrans/NouvelleDepense.tsx` : date pré-remplie (`max` = aujourd'hui), montant `inputMode="numeric"`, `ChoixCategorie`, description `maxLength={100}`, identifiant généré une seule fois, mutation TanStack Query, bouton « Enregistrement… » désactivé pendant l'envoi, erreurs sous les champs, message d'échec réseau qui conserve la saisie, retour à `/` avec le message en cas de succès. Vérification manuelle : chaque scénario de la spec `depenses` se comporte comme décrit ; la ligne apparaît dans la table `depenses` de Supabase avec le bon `entreprise_id` et `cree_par`.

## 7. Vérifications d'ensemble

- [x] 7.1 `npm run build`, `npm test` et `npm run lint` passent sans erreur.
- [x] 7.2 Test d'isolation à deux comptes (spec `authentification`) : le compte B ne voit pas la dépense du compte A, et un `insert` avec l'`entreprise_id` de A est refusé ; une requête sans session ne renvoie rien.
- [x] 7.3 Parcours sur téléphone (`npm run dev -- --host`) : de l'accueil à « Dépense enregistrée » en moins de 30 secondes, avec le pavé numérique qui s'ouvre sur le montant.

## Workflow follow-up

- Archiver le changement (`/opsx:archive`) une fois les vérifications faites, pour créer les specs principales `authentification` et `depenses`.
