import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChoixCategorie } from '@/composants/ChoixCategorie'
import { aujourdhuiLocal } from '@/lib/dates'
import { schemaDepense, type Categorie, type Depense, type SaisieDepense } from '@/lib/depense'

type Champ = keyof SaisieDepense
type Erreurs = Partial<Record<Champ, string>>

type Props = {
  /** Appelé avec une dépense valide. */
  onValider: (depense: Depense) => void
  enCours: boolean
  /** Message affiché si l'envoi a échoué ; la saisie est conservée. */
  erreurEnvoi?: string | null
  /** Valeurs de départ (modification). Sans elles : date du jour, champs vides. */
  valeursInitiales?: SaisieDepense
}

const DESCRIPTION_MAX = 100

function MessageErreur({ champ, message }: { champ: Champ; message?: string }) {
  if (!message) return null
  return (
    <p id={`erreur-${champ}`} className="text-sm text-destructive">
      {message}
    </p>
  )
}

/** Formulaire de dépense (ajout ; servira aussi à la modification). */
export function FormulaireDepense({ onValider, enCours, erreurEnvoi, valeursInitiales }: Props) {
  const [aujourdhui] = useState(aujourdhuiLocal)
  const [saisie, setSaisie] = useState<SaisieDepense>(
    () =>
      valeursInitiales ?? {
        date: aujourdhui,
        montant: '',
        categorie: '',
        description: '',
      },
  )
  const [erreurs, setErreurs] = useState<Erreurs>({})

  function modifier(champ: Champ, valeur: string) {
    setSaisie((s) => ({ ...s, [champ]: valeur }))
    setErreurs((e) => ({ ...e, [champ]: undefined }))
  }

  function valider(evenement: FormEvent) {
    evenement.preventDefault()
    if (enCours) return
    const resultat = schemaDepense(aujourdhuiLocal()).safeParse(saisie)
    if (!resultat.success) {
      const nouvelles: Erreurs = {}
      for (const probleme of resultat.error.issues) {
        const champ = probleme.path[0] as Champ
        nouvelles[champ] ??= probleme.message
      }
      setErreurs(nouvelles)
      return
    }
    setErreurs({})
    onValider(resultat.data)
  }

  /** Attributs d'accessibilité reliant un champ à son message d'erreur. */
  const aideErreur = (champ: Champ) =>
    erreurs[champ]
      ? { 'aria-invalid': true, 'aria-describedby': `erreur-${champ}` }
      : {}

  return (
    <form onSubmit={valider} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          max={aujourdhui}
          value={saisie.date}
          onChange={(e) => modifier('date', e.target.value)}
          className="h-12 text-base"
          {...aideErreur('date')}
        />
        <MessageErreur champ="date" message={erreurs.date} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="montant">Montant (FCFA)</Label>
        <Input
          id="montant"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex. : 15 000"
          value={saisie.montant}
          onChange={(e) => modifier('montant', e.target.value)}
          className="h-12 text-lg"
          {...aideErreur('montant')}
        />
        <MessageErreur champ="montant" message={erreurs.montant} />
      </div>

      <div className="flex flex-col gap-2">
        <span id="libelle-categorie" className="text-sm leading-none font-medium">
          Catégorie
        </span>
        <ChoixCategorie
          valeur={saisie.categorie as Categorie | ''}
          onChange={(categorie) => modifier('categorie', categorie)}
          idLibelle="libelle-categorie"
          invalide={!!erreurs.categorie}
          idErreur={erreurs.categorie ? 'erreur-categorie' : undefined}
        />
        <MessageErreur champ="categorie" message={erreurs.categorie} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="description">
            Description <span className="font-normal text-muted-foreground">(facultatif)</span>
          </Label>
          <span className="text-xs text-muted-foreground" aria-hidden>
            {saisie.description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
        <Textarea
          id="description"
          maxLength={DESCRIPTION_MAX}
          rows={2}
          value={saisie.description}
          onChange={(e) => modifier('description', e.target.value)}
          className="text-base"
          {...aideErreur('description')}
        />
        <MessageErreur champ="description" message={erreurs.description} />
      </div>

      {erreurEnvoi && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {erreurEnvoi}
        </p>
      )}

      <Button type="submit" disabled={enCours} className="h-14 text-lg">
        {enCours ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  )
}
