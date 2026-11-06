import { aujourdhuiLocal } from './dates'

/** Un mois au format AAAA-MM, par exemple « 2026-11 ». */
export type Mois = string

const FORMAT_MOIS = /^(\d{4})-(0[1-9]|1[0-2])$/

const deuxChiffres = (n: number) => String(n).padStart(2, '0')

function decomposer(mois: Mois): [annee: number, numero: number] {
  const [annee, numero] = mois.split('-').map(Number)
  return [annee, numero]
}

function composer(annee: number, numero: number): Mois {
  return `${annee}-${deuxChiffres(numero)}`
}

/** Mois en cours selon l'heure LOCALE de l'appareil. */
export function moisCourant(maintenant: Date = new Date()): Mois {
  return aujourdhuiLocal(maintenant).slice(0, 7)
}

/**
 * Mois à afficher d'après le paramètre `?mois=` de l'adresse : la valeur si
 * elle est bien formée et pas dans le futur, sinon le mois en cours.
 */
export function lireMois(parametre: string | null, maintenant: Date = new Date()): Mois {
  const courant = moisCourant(maintenant)
  if (!parametre || !FORMAT_MOIS.test(parametre)) return courant
  // Les chaînes AAAA-MM se comparent dans l'ordre chronologique.
  return parametre > courant ? courant : parametre
}

export function moisPrecedent(mois: Mois): Mois {
  const [annee, numero] = decomposer(mois)
  return numero === 1 ? composer(annee - 1, 12) : composer(annee, numero - 1)
}

export function moisSuivant(mois: Mois): Mois {
  const [annee, numero] = decomposer(mois)
  return numero === 12 ? composer(annee + 1, 1) : composer(annee, numero + 1)
}

/**
 * Bornes d'un mois pour filtrer les dépenses : `date >= debut` et
 * `date < finExclue` (évite de calculer le dernier jour du mois).
 */
export function bornesDuMois(mois: Mois): { debut: string; finExclue: string } {
  return { debut: `${mois}-01`, finExclue: `${moisSuivant(mois)}-01` }
}

/** Mois d'une date AAAA-MM-JJ. */
export function moisDeLaDate(date: string): Mois {
  return date.slice(0, 7)
}

const formatMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

/** « 2026-11 » → « novembre 2026 ». */
export function libelleMois(mois: Mois): string {
  const [annee, numero] = decomposer(mois)
  return formatMois.format(new Date(annee, numero - 1, 1))
}
