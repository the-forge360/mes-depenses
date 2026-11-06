import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/lib/contexte-session'

/** Écrans réservés aux utilisateurs connectés : sinon, vers l'écran inscription/connexion. */
export function RouteConnectee() {
  const { session } = useSession()
  return session ? <Outlet /> : <Navigate to="/connexion" replace />
}

/** Écran inscription/connexion : un utilisateur déjà connecté est envoyé à l'accueil. */
export function RoutePublique() {
  const { session } = useSession()
  return session ? <Navigate to="/" replace /> : <Outlet />
}
