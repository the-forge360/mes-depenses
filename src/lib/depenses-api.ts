import type { SupabaseClient } from '@supabase/supabase-js'
import type { Depense } from './depense'

/** Ligne envoyée à la table `depenses` (cree_par est rempli par la base). */
export type NouvelleLigneDepense = Depense & {
  id: string
  entreprise_id: string
}

/** Code PostgreSQL « violation d'unicité » : ici, l'identifiant existe déjà. */
const DEJA_ENREGISTREE = '23505'

/**
 * Enregistre une dépense. Idempotent : si un envoi précédent a abouti sans que
 * la réponse arrive (réseau instable), le nouvel essai bute sur l'identifiant
 * déjà présent, ce qui signifie que la dépense est bien enregistrée.
 */
export async function ajouterDepense(
  client: SupabaseClient,
  ligne: NouvelleLigneDepense,
): Promise<void> {
  const { error } = await client.from('depenses').insert(ligne)
  if (error && error.code !== DEJA_ENREGISTREE) throw error
}
