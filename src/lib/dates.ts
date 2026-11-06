const deuxChiffres = (n: number) => String(n).padStart(2, '0')

/**
 * Date du jour au format AAAA-MM-JJ, selon l'heure LOCALE de l'appareil.
 * Ne jamais utiliser toISOString() : elle travaille en UTC, et une dépense
 * saisie entre minuit et 1 h (UTC+1) serait datée de la veille.
 */
export function aujourdhuiLocal(maintenant: Date = new Date()): string {
  return [
    maintenant.getFullYear(),
    deuxChiffres(maintenant.getMonth() + 1),
    deuxChiffres(maintenant.getDate()),
  ].join('-')
}
