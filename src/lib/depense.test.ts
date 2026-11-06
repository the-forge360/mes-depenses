import { describe, expect, it } from 'vitest'
import { schemaDepense, type SaisieDepense } from './depense'

const AUJOURDHUI = '2026-11-06'

const valide: SaisieDepense = {
  date: AUJOURDHUI,
  montant: '15000',
  categorie: 'fixe',
  description: 'Loyer du bureau',
}

/** Valide une saisie et renvoie les messages d'erreur par champ. */
function erreurs(saisie: Partial<SaisieDepense>) {
  const resultat = schemaDepense(AUJOURDHUI).safeParse({ ...valide, ...saisie })
  if (resultat.success) return {}
  return Object.fromEntries(resultat.error.issues.map((i) => [i.path[0], i.message]))
}

describe('schemaDepense', () => {
  it('accepte une dépense valide', () => {
    expect(schemaDepense(AUJOURDHUI).parse(valide)).toEqual({
      date: AUJOURDHUI,
      montant: 15000,
      categorie: 'fixe',
      description: 'Loyer du bureau',
    })
  })

  describe('date', () => {
    it('accepte aujourd’hui et une date passée', () => {
      expect(erreurs({ date: AUJOURDHUI })).toEqual({})
      expect(erreurs({ date: '2026-01-31' })).toEqual({})
    })

    it('refuse une date dans le futur', () => {
      expect(erreurs({ date: '2026-11-07' })).toEqual({
        date: 'La date ne peut pas être dans le futur.',
      })
    })

    it('refuse une date absente', () => {
      expect(erreurs({ date: '' })).toEqual({ date: 'La date est obligatoire.' })
    })
  })

  describe('montant', () => {
    it('ignore les espaces : « 1 250 000 » → 1250000', () => {
      expect(schemaDepense(AUJOURDHUI).parse({ ...valide, montant: '1 250 000' }).montant).toBe(
        1250000,
      )
    })

    it('ignore aussi les espaces insécables', () => {
      expect(schemaDepense(AUJOURDHUI).parse({ ...valide, montant: '1 250 000' }).montant).toBe(
        1250000,
      )
    })

    it.each(['0', '-500'])('refuse « %s » (nul ou négatif)', (montant) => {
      expect(erreurs({ montant })).toEqual({ montant: 'Le montant doit être supérieur à 0.' })
    })

    it.each(['1250,5', '12.5', 'mille', '1e3'])('refuse « %s » (virgule ou lettres)', (montant) => {
      expect(erreurs({ montant })).toEqual({
        montant: 'Le montant doit être un nombre entier, sans virgule.',
      })
    })

    it.each(['', '   '])('refuse un montant absent (« %s »)', (montant) => {
      expect(erreurs({ montant })).toEqual({ montant: 'Le montant est obligatoire.' })
    })

    it('refuse un montant au-delà de la capacité de la base', () => {
      expect(erreurs({ montant: '3000000000' })).toEqual({ montant: 'Le montant est trop élevé.' })
    })
  })

  describe('catégorie', () => {
    it.each(['abonnement', 'fixe', 'salaires'])('accepte « %s »', (categorie) => {
      expect(erreurs({ categorie })).toEqual({})
    })

    it.each(['', 'transport'])('refuse « %s »', (categorie) => {
      expect(erreurs({ categorie })).toEqual({ categorie: 'Choisissez une catégorie.' })
    })
  })

  describe('description', () => {
    it('vide → enregistrée sans description (null)', () => {
      expect(schemaDepense(AUJOURDHUI).parse({ ...valide, description: '  ' }).description).toBeNull()
    })

    it('accepte 100 caractères, refuse 101', () => {
      expect(erreurs({ description: 'a'.repeat(100) })).toEqual({})
      expect(erreurs({ description: 'a'.repeat(101) })).toEqual({
        description: 'La description ne doit pas dépasser 100 caractères.',
      })
    })
  })

  it('signale toutes les erreurs à la fois', () => {
    expect(Object.keys(erreurs({ date: '', montant: '', categorie: '' }))).toEqual([
      'date',
      'montant',
      'categorie',
    ])
  })
})
