# Spec Delta — depenses

## ADDED Requirements

### Requirement: Ouverture d'une dépense depuis la liste
Chaque ligne de la liste des dépenses du mois SHALL être un lien qui ouvre l'écran de modification de cette dépense. Le lien MUST être utilisable au toucher, à la souris et au clavier, et son nom accessible MUST identifier la dépense (date, catégorie et montant).

#### Scenario: Ouverture
- **WHEN** l'utilisateur touche la ligne d'une dépense dans la liste
- **THEN** l'écran de modification de cette dépense s'affiche

#### Scenario: Clavier
- **WHEN** l'utilisateur atteint une ligne avec la touche Tab et appuie sur Entrée
- **THEN** l'écran de modification de cette dépense s'affiche

### Requirement: Formulaire de modification pré-rempli
L'écran de modification SHALL afficher le même formulaire que l'ajout, pré-rempli avec la date, le montant, la catégorie et la description de la dépense, et les mêmes règles de validation et messages d'erreur MUST s'appliquer.

#### Scenario: Pré-remplissage
- **GIVEN** une dépense du 28 octobre 2026, montant 1 250 000 FCFA, catégorie Salaires, description « Salaire Awa »
- **WHEN** l'utilisateur ouvre son écran de modification
- **THEN** le formulaire contient le 28 octobre 2026, « 1250000 », Salaires sélectionné et « Salaire Awa »

#### Scenario: Validation identique à l'ajout
- **WHEN** l'utilisateur remplace le montant par 0 et enregistre
- **THEN** la modification n'est pas enregistrée et le système affiche « Le montant doit être supérieur à 0. »

#### Scenario: Date dans le futur
- **WHEN** l'utilisateur choisit une date postérieure à aujourd'hui et enregistre
- **THEN** la modification n'est pas enregistrée et le système affiche « La date ne peut pas être dans le futur. »

### Requirement: Enregistrement d'une modification
Le système SHALL enregistrer les nouvelles valeurs d'une dépense valide, mettre à jour sa date de modification, puis ramener l'utilisateur à l'accueil sur le mois de la dépense, avec le message « Dépense modifiée ». La liste, le total et le graphique MUST refléter la modification sans rafraîchir la page.

#### Scenario: Modification réussie
- **GIVEN** une dépense de 15 000 FCFA en catégorie Fixe, en novembre 2026
- **WHEN** l'utilisateur remplace le montant par 20 000 et enregistre
- **THEN** l'accueil affiche novembre 2026 avec le message « Dépense modifiée », la ligne montre 20 000 FCFA, et le total du mois et la barre Fixe ont augmenté de 5 000 FCFA

#### Scenario: Changement de mois
- **WHEN** l'utilisateur change la date d'une dépense du 3 novembre au 30 octobre 2026 et enregistre
- **THEN** l'accueil affiche octobre 2026 avec la dépense dans la liste, et elle n'apparaît plus dans novembre 2026

#### Scenario: Envoi en cours
- **WHEN** l'enregistrement de la modification est en cours
- **THEN** le bouton affiche « Enregistrement… » et ne peut pas être actionné une seconde fois

#### Scenario: Échec de l'enregistrement
- **WHEN** l'enregistrement de la modification échoue (réseau coupé, serveur indisponible)
- **THEN** l'utilisateur reste sur l'écran de modification, ses saisies sont conservées, et le système affiche « La modification n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez. »

#### Scenario: Date de modification
- **WHEN** une dépense est modifiée
- **THEN** sa date de modification en base est mise à jour par la base de données, et sa date de création ne change pas

### Requirement: Suppression avec confirmation
L'écran de modification SHALL proposer un bouton « Supprimer cette dépense ». La suppression MUST être précédée d'une boîte de confirmation « Voulez-vous vraiment supprimer cette dépense ? » avec les choix « Annuler » et « Supprimer ». Après suppression, l'utilisateur revient à l'accueil sur le mois de la dépense avec le message « Dépense supprimée ».

#### Scenario: Suppression confirmée
- **GIVEN** une dépense Fixe de 15 000 FCFA en novembre 2026
- **WHEN** l'utilisateur appuie sur « Supprimer cette dépense » puis sur « Supprimer »
- **THEN** la dépense est supprimée, l'accueil affiche novembre 2026 avec le message « Dépense supprimée », et le total du mois et la barre Fixe ont diminué de 15 000 FCFA

#### Scenario: Suppression annulée
- **WHEN** l'utilisateur appuie sur « Supprimer cette dépense » puis sur « Annuler » ou sur Échap
- **THEN** la boîte se ferme, la dépense n'est pas supprimée et l'écran de modification reste affiché avec les saisies en cours

#### Scenario: Suppression en cours
- **WHEN** la suppression est en cours
- **THEN** le bouton de confirmation affiche « Suppression… » et ne peut pas être actionné une seconde fois

#### Scenario: Échec de la suppression
- **WHEN** la suppression échoue (réseau coupé, serveur indisponible)
- **THEN** la dépense n'est pas supprimée, l'utilisateur reste sur l'écran de modification et le système affiche « La dépense n'a pas pu être supprimée. Vérifiez votre connexion et réessayez. »

### Requirement: Dépense introuvable ou illisible
Si la dépense demandée n'existe pas, a été supprimée ou appartient à une autre entreprise, l'écran de modification SHALL afficher « Cette dépense n'existe pas ou a été supprimée. » avec un lien de retour à l'accueil, sans révéler si elle existe dans une autre entreprise. Si sa lecture échoue, il MUST afficher un message d'erreur avec « Réessayer ».

#### Scenario: Identifiant inconnu
- **WHEN** l'utilisateur ouvre `/depenses/` suivi d'un identifiant qui ne correspond à aucune de ses dépenses
- **THEN** le système affiche « Cette dépense n'existe pas ou a été supprimée. » et un lien « Retour à l'accueil »

#### Scenario: Dépense d'une autre entreprise
- **WHEN** un utilisateur ouvre l'adresse de modification d'une dépense d'une autre entreprise
- **THEN** il voit le même message « Cette dépense n'existe pas ou a été supprimée. » et ne peut ni la lire, ni la modifier, ni la supprimer

#### Scenario: Échec de lecture
- **WHEN** la lecture de la dépense échoue (réseau coupé, serveur indisponible)
- **THEN** le système affiche « Impossible de charger cette dépense. Vérifiez votre connexion et réessayez. » avec un bouton « Réessayer »

#### Scenario: Dépense supprimée entre-temps
- **GIVEN** une dépense ouverte en modification sur un appareil et supprimée depuis un autre
- **WHEN** l'utilisateur enregistre sa modification sur le premier appareil
- **THEN** le système affiche « Cette dépense n'existe pas ou a été supprimée. » et aucune dépense n'est recréée

### Requirement: Contrôles en base pour la modification
La base de données MUST appliquer à une modification les mêmes contrôles qu'à un ajout (montant entier strictement positif, catégorie autorisée, description de 100 caractères au plus) et n'autoriser la modification ou la suppression qu'aux membres de l'entreprise de la dépense.

#### Scenario: Modification directe invalide
- **WHEN** une modification fixant le montant à 0 ou la catégorie à « transport » est envoyée directement à la base
- **THEN** la base refuse la modification

#### Scenario: Modification ou suppression par une autre entreprise
- **WHEN** un utilisateur d'une autre entreprise envoie directement à la base une modification ou une suppression de la dépense
- **THEN** aucune ligne n'est modifiée ni supprimée
