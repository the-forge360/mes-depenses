import { CATEGORIES, type Categorie } from './depense'
import { calculerTotal } from './format'

export type TotalCategorie = {
  categorie: Categorie
  libelle: string
  montant: number
  /** Part du total du mois, entre 0 et 1 (0 si le total est nul). */
  part: number
}

/**
 * Total et part de chaque catégorie, toujours dans l'ordre de CATEGORIES
 * (Abonnement, Fixe, Salaires), même pour une catégorie sans dépense.
 */
export function totauxParCategorie(
  depenses: readonly { categorie: string; montant: number }[],
): TotalCategorie[] {
  const total = calculerTotal(depenses)
  return CATEGORIES.map(({ valeur, libelle }) => {
    const montant = calculerTotal(depenses.filter((d) => d.categorie === valeur))
    return { categorie: valeur, libelle, montant, part: total === 0 ? 0 : montant / total }
  })
}
