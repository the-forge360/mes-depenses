import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { ajouterDepense, type NouvelleLigneDepense } from './depenses-api'

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
