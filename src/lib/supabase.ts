import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clePublique = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Client unique, avec session persistante (le gérant se connecte une seule fois).
// Reste `null` tant que .env.local n'est pas rempli.
export const supabase =
  url && clePublique ? createClient(url, clePublique) : null

/** Client Supabase, pour le code qui ne s'exécute qu'une fois l'app configurée. */
export function exigerSupabase() {
  if (!supabase) throw new Error('Supabase n’est pas configuré (.env.local manquant).')
  return supabase
}
