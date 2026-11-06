import { describe, expect, it } from 'vitest'
import {
  bornesDuMois,
  libelleMois,
  lireMois,
  moisCourant,
  moisDeLaDate,
  moisPrecedent,
  moisSuivant,
} from './mois'

// Les tests tournent dans le fuseau Africa/Douala (UTC+1), fixé dans vite.config.ts.
const LE_6_NOVEMBRE = new Date(2026, 10, 6, 10, 0)

describe('moisCourant', () => {
  it('renvoie le mois local au format AAAA-MM', () => {
    expect(moisCourant(LE_6_NOVEMBRE)).toBe('2026-11')
  })

  it('à 0 h 30 le 1er novembre (UTC+1), renvoie novembre et non octobre (UTC)', () => {
    const minuitTrente = new Date('2026-10-31T23:30:00Z') // = 1er nov. 0 h 30 à Douala
    expect(moisCourant(minuitTrente)).toBe('2026-11')
  })
})

describe('lireMois', () => {
  it('sans paramètre : mois en cours', () => {
    expect(lireMois(null, LE_6_NOVEMBRE)).toBe('2026-11')
  })

  it.each(['2026-13', '2026-00', 'abc', '2026-1', '', '2026-11-01'])(
    'valeur mal formée « %s » : mois en cours',
    (valeur) => {
      expect(lireMois(valeur, LE_6_NOVEMBRE)).toBe('2026-11')
    },
  )

  it('mois futur : mois en cours', () => {
    expect(lireMois('2026-12', LE_6_NOVEMBRE)).toBe('2026-11')
    expect(lireMois('2027-01', LE_6_NOVEMBRE)).toBe('2026-11')
  })

  it('mois passé valide : conservé', () => {
    expect(lireMois('2025-09', LE_6_NOVEMBRE)).toBe('2025-09')
  })

  it('mois en cours : conservé', () => {
    expect(lireMois('2026-11', LE_6_NOVEMBRE)).toBe('2026-11')
  })
})

describe('moisPrecedent et moisSuivant', () => {
  it('passent d’un mois à l’autre dans la même année', () => {
    expect(moisPrecedent('2026-11')).toBe('2026-10')
    expect(moisSuivant('2026-10')).toBe('2026-11')
  })

  it('janvier → décembre de l’année précédente', () => {
    expect(moisPrecedent('2026-01')).toBe('2025-12')
  })

  it('décembre → janvier de l’année suivante', () => {
    expect(moisSuivant('2026-12')).toBe('2027-01')
  })
})

describe('bornesDuMois', () => {
  it('novembre : du 1er novembre inclus au 1er décembre exclu', () => {
    expect(bornesDuMois('2026-11')).toEqual({ debut: '2026-11-01', finExclue: '2026-12-01' })
  })

  it('décembre : la borne de fin passe à l’année suivante', () => {
    expect(bornesDuMois('2026-12')).toEqual({ debut: '2026-12-01', finExclue: '2027-01-01' })
  })
})

describe('moisDeLaDate', () => {
  it('extrait le mois d’une date AAAA-MM-JJ', () => {
    expect(moisDeLaDate('2026-10-28')).toBe('2026-10')
  })
})

describe('libelleMois', () => {
  it('nomme le mois en toutes lettres, en français', () => {
    expect(libelleMois('2026-11')).toBe('novembre 2026')
    expect(libelleMois('2025-12')).toBe('décembre 2025')
  })
})
