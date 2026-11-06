import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { FiltreMois } from '@/composants/FiltreMois'
import { ListeDepenses } from '@/composants/ListeDepenses'
import { useSessionConnectee } from '@/lib/contexte-session'
import { listerDepensesDuMois } from '@/lib/depenses-api'
import { calculerTotal, formaterMontant } from '@/lib/format'
import { lireMois, type Mois } from '@/lib/mois'
import { exigerSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/** Accueil : choix du mois, total, bouton d'ajout et liste des dépenses du mois. */
export function Accueil() {
  const { entrepriseId } = useSessionConnectee()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const mois = lireMois(searchParams.get('mois'))

  const [message] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )

  // Efface le message de l'historique (il ne réapparaît pas après un
  // rafraîchissement) en gardant le mois choisi dans l'adresse.
  useEffect(() => {
    if (location.state) navigate({ search: location.search }, { replace: true, state: null })
  }, [location.state, location.search, navigate])

  const depenses = useQuery({
    queryKey: ['depenses', entrepriseId, mois],
    queryFn: () => listerDepensesDuMois(exigerSupabase(), entrepriseId, mois),
    // supabase-js réessaie déjà une lecture en échec (3 fois, ~7 s au total) :
    // on n'ajoute pas les essais de TanStack Query, sinon l'erreur mettrait ~35 s à s'afficher.
    retry: false,
  })

  // Chaque changement de mois crée une entrée d'historique : le retour arrière y revient.
  const changerMois = (nouveau: Mois) => setSearchParams({ mois: nouveau })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
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

      <FiltreMois mois={mois} onChange={changerMois} />

      <section aria-label="Total du mois" className="text-center">
        <p className="text-sm text-muted-foreground">Total du mois</p>
        <p className="text-4xl font-bold tabular-nums">
          {depenses.isSuccess ? formaterMontant(calculerTotal(depenses.data)) : '…'}
        </p>
      </section>

      <Link to="/depenses/nouvelle" className={cn(buttonVariants(), 'h-14 w-full text-lg')}>
        + Ajouter une dépense
      </Link>

      {depenses.isPending && <p className="text-center text-muted-foreground">Chargement…</p>}

      {depenses.isError && (
        <div role="alert" className="flex flex-col items-center gap-3 text-center">
          <p className="text-destructive">
            Impossible de charger vos dépenses. Vérifiez votre connexion et réessayez.
          </p>
          <Button variant="outline" size="lg" onClick={() => depenses.refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {depenses.isSuccess &&
        (depenses.data.length === 0 ? (
          <p className="text-center text-muted-foreground">Aucune dépense ce mois-ci.</p>
        ) : (
          <ListeDepenses depenses={depenses.data} />
        ))}
    </main>
  )
}
