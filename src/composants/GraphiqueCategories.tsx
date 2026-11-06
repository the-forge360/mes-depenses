import { totauxParCategorie } from '@/lib/categories'
import { formaterMontant, formaterPart } from '@/lib/format'

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
            <span className="font-medium">{libelle}</span>
            <span className="tabular-nums whitespace-nowrap">
              <span className="font-semibold">{formaterMontant(montant)}</span>
              <span className="text-muted-foreground"> · {formaterPart(part)}</span>
            </span>
          </p>
          <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-muted">
            {part > 0 && (
              <div
                className="h-full min-w-[2px] rounded-full bg-primary"
                style={{ width: `${part * 100}%` }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
