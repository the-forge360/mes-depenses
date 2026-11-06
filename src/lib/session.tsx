import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { EcranMessage } from '@/composants/EcranMessage'
import { ContexteSession } from './contexte-session'
import { exigerSupabase, supabase } from './supabase'

export function FournisseurSession({ children }: { children: ReactNode }) {
  if (!supabase) {
    return (
      <EcranMessage titre="App non configurée">
        <p className="max-w-sm text-muted-foreground">
          Copiez le fichier <code>.env.example</code> en <code>.env.local</code>, renseignez
          l’adresse et la clé publique de votre projet Supabase, puis relancez l’app.
        </p>
      </EcranMessage>
    )
  }
  return <FournisseurSessionConfigure>{children}</FournisseurSessionConfigure>
}

function FournisseurSessionConfigure({ children }: { children: ReactNode }) {
  // `undefined` : on ne sait pas encore si une session est enregistrée sur l'appareil.
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Émet INITIAL_SESSION au démarrage, puis chaque connexion / déconnexion.
    // On ne fait aucun appel Supabase dans ce rappel (recommandation de supabase-js).
    const { data } = exigerSupabase().auth.onAuthStateChange((evenement, nouvelle) => {
      setSession(nouvelle)
      if (evenement === 'SIGNED_OUT') queryClient.clear()
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const utilisateurId = session?.user.id
  const entreprise = useQuery({
    queryKey: ['entreprise', utilisateurId],
    enabled: !!utilisateurId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await exigerSupabase().rpc('assurer_entreprise')
      if (error) throw error
      return data as string
    },
  })

  if (session === undefined) return <EcranMessage titre="Chargement…" />

  if (session === null) {
    return (
      <ContexteSession.Provider value={{ session: null, entrepriseId: null }}>
        {children}
      </ContexteSession.Provider>
    )
  }

  if (entreprise.isError) {
    return (
      <EcranMessage titre="Impossible d’ouvrir votre espace">
        <p className="max-w-sm text-muted-foreground">
          Vérifiez votre connexion internet, puis réessayez.
        </p>
        <div className="flex gap-2">
          <Button size="lg" onClick={() => entreprise.refetch()}>
            Réessayer
          </Button>
          <Button size="lg" variant="outline" onClick={() => exigerSupabase().auth.signOut()}>
            Se déconnecter
          </Button>
        </div>
      </EcranMessage>
    )
  }

  if (!entreprise.data) return <EcranMessage titre="Chargement…" />

  return (
    <ContexteSession.Provider value={{ session, entrepriseId: entreprise.data }}>
      {children}
    </ContexteSession.Provider>
  )
}
