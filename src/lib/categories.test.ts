import { describe, expect, it } from 'vitest'
import { totauxParCategorie } from './categories'

describe('totauxParCategorie', () => {
  it('exemple de la spec : totaux et parts, dans l’ordre Abonnement, Fixe, Salaires', () => {
    const resultat = totauxParCategorie([
      { categorie: 'salaires', montant: 150_000 },
      { categorie: 'fixe', montant: 40_000 },
      { categorie: 'salaires', montant: 50_000 },
      { categorie: 'abonnement', montant: 10_000 },
    ])
    expect(resultat).toEqual([
      { categorie: 'abonnement', libelle: 'Abonnement', montant: 10_000, part: 0.04 },
      { categorie: 'fixe', libelle: 'Fixe', montant: 40_000, part: 0.16 },
      { categorie: 'salaires', libelle: 'Salaires', montant: 200_000, part: 0.8 },
    ])
  })

  it('catégorie sans dépense : présente, à 0', () => {
    const [abonnement] = totauxParCategorie([{ categorie: 'fixe', montant: 1000 }])
    expect(abonnement).toEqual({ categorie: 'abonnement', libelle: 'Abonnement', montant: 0, part: 0 })
  })

  it('liste vide : trois entrées à 0, sans division par zéro', () => {
    const resultat = totauxParCategorie([])
    expect(resultat.map((t) => [t.categorie, t.montant, t.part])).toEqual([
      ['abonnement', 0, 0],
      ['fixe', 0, 0],
      ['salaires', 0, 0],
    ])
  })
})
