import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { FormulaireDepense } from '@/composants/FormulaireDepense'
import { CATEGORIES, type Depense } from '@/lib/depense'
import {
  DepenseIntrouvable,
  lireDepense,
  modifierDepense,
  supprimerDepense,
  type DepenseEnregistree,
} from '@/lib/depenses-api'
import { formaterDateCourte, formaterMontant } from '@/lib/format'
import { moisDeLaDate } from '@/lib/mois'
import { exigerSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const MESSAGE_INTROUVABLE = 'Cette dépense n’existe pas ou a été supprimée.'

function Page({ retour, children }: { retour: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
      <header className="flex items-center gap-3">
        <Link
          to={retour}
          className="-ml-2 rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold">Modifier la dépense</h1>
      </header>
      {children}
    </main>
  )
}

function Introuvable() {
  return (
    <Page retour="/">
      <div role="alert" className="flex flex-col items-center gap-4 pt-8 text-center">
        <p>{MESSAGE_INTROUVABLE}</p>
        <Link to="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
          Retour à l’accueil
        </Link>
      </div>
    </Page>
  )
}

export function ModifierDepense() {
  const { id = '' } = useParams()
  const lecture = useQuery({
    queryKey: ['depense', id],
    queryFn: () => lireDepense(exigerSupabase(), id),
    // supabase-js réessaie déjà les lectures en échec.
    retry: false,
  })

  if (lecture.isPending) {
    return (
      <Page retour="/">
        <p className="text-center text-muted-foreground">Chargement…</p>
      </Page>
    )
  }

  if (lecture.isError) {
    return (
      <Page retour="/">
        <div role="alert" className="flex flex-col items-center gap-3 pt-8 text-center">
          <p className="text-destructive">
            Impossible de charger cette dépense. Vérifiez votre connexion et réessayez.
          </p>
          <Button variant="outline" size="lg" onClick={() => lecture.refetch()}>
            Réessayer
          </Button>
        </div>
      </Page>
    )
  }

  if (!lecture.data) return <Introuvable />

  // key : le formulaire repart des valeurs de cette dépense.
  return <EditionDepense key={lecture.data.id} depense={lecture.data} />
}

function EditionDepense({ depense }: { depense: DepenseEnregistree }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmation, setConfirmation] = useState(false)
  const moisDepense = moisDeLaDate(depense.date)

  function terminer(mois: string, message: string) {
    queryClient.invalidateQueries({ queryKey: ['depenses'] })
    queryClient.removeQueries({ queryKey: ['depense', depense.id] })
    navigate(`/?mois=${mois}`, { state: { message } })
  }

  const modification = useMutation({
    mutationFn: (nouvelle: Depense) => modifierDepense(exigerSupabase(), depense.id, nouvelle),
    onSuccess: (_resultat, nouvelle) => terminer(moisDeLaDate(nouvelle.date), 'Dépense modifiée'),
  })

  const suppression = useMutation({
    mutationFn: () => supprimerDepense(exigerSupabase(), depense.id),
    onSuccess: () => terminer(moisDepense, 'Dépense supprimée'),
    onError: () => setConfirmation(false),
  })

  if (modification.error instanceof DepenseIntrouvable) return <Introuvable />

  const libelleCategorie = CATEGORIES.find((c) => c.valeur === depense.categorie)?.libelle

  return (
    <Page retour={`/?mois=${moisDepense}`}>
      <FormulaireDepense
        valeursInitiales={{
          date: depense.date,
          montant: String(depense.montant),
          categorie: depense.categorie,
          description: depense.description ?? '',
        }}
        onValider={(nouvelle) => modification.mutate(nouvelle)}
        enCours={modification.isPending}
        erreurEnvoi={
          modification.isError
            ? 'La modification n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.'
            : null
        }
      />

      <div className="flex flex-col gap-3 border-t pt-6">
        {suppression.isError && (
          <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            La dépense n’a pas pu être supprimée. Vérifiez votre connexion et réessayez.
          </p>
        )}
        <Button
          variant="destructive"
          className="h-12 text-base"
          disabled={modification.isPending}
          onClick={() => setConfirmation(true)}
        >
          Supprimer cette dépense
        </Button>
      </div>

      <AlertDialog
        open={confirmation}
        onOpenChange={(ouvert) => {
          // Pas de fermeture pendant la suppression.
          if (!suppression.isPending) setConfirmation(ouvert)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voulez-vous vraiment supprimer cette dépense ?</AlertDialogTitle>
            <AlertDialogDescription>
              {formaterDateCourte(depense.date)} · {libelleCategorie} ·{' '}
              {formaterMontant(depense.montant)}
              {depense.description ? ` · ${depense.description}` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11" disabled={suppression.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11"
              disabled={suppression.isPending}
              onClick={() => suppression.mutate()}
            >
              {suppression.isPending ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  )
}
