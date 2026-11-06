# depenses Specification

## Purpose

Permettre au gérant d'enregistrer les dépenses de son entreprise (date, montant en FCFA, catégorie, description) de façon rapide et fiable depuis son téléphone ou son ordinateur.

## Requirements

### Requirement: Accès au formulaire d'ajout
Le système SHALL proposer sur l'accueil un bouton « + Ajouter une dépense » qui ouvre le formulaire d'ajout.

#### Scenario: Ouverture du formulaire
- **WHEN** l'utilisateur connecté appuie sur « + Ajouter une dépense » depuis l'accueil
- **THEN** le formulaire d'ajout s'affiche avec les champs date, montant, catégorie et description, et un bouton « Enregistrer »

### Requirement: Date de la dépense
La date SHALL être obligatoire, pré-remplie avec la date du jour selon l'heure locale de l'appareil, et ne MUST pas être dans le futur.

#### Scenario: Valeur par défaut
- **WHEN** le formulaire d'ajout s'ouvre
- **THEN** le champ date contient la date du jour de l'appareil

#### Scenario: Juste après minuit
- **GIVEN** un appareil réglé sur le fuseau UTC+1, à 0 h 30 le 6 novembre 2026 (heure locale)
- **WHEN** le formulaire d'ajout s'ouvre
- **THEN** la date pré-remplie est le 6 novembre 2026, et non le 5

#### Scenario: Date dans le futur
- **WHEN** l'utilisateur choisit une date postérieure à aujourd'hui et enregistre
- **THEN** la dépense n'est pas enregistrée et le système affiche « La date ne peut pas être dans le futur. »

#### Scenario: Date absente
- **WHEN** l'utilisateur vide le champ date et enregistre
- **THEN** la dépense n'est pas enregistrée et le système affiche « La date est obligatoire. »

### Requirement: Montant de la dépense
Le montant SHALL être obligatoire, exprimé en FCFA, et être un nombre entier strictement supérieur à 0. Sur téléphone, sa saisie MUST ouvrir le pavé numérique. Les espaces saisis entre les chiffres sont ignorés.

#### Scenario: Montant valide
- **WHEN** l'utilisateur saisit « 1 250 000 » et enregistre une dépense par ailleurs valide
- **THEN** la dépense est enregistrée avec un montant de 1250000 FCFA

#### Scenario: Montant nul ou négatif
- **WHEN** l'utilisateur saisit 0 ou un nombre négatif et enregistre
- **THEN** la dépense n'est pas enregistrée et le système affiche « Le montant doit être supérieur à 0. »

#### Scenario: Montant à virgule ou non numérique
- **WHEN** l'utilisateur saisit un nombre à virgule ou des lettres et enregistre
- **THEN** la dépense n'est pas enregistrée et le système affiche « Le montant doit être un nombre entier, sans virgule. »

#### Scenario: Montant absent
- **WHEN** l'utilisateur laisse le montant vide et enregistre
- **THEN** la dépense n'est pas enregistrée et le système affiche « Le montant est obligatoire. »

### Requirement: Catégorie de la dépense
La catégorie SHALL être obligatoire et choisie parmi exactement trois valeurs : Abonnement, Fixe, Salaires, présentées sous forme de trois gros boutons et non d'une liste déroulante.

#### Scenario: Choix d'une catégorie
- **WHEN** l'utilisateur appuie sur le bouton « Salaires »
- **THEN** ce bouton apparaît sélectionné et les deux autres non sélectionnés

#### Scenario: Catégorie absente
- **WHEN** l'utilisateur enregistre sans avoir choisi de catégorie
- **THEN** la dépense n'est pas enregistrée et le système affiche « Choisissez une catégorie. »

### Requirement: Description de la dépense
La description SHALL être facultative et limitée à 100 caractères. Le champ MUST empêcher la saisie au-delà de 100 caractères.

#### Scenario: Sans description
- **WHEN** l'utilisateur laisse la description vide et enregistre une dépense par ailleurs valide
- **THEN** la dépense est enregistrée sans description

#### Scenario: Description trop longue
- **WHEN** l'utilisateur tente de saisir plus de 100 caractères
- **THEN** le champ s'arrête à 100 caractères

### Requirement: Enregistrement de la dépense
Le système SHALL enregistrer une dépense valide dans l'entreprise de l'utilisateur connecté, puis ramener l'utilisateur à l'accueil avec le message « Dépense enregistrée ».

#### Scenario: Enregistrement réussi
- **WHEN** l'utilisateur remplit le formulaire avec des valeurs valides et appuie sur « Enregistrer »
- **THEN** la dépense est enregistrée pour son entreprise, avec l'utilisateur comme auteur, et l'accueil s'affiche avec le message « Dépense enregistrée »

#### Scenario: Envoi en cours
- **WHEN** l'enregistrement est en cours
- **THEN** le bouton affiche « Enregistrement… » et ne peut pas être actionné une seconde fois

#### Scenario: Échec de l'enregistrement
- **WHEN** l'enregistrement échoue (réseau coupé, serveur indisponible)
- **THEN** l'utilisateur reste sur le formulaire, ses saisies sont conservées, et le système affiche « La dépense n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez. »

### Requirement: Pas de doublon en cas de nouvel essai
Le système MUST garantir qu'un même formulaire envoyé plusieurs fois (par exemple après un échec réseau) ne crée qu'une seule dépense.

#### Scenario: Nouvel essai après une réponse perdue
- **GIVEN** une dépense dont l'enregistrement a abouti en base mais dont la réponse n'est jamais arrivée sur l'appareil
- **WHEN** l'utilisateur appuie de nouveau sur « Enregistrer » sur le même formulaire
- **THEN** une seule dépense existe en base

### Requirement: Contrôles en base de données
La base de données MUST refuser, indépendamment de l'app, une dépense dont le montant n'est pas un entier strictement positif, dont la catégorie n'est pas l'une des trois valeurs autorisées, ou dont la description dépasse 100 caractères.

#### Scenario: Écriture directe invalide
- **WHEN** une dépense avec un montant de 0 ou une catégorie « transport » est envoyée directement à la base
- **THEN** la base refuse l'écriture
