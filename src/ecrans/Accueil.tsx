import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { exigerSupabase } from '@/lib/supabase'

/** Accueil minimal : sera complété par la liste, le total et le graphique. */
export function Accueil() {
  const location = useLocation()
  const navigate = useNavigate()
  const [message] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )

  // Efface le message de l'historique : il ne réapparaît pas après un rafraîchissement.
  useEffect(() => {
    if (location.state) navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-8 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Mes dépenses</h1>
        <Button variant="ghost" onClick={() => exigerSupabase().auth.signOut()}>
          Se déconnecter
        </Button>
      </header>

      {message && (
        <p
          role="status"
          className="rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-center font-medium text-green-800 dark:text-green-300"
        >
          ✓ {message}
        </p>
      )}

      <Link
        to="/depenses/nouvelle"
        className={cn(buttonVariants(), 'h-14 w-full text-lg')}
      >
        + Ajouter une dépense
      </Link>
    </main>
  )
}
