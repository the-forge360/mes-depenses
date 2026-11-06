const formatNombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const formatDateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

/**
 * 1250000 → « 1 250 000 FCFA ». Intl sépare les milliers par une espace fine
 * insécable ; l'espace avant « FCFA » est insécable aussi : un montant n'est
 * jamais coupé en fin de ligne.
 */
export function formaterMontant(montant: number): string {
  return `${formatNombre.format(montant)} FCFA`
}

/** « 2026-11-06 » → « 6 nov. » (date locale, sans passer par l'UTC). */
export function formaterDateCourte(date: string): string {
  const [annee, mois, jour] = date.split('-').map(Number)
  return formatDateCourte.format(new Date(annee, mois - 1, jour))
}

/** Somme des montants (entiers en FCFA). */
export function calculerTotal(depenses: readonly { montant: number }[]): number {
  return depenses.reduce((total, depense) => total + depense.montant, 0)
}
