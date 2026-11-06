# Spec Delta — depenses

## ADDED Requirements

### Requirement: Choix du mois affiché
L'accueil SHALL afficher les dépenses d'un seul mois, nommé en toutes lettres en français (« novembre 2026 »). Le mois en cours de l'appareil (heure locale) MUST être affiché par défaut. Deux boutons permettent de passer au mois précédent ou au mois suivant ; il est impossible d'afficher un mois postérieur au mois en cours.

#### Scenario: Mois par défaut
- **WHEN** l'utilisateur connecté ouvre l'accueil sans avoir choisi de mois, le 6 novembre 2026
- **THEN** l'accueil affiche « novembre 2026 » et les dépenses de ce mois

#### Scenario: Mois précédent
- **GIVEN** l'accueil affiche « janvier 2026 »
- **WHEN** l'utilisateur appuie sur le bouton « mois précédent »
- **THEN** l'accueil affiche « décembre 2025 » et les dépenses de ce mois

#### Scenario: Pas de mois futur
- **GIVEN** l'accueil affiche le mois en cours
- **WHEN** l'utilisateur regarde le bouton « mois suivant »
- **THEN** ce bouton est désactivé

#### Scenario: Retour au mois suivant
- **GIVEN** l'accueil affiche « octobre 2026 » et le mois en cours est novembre 2026
- **WHEN** l'utilisateur appuie sur le bouton « mois suivant »
- **THEN** l'accueil affiche « novembre 2026 »

### Requirement: Mois conservé dans l'adresse
Le mois choisi SHALL figurer dans l'adresse de l'accueil sous la forme `?mois=AAAA-MM`, afin qu'un rafraîchissement, un retour arrière ou un lien partagé affiche le même mois. Une valeur absente, mal formée ou postérieure au mois en cours MUST être remplacée par le mois en cours.

#### Scenario: Rafraîchissement
- **GIVEN** l'accueil affiche « septembre 2026 »
- **WHEN** l'utilisateur rafraîchit la page
- **THEN** l'accueil affiche toujours « septembre 2026 »

#### Scenario: Retour arrière
- **GIVEN** l'utilisateur est passé de « novembre 2026 » à « octobre 2026 »
- **WHEN** il utilise le retour arrière du navigateur
- **THEN** l'accueil affiche « novembre 2026 »

#### Scenario: Valeur invalide
- **WHEN** l'utilisateur ouvre l'accueil avec `?mois=2026-13`, `?mois=abc` ou un mois futur
- **THEN** l'accueil affiche le mois en cours

### Requirement: Liste des dépenses du mois
L'accueil SHALL lister toutes les dépenses de l'entreprise dont la date est comprise entre le premier et le dernier jour du mois choisi, inclus, et aucune autre. Les dépenses MUST être triées de la plus récente à la plus ancienne ; à date égale, la dernière saisie apparaît en premier.

#### Scenario: Bornes du mois
- **GIVEN** des dépenses datées du 31 octobre, du 1er novembre, du 30 novembre et du 1er décembre 2026
- **WHEN** l'accueil affiche « novembre 2026 »
- **THEN** seules les dépenses du 1er et du 30 novembre sont listées

#### Scenario: Ordre de la liste
- **GIVEN** trois dépenses du mois datées du 2, du 15 et du 9
- **WHEN** l'accueil affiche ce mois
- **THEN** elles apparaissent dans l'ordre : le 15, le 9, le 2

#### Scenario: Dépense qui vient d'être ajoutée
- **WHEN** l'utilisateur enregistre une dépense datée du mois en cours et revient à l'accueil
- **THEN** la dépense figure dans la liste et le total en tient compte, sans rafraîchir la page

#### Scenario: Dépense ajoutée dans un autre mois
- **WHEN** l'utilisateur enregistre une dépense datée du 28 octobre 2026 alors que le mois en cours est novembre 2026
- **THEN** l'accueil affiche « octobre 2026 », avec la nouvelle dépense dans la liste et le message « Dépense enregistrée »

### Requirement: Contenu d'une ligne de la liste
Chaque ligne de la liste SHALL afficher la date (jour et mois abrégé, par exemple « 6 nov. »), le libellé de la catégorie (Abonnement, Fixe ou Salaires), la description si elle existe, et le montant au format des montants.

#### Scenario: Ligne complète
- **GIVEN** une dépense du 6 novembre 2026, catégorie salaires, montant 150000, description « Salaire Awa »
- **WHEN** elle est affichée dans la liste
- **THEN** la ligne montre « 6 nov. », « Salaires », « Salaire Awa » et « 150 000 FCFA »

#### Scenario: Sans description
- **GIVEN** une dépense sans description
- **WHEN** elle est affichée dans la liste
- **THEN** la ligne montre la date, la catégorie et le montant, sans texte vide ni tiret

### Requirement: Total du mois
L'accueil SHALL afficher en gros caractères le total du mois choisi, égal à la somme des montants de toutes les dépenses listées pour ce mois.

#### Scenario: Calcul du total
- **GIVEN** trois dépenses du mois de 1 250 000, 15 000 et 500 FCFA
- **WHEN** l'accueil affiche ce mois
- **THEN** le total affiché est « 1 265 500 FCFA »

#### Scenario: Mois sans dépense
- **WHEN** l'accueil affiche un mois sans aucune dépense
- **THEN** le total affiché est « 0 FCFA » et la liste est remplacée par le message « Aucune dépense ce mois-ci. »

### Requirement: Format des montants
Tout montant affiché SHALL être un nombre entier avec un espace tous les trois chiffres, suivi de « FCFA ».

#### Scenario: Grand montant
- **WHEN** le montant 1250000 est affiché
- **THEN** il apparaît sous la forme « 1 250 000 FCFA »

#### Scenario: Petit montant
- **WHEN** le montant 500 est affiché
- **THEN** il apparaît sous la forme « 500 FCFA »

### Requirement: Chargement et erreur de lecture
Pendant le chargement des dépenses d'un mois, l'accueil SHALL l'indiquer sans afficher un total faux. Si la lecture échoue, il MUST afficher « Impossible de charger vos dépenses. Vérifiez votre connexion et réessayez. » avec un bouton « Réessayer ».

#### Scenario: Chargement
- **WHEN** les dépenses du mois choisi sont en cours de chargement
- **THEN** l'accueil indique le chargement et n'affiche ni total à 0 ni message « Aucune dépense ce mois-ci. »

#### Scenario: Échec de lecture
- **WHEN** la lecture des dépenses échoue (réseau coupé, serveur indisponible)
- **THEN** l'accueil affiche le message d'erreur et le bouton « Réessayer », et le bouton « + Ajouter une dépense » reste utilisable

#### Scenario: Nouvel essai réussi
- **GIVEN** le message d'erreur de lecture est affiché
- **WHEN** l'utilisateur appuie sur « Réessayer » et la lecture réussit
- **THEN** la liste et le total du mois s'affichent
