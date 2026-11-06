import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import {
  ajouterDepense,
  DepenseIntrouvable,
  lireDepense,
  listerDepensesDuMois,
  modifierDepense,
  supprimerDepense,
  type NouvelleLigneDepense,
} from './depenses-api'

const ligne: NouvelleLigneDepense = {
  id: '00000000-0000-4000-8000-000000000001',
  entreprise_id: '00000000-0000-4000-8000-0000000000aa',
  date: '2026-11-06',
  montant: 15000,
  categorie: 'fixe',
  description: null,
}

/** Faux client Supabase dont l'insert renvoie l'erreur donnée. */
function clientSimule(error: { code: string; message: string } | null) {
  const insert = vi.fn().mockResolvedValue({ error })
  const from = vi.fn().mockReturnValue({ insert })
  return { client: { from } as unknown as SupabaseClient, from, insert }
}

describe('ajouterDepense', () => {
  it('insère la ligne dans la table depenses', async () => {
    const { client, from, insert } = clientSimule(null)
    await ajouterDepense(client, ligne)
    expect(from).toHaveBeenCalledWith('depenses')
    expect(insert).toHaveBeenCalledWith(ligne)
  })

  it('identifiant déjà présent (23505) : succès, pas de doublon ni d’erreur', async () => {
    const { client } = clientSimule({ code: '23505', message: 'duplicate key' })
    await expect(ajouterDepense(client, ligne)).resolves.toBeUndefined()
  })

  it('autre erreur : propagée', async () => {
    const erreur = { code: '42501', message: 'row-level security' }
    const { client } = clientSimule(erreur)
    await expect(ajouterDepense(client, ligne)).rejects.toBe(erreur)
  })
})

/** Faux client Supabase pour une lecture : enregistre chaque appel de la chaîne. */
function clientLecture(resultat: { data: unknown; error: unknown }) {
  const appels: [string, ...unknown[]][] = []
  const requete: Record<string, unknown> = {}
  for (const methode of ['select', 'eq', 'gte', 'lt', 'order']) {
    requete[methode] = (...args: unknown[]) => {
      appels.push([methode, ...args])
      return requete
    }
  }
  // La requête est « attendable » (await) comme celle de supabase-js.
  requete.then = (ok: (r: unknown) => unknown, ko: (e: unknown) => unknown) =>
    Promise.resolve(resultat).then(ok, ko)
  const from = vi.fn().mockReturnValue(requete)
  return { client: { from } as unknown as SupabaseClient, from, appels }
}

describe('listerDepensesDuMois', () => {
  const lignes = [
    { id: 'b', date: '2026-11-15', montant: 15000, categorie: 'fixe', description: null },
    { id: 'a', date: '2026-11-02', montant: 500, categorie: 'abonnement', description: 'Box' },
  ]

  it('lit les dépenses de l’entreprise pour le mois, triées de la plus récente à la plus ancienne', async () => {
    const { client, from, appels } = clientLecture({ data: lignes, error: null })
    const resultat = await listerDepensesDuMois(client, 'entreprise-1', '2026-11')

    expect(from).toHaveBeenCalledWith('depenses')
    expect(appels).toEqual([
      ['select', 'id, date, montant, categorie, description'],
      ['eq', 'entreprise_id', 'entreprise-1'],
      ['gte', 'date', '2026-11-01'],
      ['lt', 'date', '2026-12-01'],
      ['order', 'date', { ascending: false }],
      ['order', 'cree_le', { ascending: false }],
    ])
    expect(resultat).toEqual(lignes)
  })

  it('erreur de lecture : propagée', async () => {
    const erreur = { code: 'PGRST301', message: 'erreur réseau' }
    const { client } = clientLecture({ data: null, error: erreur })
    await expect(listerDepensesDuMois(client, 'entreprise-1', '2026-11')).rejects.toBe(erreur)
  })
})

/** Faux client générique : enregistre la chaîne d'appels, puis renvoie `resultat` à l'await. */
function clientChaine(resultat: { data: unknown; error: unknown }) {
  const appels: [string, ...unknown[]][] = []
  const requete: Record<string, unknown> = new Proxy(
    {},
    {
      get(_cible, methode: string) {
        if (methode === 'then') {
          return (ok: (r: unknown) => unknown, ko: (e: unknown) => unknown) =>
            Promise.resolve(resultat).then(ok, ko)
        }
        return (...args: unknown[]) => {
          appels.push([methode, ...args])
          return requete
        }
      },
    },
  )
  const from = vi.fn().mockReturnValue(requete)
  return { client: { from } as unknown as SupabaseClient, from, appels }
}

const depense = {
  date: '2026-11-03',
  montant: 20000,
  categorie: 'fixe' as const,
  description: 'Loyer',
}

const ID = '92d97ce6-44b0-4cfe-8ecb-647338aa587b'

describe('lireDepense', () => {
  it('identifiant mal formé : null, sans requête', async () => {
    const { client, from } = clientChaine({ data: null, error: null })
    await expect(lireDepense(client, 'pas-un-uuid')).resolves.toBeNull()
    expect(from).not.toHaveBeenCalled()
  })

  it('lit une dépense par son identifiant', async () => {
    const ligne = { id: ID, ...depense }
    const { client, from, appels } = clientChaine({ data: ligne, error: null })
    await expect(lireDepense(client, ID)).resolves.toEqual(ligne)
    expect(from).toHaveBeenCalledWith('depenses')
    expect(appels).toEqual([
      ['select', 'id, date, montant, categorie, description'],
      ['eq', 'id', ID],
      ['maybeSingle'],
    ])
  })

  it('introuvable (ou autre entreprise) : null', async () => {
    const { client } = clientChaine({ data: null, error: null })
    await expect(lireDepense(client, '00000000-0000-4000-8000-000000000000')).resolves.toBeNull()
  })

  it('erreur : propagée', async () => {
    const erreur = { code: 'PGRST000', message: 'réseau' }
    const { client } = clientChaine({ data: null, error: erreur })
    await expect(lireDepense(client, ID)).rejects.toBe(erreur)
  })
})

describe('modifierDepense', () => {
  it('envoie seulement les champs modifiables, filtre sur l’identifiant', async () => {
    const { client, appels } = clientChaine({ data: [{ id: 'd1' }], error: null })
    await modifierDepense(client, 'd1', depense)
    expect(appels).toEqual([
      ['update', { date: '2026-11-03', montant: 20000, categorie: 'fixe', description: 'Loyer' }],
      ['eq', 'id', 'd1'],
      ['select', 'id'],
    ])
    const envoye = appels[0][1] as Record<string, unknown>
    expect(envoye).not.toHaveProperty('entreprise_id')
    expect(envoye).not.toHaveProperty('cree_par')
  })

  it('aucune ligne modifiée : DepenseIntrouvable', async () => {
    const { client } = clientChaine({ data: [], error: null })
    await expect(modifierDepense(client, 'd1', depense)).rejects.toBeInstanceOf(DepenseIntrouvable)
  })

  it('erreur : propagée', async () => {
    const erreur = { code: '23514', message: 'check' }
    const { client } = clientChaine({ data: null, error: erreur })
    await expect(modifierDepense(client, 'd1', depense)).rejects.toBe(erreur)
  })
})

describe('supprimerDepense', () => {
  it('supprime par identifiant', async () => {
    const { client, appels } = clientChaine({ data: null, error: null })
    await supprimerDepense(client, 'd1')
    expect(appels).toEqual([['delete'], ['eq', 'id', 'd1']])
  })

  it('déjà supprimée (aucune ligne) : succès', async () => {
    const { client } = clientChaine({ data: [], error: null })
    await expect(supprimerDepense(client, 'd1')).resolves.toBeUndefined()
  })

  it('erreur : propagée', async () => {
    const erreur = { code: 'PGRST000', message: 'réseau' }
    const { client } = clientChaine({ data: null, error: erreur })
    await expect(supprimerDepense(client, 'd1')).rejects.toBe(erreur)
  })
})
