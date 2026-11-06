import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { ajouterDepense, listerDepensesDuMois, type NouvelleLigneDepense } from './depenses-api'

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
