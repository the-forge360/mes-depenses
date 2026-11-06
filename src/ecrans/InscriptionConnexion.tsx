import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { traduireErreurAuth } from '@/lib/erreurs-auth'
import { exigerSupabase } from '@/lib/supabase'

type Mode = 'connexion' | 'inscription'

const LONGUEUR_MIN_MOT_DE_PASSE = 8

/**
 * Écran inscription/connexion. Pas d'e-mail de confirmation : après
 * l'inscription, Supabase ouvre directement la session et RoutePublique
 * renvoie vers l'accueil.
 */
export function InscriptionConnexion() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [information, setInformation] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  function changerMode(nouveau: Mode) {
    setMode(nouveau)
    setErreur(null)
    setInformation(null)
  }

  async function valider(evenement: FormEvent) {
    evenement.preventDefault()
    setErreur(null)
    setInformation(null)

    if (mode === 'inscription' && motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setEnCours(true)
    const auth = exigerSupabase().auth
    const { data, error } =
      mode === 'inscription'
        ? await auth.signUp({ email, password: motDePasse })
        : await auth.signInWithPassword({ email, password: motDePasse })
    setEnCours(false)

    if (error) {
      setErreur(traduireErreurAuth(error))
      return
    }
    // Si « Confirm email » est resté activé dans Supabase, aucune session n'est ouverte.
    if (mode === 'inscription' && !data.session) {
      console.warn('Supabase : désactivez « Confirm email » (Authentication → Email).')
      setInformation('Compte créé, mais il doit être confirmé par e-mail avant la connexion.')
    }
    // Sinon, la session s'ouvre : RoutePublique redirige vers l'accueil.
  }

  const inscription = mode === 'inscription'

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 p-4">
      <h1 className="text-center text-3xl font-semibold">Mes dépenses</h1>

      <div role="tablist" aria-label="Choix" className="grid grid-cols-2 rounded-xl bg-muted p-1">
        {(
          [
            ['connexion', 'Se connecter'],
            ['inscription', 'Créer un compte'],
          ] as const
        ).map(([valeur, libelle]) => (
          <button
            key={valeur}
            type="button"
            role="tab"
            aria-selected={mode === valeur}
            onClick={() => changerMode(valeur)}
            className={cn(
              'h-11 rounded-lg text-sm font-medium transition-colors',
              mode === valeur ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            {libelle}
          </button>
        ))}
      </div>

      <form onSubmit={valider} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="mot-de-passe">Mot de passe</Label>
          <Input
            id="mot-de-passe"
            type="password"
            required
            autoComplete={inscription ? 'new-password' : 'current-password'}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            aria-describedby={inscription ? 'aide-mot-de-passe' : undefined}
            className="h-12 text-base"
          />
          {inscription && (
            <p id="aide-mot-de-passe" className="text-sm text-muted-foreground">
              8 caractères minimum.
            </p>
          )}
        </div>

        {erreur && (
          <p role="alert" className="text-sm text-destructive">
            {erreur}
          </p>
        )}
        {information && (
          <p role="status" className="text-sm">
            {information}
          </p>
        )}

        <Button type="submit" disabled={enCours} className="h-12 text-base">
          {enCours ? 'Patientez…' : inscription ? 'Créer mon compte' : 'Se connecter'}
        </Button>
      </form>
    </main>
  )
}
