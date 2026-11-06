import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { CATEGORIES } from '@/lib/depense'
import type { DepenseEnregistree } from '@/lib/depenses-api'
import { formaterDateCourte, formaterMontant } from '@/lib/format'

const libelleCategorie = (valeur: string) =>
  CATEGORIES.find((c) => c.valeur === valeur)?.libelle ?? valeur

/** Liste des dépenses d'un mois (déjà triée par la requête). Chaque ligne ouvre sa modification. */
export function ListeDepenses({ depenses }: { depenses: DepenseEnregistree[] }) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border">
      {depenses.map((depense) => {
        const date = formaterDateCourte(depense.date)
        const categorie = libelleCategorie(depense.categorie)
        const montant = formaterMontant(depense.montant)
        return (
          <li key={depense.id}>
            <Link
              to={`/depenses/${depense.id}`}
              aria-label={`${date}, ${categorie}, ${montant}${depense.description ? `, ${depense.description}` : ''} — modifier`}
              className="flex min-h-12 items-start justify-between gap-3 p-4 outline-none hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="text-muted-foreground">{date}</span>
                  {' · '}
                  {categorie}
                </p>
                {depense.description && (
                  <p className="text-sm break-words text-muted-foreground">
                    {depense.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <p className="font-semibold whitespace-nowrap tabular-nums">{montant}</p>
                <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
