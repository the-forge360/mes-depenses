import { useRef, type KeyboardEvent } from 'react'
import { CATEGORIES, type Categorie } from '@/lib/depense'
import { cn } from '@/lib/utils'

type Props = {
  valeur: Categorie | ''
  onChange: (categorie: Categorie) => void
  idLibelle: string
  invalide?: boolean
  idErreur?: string
}

/**
 * Trois gros boutons au lieu d'une liste déroulante (ARCHITECTURE §8).
 * Groupe radio accessible : Tab entre dans le groupe, les flèches changent le choix.
 */
export function ChoixCategorie({ valeur, onChange, idLibelle, invalide, idErreur }: Props) {
  const boutons = useRef<(HTMLButtonElement | null)[]>([])
  const indexSelection = CATEGORIES.findIndex((c) => c.valeur === valeur)

  function surTouche(evenement: KeyboardEvent, index: number) {
    const deplacement = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      evenement.key
    ]
    if (!deplacement) return
    evenement.preventDefault()
    const suivant = (index + deplacement + CATEGORIES.length) % CATEGORIES.length
    onChange(CATEGORIES[suivant].valeur)
    boutons.current[suivant]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={idLibelle}
      aria-invalid={invalide || undefined}
      aria-describedby={idErreur}
      className="grid grid-cols-3 gap-2"
    >
      {CATEGORIES.map((categorie, index) => {
        const choisie = categorie.valeur === valeur
        return (
          <button
            key={categorie.valeur}
            ref={(el) => {
              boutons.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={choisie}
            tabIndex={choisie || (indexSelection === -1 && index === 0) ? 0 : -1}
            onClick={() => onChange(categorie.valeur)}
            onKeyDown={(e) => surTouche(e, index)}
            className={cn(
              'h-14 rounded-xl border-2 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              choisie
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-muted',
              invalide && !choisie && 'border-destructive/60',
            )}
          >
            {categorie.libelle}
          </button>
        )
      })}
    </div>
  )
}
