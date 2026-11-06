import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FormulaireDepense } from '@/composants/FormulaireDepense'
import type { Depense } from '@/lib/depense'
import { ajouterDepense } from '@/lib/depenses-api'
import { genererIdentifiant } from '@/lib/identifiant'
import { moisDeLaDate } from '@/lib/mois'
import { useSessionConnectee } from '@/lib/contexte-session'
import { exigerSupabase } from '@/lib/supabase'

export function NouvelleDepense() {
  const { entrepriseId } = useSessionConnectee()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // Un seul identifiant par formulaire : un nouvel essai ne crée pas de doublon.
  const [id] = useState(genererIdentifiant)

  const enregistrement = useMutation({
    mutationFn: (depense: Depense) =>
      ajouterDepense(exigerSupabase(), { ...depense, id, entreprise_id: entrepriseId }),
    onSuccess: (_resultat, depense) => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] })
      // Retour sur le mois de la dépense, pour qu'elle soit visible dans la liste.
      navigate(`/?mois=${moisDeLaDate(depense.date)}`, {
        state: { message: 'Dépense enregistrée' },
      })
    },
  })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          className="-ml-2 rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold">Nouvelle dépense</h1>
      </header>

      <FormulaireDepense
        onValider={(depense) => enregistrement.mutate(depense)}
        enCours={enregistrement.isPending}
        erreurEnvoi={
          enregistrement.isError
            ? 'La dépense n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.'
            : null
        }
      />
    </main>
  )
}
