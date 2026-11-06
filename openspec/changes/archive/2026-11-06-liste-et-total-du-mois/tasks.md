# Tâches — Liste et total du mois

## 1. Fonctions pures

- [x] 1.1 Créer `src/lib/mois.ts` (`moisCourant`, `lireMois`, `moisPrecedent`, `moisSuivant`, `bornesDuMois`, `moisDeLaDate`, `libelleMois`) selon le design §1. Vérification : `src/lib/mois.test.ts` couvre le passage janvier → décembre de l'année précédente et décembre → janvier, les bornes de novembre (`2026-11-01` / `2026-12-01`) et de décembre (`2026-12-01` / `2027-01-01`), `lireMois` avec `null`, `2026-13`, `abc`, un mois futur et un mois passé valide, `moisCourant` à 0 h 30 le 1er novembre en UTC+1 (TZ fixée), et `libelleMois('2026-11')` = « novembre 2026 » ; `npm test` passe.
- [x] 1.2 Créer `src/lib/format.ts` (`formaterMontant`, `formaterDateCourte`, `calculerTotal`) selon le design §6. Vérification : `src/lib/format.test.ts`, espaces normalisés, vérifie « 1 250 000 FCFA », « 500 FCFA », « 0 FCFA », « 6 nov. », un total de 1 265 500 pour 1 250 000 + 15 000 + 500, et 0 pour une liste vide ; `npm test` passe.

## 2. Lecture des dépenses

- [x] 2.1 Ajouter `listerDepensesDuMois(client, entrepriseId, mois)` et le type `DepenseEnregistree` dans `src/lib/depenses-api.ts` (design §3). Vérification : `src/lib/depenses-api.test.ts`, avec un client simulé, montre la table `depenses`, les colonnes lues, le filtre `entreprise_id`, `gte('date', '2026-11-01')`, `lt('date', '2026-12-01')`, le tri `date` puis `cree_le` décroissants, le renvoi des lignes, et la propagation d'une erreur ; `npm test` passe.

## 3. Interface de l'accueil

- [x] 3.1 Créer `src/composants/FiltreMois.tsx` (design §7). Vérification manuelle : le libellé affiche le mois en français, « › » est désactivé sur le mois en cours, les deux boutons ont un nom accessible et sont utilisables au clavier.
- [x] 3.2 Créer `src/composants/ListeDepenses.tsx` (design §7). Vérification manuelle : une ligne avec description montre date, catégorie, description et montant ; une ligne sans description n'affiche ni texte vide ni tiret ; les montants sont alignés à droite.
- [x] 3.3 Réécrire `src/ecrans/Accueil.tsx` : mois lu dans l'adresse avec `useSearchParams`, navigation précédent/suivant sans `replace`, requête TanStack Query `['depenses', entrepriseId, mois]` sans `placeholderData`, total en gros, états chargement / erreur avec « Réessayer » / vide, bouton d'ajout au-dessus de la liste, bandeau « Dépense enregistrée » conservé et effacé de l'historique **sans perdre `?mois=`** (design §4–5, §7). Vérification : `npm run build` passe, puis vérification manuelle des scénarios « Choix du mois affiché », « Mois conservé dans l'adresse », « Total du mois » et « Chargement et erreur de lecture » de la spec.
- [x] 3.4 Dans `src/ecrans/NouvelleDepense.tsx`, naviguer après succès vers `/?mois=<moisDeLaDate(date)>` avec le message (design §5). Vérification manuelle : une dépense datée du mois passé ramène l'accueil sur ce mois, avec la dépense dans la liste, le total à jour et le bandeau ; une dépense du mois en cours apparaît sans rafraîchir la page.

## 4. Vérifications d'ensemble

- [x] 4.1 `npm run build`, `npm test` et `npm run lint` passent sans erreur.
- [x] 4.2 Parcours dans le navigateur avec des dépenses de test datées du 31 octobre, du 1er, du 9, du 15 et du 30 novembre : seules celles de novembre sont listées, dans l'ordre décroissant, avec le bon total ; le rafraîchissement et le retour arrière gardent le mois ; une coupure réseau simulée affiche le message d'erreur puis « Réessayer » recharge. Les données de test sont supprimées ensuite.
- [x] 4.3 Isolation : un second compte ne voit ni les dépenses ni le total de la première entreprise, pour aucun mois.
- [x] 4.4 Sur téléphone (largeur 360 px) : total lisible sans zoom, liste sans défilement horizontal, boutons de mois faciles à toucher.

## Workflow follow-up

- Archiver le changement (`/opsx:archive`) une fois les vérifications faites, pour fusionner les nouvelles exigences dans la spec principale `depenses`.
