import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { libelleMois, moisCourant, moisPrecedent, moisSuivant, type Mois } from '@/lib/mois'

type Props = {
  mois: Mois
  onChange: (mois: Mois) => void
}

/** « ‹ novembre 2026 › » : impossible d'avancer au-delà du mois en cours. */
export function FiltreMois({ mois, onChange }: Props) {
  const estMoisCourant = mois >= moisCourant()

  return (
    <nav aria-label="Choix du mois" className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="icon-lg"
        className="size-11"
        aria-label="Mois précédent"
        onClick={() => onChange(moisPrecedent(mois))}
      >
        <ChevronLeft className="size-5" />
      </Button>

      <p aria-live="polite" className="text-lg font-medium">
        {libelleMois(mois)}
      </p>

      <Button
        variant="outline"
        size="icon-lg"
        className="size-11"
        aria-label="Mois suivant"
        disabled={estMoisCourant}
        onClick={() => onChange(moisSuivant(mois))}
      >
        <ChevronRight className="size-5" />
      </Button>
    </nav>
  )
}
