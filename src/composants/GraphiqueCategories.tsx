import { totauxParCategorie } from '@/lib/categories'
import type { Categorie } from '@/lib/depense'
import { formaterMontant, formaterPart } from '@/lib/format'

/** Une couleur par catégorie (variables --chart-* de index.css). */
const COULEURS: Record<Categorie, string> = {
  abonnement: 'bg-chart-1',
  fixe: 'bg-chart-2',
  salaires: 'bg-chart-3',
}

/**
 * Trois barres horizontales (Abonnement, Fixe, Salaires). Longueur = part du
 * total du mois. Le texte porte l'information ; les barres sont décoratives.
 */
export function GraphiqueCategories({
  depenses,
}: {
  depenses: readonly { categorie: string; montant: number }[]
}) {
  return (
    <ul aria-label="Dépenses par catégorie" className="flex flex-col gap-3">
      {totauxParCategorie(depenses).map(({ categorie, libelle, montant, part }) => (
        <li key={categorie} className="flex flex-col gap-1">
          <p className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${COULEURS[categorie]}`} />
              {libelle}
            </span>
            <span className="tabular-nums whitespace-nowrap">
              <span className="font-semibold">{formaterMontant(montant)}</span>
              <span className="text-muted-foreground"> · {formaterPart(part)}</span>
            </span>
          </p>
          <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-muted">
            {part > 0 && (
              <div
                className={`h-full min-w-[2px] rounded-full ${COULEURS[categorie]}`}
                style={{ width: `${part * 100}%` }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
