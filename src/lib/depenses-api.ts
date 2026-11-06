import type { SupabaseClient } from '@supabase/supabase-js'
import type { Depense } from './depense'
import { bornesDuMois, type Mois } from './mois'

/** Dépense telle que lue dans la base. */
export type DepenseEnregistree = Depense & { id: string }

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

/**
 * Dépenses d'une entreprise pour un mois, de la plus récente à la plus
 * ancienne (à date égale, la dernière saisie d'abord). Une seule requête :
 * le total est calculé dans l'app.
 */
export async function listerDepensesDuMois(
  client: SupabaseClient,
  entrepriseId: string,
  mois: Mois,
): Promise<DepenseEnregistree[]> {
  const { debut, finExclue } = bornesDuMois(mois)
  const { data, error } = await client
    .from('depenses')
    .select('id, date, montant, categorie, description')
    .eq('entreprise_id', entrepriseId)
    .gte('date', debut)
    .lt('date', finExclue)
    .order('date', { ascending: false })
    .order('cree_le', { ascending: false })
  if (error) throw error
  return data as DepenseEnregistree[]
}
