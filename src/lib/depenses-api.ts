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

const COLONNES = 'id, date, montant, categorie, description'
const FORMAT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** La dépense n'existe pas, a été supprimée, ou n'est pas visible (autre entreprise). */
export class DepenseIntrouvable extends Error {
  constructor() {
    super('Cette dépense n’existe pas ou a été supprimée.')
    this.name = 'DepenseIntrouvable'
  }
}

/**
 * Une dépense par son identifiant, ou `null` si elle est introuvable. La RLS
 * rend invisible une dépense d'une autre entreprise : même résultat, rien n'est révélé.
 */
export async function lireDepense(
  client: SupabaseClient,
  id: string,
): Promise<DepenseEnregistree | null> {
  // Adresse mal formée (/depenses/abc) : introuvable, sans requête
  // (Postgres répondrait par une erreur de type, affichée comme un échec réseau).
  if (!FORMAT_UUID.test(id)) return null
  const { data, error } = await client.from('depenses').select(COLONNES).eq('id', id).maybeSingle()
  if (error) throw error
  return data as DepenseEnregistree | null
}

/**
 * Enregistre les nouvelles valeurs d'une dépense. N'envoie ni l'entreprise ni
 * l'auteur ; `modifie_le` est mis à jour par la base. Lève DepenseIntrouvable
 * si aucune ligne n'a été modifiée (un update ne recrée jamais la dépense).
 */
export async function modifierDepense(
  client: SupabaseClient,
  id: string,
  depense: Depense,
): Promise<void> {
  const { date, montant, categorie, description } = depense
  const { data, error } = await client
    .from('depenses')
    .update({ date, montant, categorie, description })
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) throw new DepenseIntrouvable()
}

/**
 * Supprime une dépense. Si elle n'existe déjà plus, c'est un succès : le
 * résultat voulu est atteint (utile après une réponse perdue).
 */
export async function supprimerDepense(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('depenses').delete().eq('id', id)
  if (error) throw error
}
