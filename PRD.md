# Cahier des charges — App de suivi de dépenses

## 1. Le problème
Le gérant note ses dépenses de façon dispersée (cahier, reçus, messages). En fin de mois, il ne sait pas combien il a dépensé ni dans quelle catégorie, et il ne peut pas repérer les dépenses à réduire.

## 2. Pour qui
Le gérant d'une petite entreprise (1 à 10 salariés). Il est à l'aise avec son téléphone mais pas avec les tableurs. Il enregistre et consulte lui-même ses dépenses, depuis son téléphone ou son ordinateur.

## 3. Contraintes générales
- Application web, utilisable confortablement sur téléphone et sur ordinateur
- Tout en français
- Montants en FCFA, nombres entiers, sans centimes
- Design simple, clair et aéré

## 4. Les écrans

### Écran 1 — Accueil
- Filtre du mois en haut (mois en cours par défaut)
- Total du mois en gros
- Graphique qui compare les 3 catégories
- Liste des dépenses du mois ; chaque ligne peut être modifiée ou supprimée
- Gros bouton « + Ajouter une dépense »

### Écran 2 — Formulaire
- Champs : date, montant, catégorie, description
- Bouton « Enregistrer »
- Le même formulaire sert à modifier une dépense

## 5. Informations à enregistrer

| Information | Obligatoire | Règle |
| --- | --- | --- |
| Date | Oui | Aujourd'hui par défaut |
| Montant (FCFA) | Oui | Nombre entier |
| Catégorie | Oui | Abonnement, fixe ou salaires |
| Description | Non | 100 caractères maximum |

## 6. Règles et calculs
- Total du mois = somme de toutes les dépenses du mois choisi (du 1er au dernier jour)
- Le graphique affiche le total de chaque catégorie pour ce mois
- Le montant doit être supérieur à 0, sinon l'app refuse et affiche un message
- Une date dans le futur est refusée
- La suppression demande une confirmation : « Voulez-vous vraiment supprimer cette dépense ? »
- Les montants s'affichent avec un espace tous les 3 chiffres : 1 250 000 FCFA

## 7. Répartition des versions

### MVP
- Ajouter une dépense (date, montant en FCFA, catégorie, description)
- Modifier ou supprimer une dépense
- Liste des dépenses du mois
- Total du mois
- Graphique des 3 catégories
- Filtre par mois

### V1
- Export Excel ou PDF
-  Invitation d'un collaborateur
- Dépenses récurrentes
- Comparaison avec le mois précédent
- Fonctionnement avec un réseau faible


### V2
- Entrées d'argent et solde du mois
- Budget par catégorie avec alerte
- Photo du reçu

### Hors périmètre
- Moyen de paiement
- Rappel de saisie par WhatsApp
- Catégories personnalisées
- Saisie par la voix ou par WhatsApp avec l'IA
- Connexion à Wave ou Orange Money
- Comptabilité complète

## 8. Critères de réussite
Après 1 mois d'utilisation :
- Le gérant ajoute une dépense en moins de 30 secondes depuis son téléphone
- Il enregistre au moins 90 % de ses dépenses dans l'app (plus de cahier)
- Il connaît son total du mois en 1 coup d'œil, sans calcul
- Il a repéré au moins 1 dépense à réduire grâce au graphique