# Spec Delta — depenses

## ADDED Requirements

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
