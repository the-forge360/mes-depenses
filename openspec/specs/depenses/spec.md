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

### Requirement: Graphique des catégories
L'accueil SHALL afficher, pour le mois choisi, un graphique de trois barres horizontales, une par catégorie, toujours dans l'ordre Abonnement, Fixe, Salaires. Chaque barre MUST montrer le libellé de la catégorie, son total au format des montants et sa part du total du mois en pourcentage entier.

#### Scenario: Totaux et parts par catégorie
- **GIVEN** le mois choisi contient des dépenses Salaires de 150 000 et 50 000 FCFA, une dépense Fixe de 40 000 FCFA et une dépense Abonnement de 10 000 FCFA
- **WHEN** l'accueil affiche ce mois
- **THEN** le graphique montre, dans cet ordre, « Abonnement 10 000 FCFA 4 % », « Fixe 40 000 FCFA 16 % » et « Salaires 200 000 FCFA 80 % »

#### Scenario: Catégorie sans dépense
- **GIVEN** le mois choisi ne contient aucune dépense Abonnement mais contient d'autres dépenses
- **WHEN** l'accueil affiche ce mois
- **THEN** la barre Abonnement est présente, vide, avec « 0 FCFA » et « 0 % »

#### Scenario: Très petite part
- **GIVEN** une catégorie dont la part du total est supérieure à 0 mais inférieure à 0,5 %
- **WHEN** le graphique est affiché
- **THEN** sa part s'affiche « < 1 % » et non « 0 % »

### Requirement: Longueur des barres
La longueur de chaque barre SHALL être proportionnelle à la part de sa catégorie dans le total du mois : une catégorie qui représente tout le total occupe toute la largeur disponible, une catégorie sans dépense n'a pas de barre visible.

#### Scenario: Proportions
- **GIVEN** les parts sont de 4 %, 16 % et 80 %
- **WHEN** le graphique est affiché
- **THEN** la barre Salaires est cinq fois plus longue que la barre Fixe, et la barre Fixe quatre fois plus longue que la barre Abonnement

### Requirement: Graphique lié au mois et à son état
Le graphique SHALL utiliser les mêmes dépenses que la liste et le total du mois choisi, et se mettre à jour avec eux. Il MUST être masqué quand le mois ne contient aucune dépense, pendant le chargement et en cas d'erreur de lecture.

#### Scenario: Changement de mois
- **WHEN** l'utilisateur passe à un autre mois qui contient des dépenses
- **THEN** le graphique affiche les totaux par catégorie de ce mois

#### Scenario: Après un ajout
- **WHEN** l'utilisateur enregistre une dépense Fixe de 5 000 FCFA dans le mois affiché et revient à l'accueil
- **THEN** le total de la barre Fixe a augmenté de 5 000 FCFA et les parts sont recalculées, sans rafraîchir la page

#### Scenario: Mois sans dépense
- **WHEN** l'accueil affiche un mois sans aucune dépense
- **THEN** aucun graphique n'est affiché, seulement le total « 0 FCFA » et le message « Aucune dépense ce mois-ci. »

#### Scenario: Chargement ou erreur
- **WHEN** les dépenses du mois sont en cours de chargement ou leur lecture a échoué
- **THEN** aucun graphique n'est affiché

### Requirement: Graphique lisible sans la vue
Les informations du graphique SHALL être accessibles sous forme de texte (libellé, montant et part de chaque catégorie), de sorte qu'un lecteur d'écran les annonce sans dépendre des barres.

#### Scenario: Lecteur d'écran
- **WHEN** un lecteur d'écran parcourt le graphique
- **THEN** il annonce pour chaque catégorie son libellé, son montant et sa part, et ignore les barres décoratives
