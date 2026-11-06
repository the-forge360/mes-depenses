import { describe, expect, it } from 'vitest'
import { calculerTotal, formaterDateCourte, formaterMontant } from './format'

/** Remplace les espaces insécables (U+00A0, U+202F) par des espaces simples. */
const espacesSimples = (texte: string) => texte.replace(/[  ]/g, ' ')

describe('formaterMontant', () => {
  it('met une espace tous les trois chiffres, suivie de FCFA', () => {
    expect(espacesSimples(formaterMontant(1_250_000))).toBe('1 250 000 FCFA')
  })

  it('petit montant', () => {
    expect(espacesSimples(formaterMontant(500))).toBe('500 FCFA')
  })

  it('zéro', () => {
    expect(espacesSimples(formaterMontant(0))).toBe('0 FCFA')
  })

  it('n’utilise que des espaces insécables (pas de coupure de ligne)', () => {
    expect(formaterMontant(1_250_000)).not.toContain(' ')
  })
})

describe('formaterDateCourte', () => {
  it('jour et mois abrégé en français', () => {
    expect(espacesSimples(formaterDateCourte('2026-11-06'))).toBe('6 nov.')
  })

  it('1er du mois : pas de décalage vers la veille', () => {
    expect(espacesSimples(formaterDateCourte('2026-12-01'))).toBe('1 déc.')
  })
})

describe('calculerTotal', () => {
  it('additionne les montants', () => {
    expect(
      calculerTotal([{ montant: 1_250_000 }, { montant: 15_000 }, { montant: 500 }]),
    ).toBe(1_265_500)
  })

  it('liste vide : 0', () => {
    expect(calculerTotal([])).toBe(0)
  })
})
