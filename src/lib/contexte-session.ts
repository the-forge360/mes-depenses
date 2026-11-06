import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

/**
 * Soit personne n'est connecté, soit l'utilisateur est connecté ET rattaché
 * à une entreprise. Les états intermédiaires (chargement, erreur) sont gérés
 * par FournisseurSession et ne sont jamais exposés aux écrans.
 */
export type EtatSession =
  | { session: null; entrepriseId: null }
  | { session: Session; entrepriseId: string }

export const ContexteSession = createContext<EtatSession | null>(null)

export function useSession(): EtatSession {
  const etat = useContext(ContexteSession)
  if (!etat) throw new Error('useSession doit être utilisé dans <FournisseurSession>.')
  return etat
}

/** Pour les écrans réservés aux utilisateurs connectés (sous RouteConnectee). */
export function useSessionConnectee() {
  const etat = useSession()
  if (!etat.session) throw new Error('Écran réservé aux utilisateurs connectés.')
  return etat
}
