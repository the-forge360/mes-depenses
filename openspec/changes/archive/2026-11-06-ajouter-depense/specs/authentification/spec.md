# Spec Delta — authentification

## Purpose

Permettre au gérant de créer son compte, de se connecter une seule fois par appareil et d'accéder uniquement aux données de son entreprise.

## ADDED Requirements

### Requirement: Création de compte par e-mail et mot de passe
Le système SHALL permettre à un visiteur de créer un compte avec une adresse e-mail et un mot de passe d'au moins 8 caractères, depuis l'écran d'inscription/connexion. Le compte MUST être utilisable immédiatement, sans e-mail de confirmation. Tous les messages sont en français.

#### Scenario: Création réussie
- **WHEN** le visiteur saisit un e-mail valide et un mot de passe de 8 caractères ou plus, puis valide la création de compte
- **THEN** le compte est créé, l'utilisateur est connecté immédiatement et arrive sur l'accueil

#### Scenario: Aucun e-mail envoyé
- **WHEN** un visiteur crée un compte
- **THEN** aucun e-mail de confirmation n'est envoyé et aucune action dans une boîte e-mail n'est nécessaire pour utiliser l'app

#### Scenario: Mot de passe trop court
- **WHEN** le visiteur saisit un mot de passe de moins de 8 caractères
- **THEN** le compte n'est pas créé et le système affiche « Le mot de passe doit contenir au moins 8 caractères. »

#### Scenario: E-mail déjà utilisé
- **WHEN** le visiteur tente de créer un compte avec un e-mail déjà inscrit
- **THEN** aucun second compte n'est créé et le système affiche un message en français invitant à se connecter

### Requirement: Connexion par e-mail et mot de passe
Le système SHALL permettre à un utilisateur inscrit de se connecter avec son e-mail et son mot de passe, puis l'amener à l'accueil.

#### Scenario: Connexion réussie
- **WHEN** l'utilisateur saisit un e-mail et un mot de passe corrects
- **THEN** il est connecté et arrive sur l'accueil

#### Scenario: Identifiants incorrects
- **WHEN** l'utilisateur saisit un e-mail ou un mot de passe incorrect
- **THEN** il reste sur l'écran d'inscription/connexion et le système affiche « E-mail ou mot de passe incorrect. »

### Requirement: Session persistante
Le système SHALL conserver la session sur l'appareil, de sorte que le gérant n'ait pas à se reconnecter à chaque ouverture de l'app.

#### Scenario: Réouverture de l'app
- **GIVEN** un utilisateur connecté qui ferme l'app
- **WHEN** il rouvre l'app sur le même appareil et le même navigateur
- **THEN** il arrive directement sur l'accueil sans saisir ses identifiants

### Requirement: Déconnexion
Le système SHALL permettre à l'utilisateur connecté de se déconnecter depuis l'accueil.

#### Scenario: Déconnexion
- **WHEN** l'utilisateur choisit « Se déconnecter »
- **THEN** sa session est fermée et il est renvoyé vers l'écran d'inscription/connexion

### Requirement: Accès réservé aux utilisateurs connectés
Le système SHALL réserver l'accueil et le formulaire de dépense aux utilisateurs connectés, et ne montrer l'écran d'inscription/connexion qu'aux visiteurs non connectés.

#### Scenario: Visiteur non connecté
- **WHEN** un visiteur non connecté ouvre l'accueil ou le formulaire de dépense
- **THEN** il est redirigé vers l'écran d'inscription/connexion

#### Scenario: Utilisateur déjà connecté
- **WHEN** un utilisateur connecté ouvre l'écran d'inscription/connexion
- **THEN** il est redirigé vers l'accueil

### Requirement: Rattachement automatique à une entreprise
Le système SHALL rattacher chaque utilisateur à une entreprise : à l'ouverture de sa première session (juste après l'inscription), s'il n'est membre d'aucune entreprise, une entreprise est créée et il en devient le gérant.

#### Scenario: Première session
- **WHEN** un utilisateur sans entreprise ouvre sa première session, juste après son inscription
- **THEN** une entreprise est créée et l'utilisateur en est membre avec le rôle « gérant »

#### Scenario: Connexions suivantes
- **WHEN** un utilisateur déjà membre d'une entreprise se connecte
- **THEN** aucune nouvelle entreprise n'est créée

### Requirement: Isolation des données entre entreprises
Le système MUST empêcher un utilisateur de lire ou de modifier les données d'une entreprise dont il n'est pas membre, y compris en appelant directement la base avec la clé publique.

#### Scenario: Accès aux données d'une autre entreprise
- **GIVEN** deux comptes appartenant à deux entreprises différentes
- **WHEN** le second compte tente de lire ou d'enregistrer une dépense de la première entreprise
- **THEN** la base ne renvoie aucune donnée de la première entreprise et refuse l'écriture

#### Scenario: Accès sans connexion
- **WHEN** une requête non authentifiée tente de lire ou d'écrire des dépenses
- **THEN** la base ne renvoie aucune donnée et refuse l'écriture
