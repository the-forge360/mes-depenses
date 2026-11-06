import { CATEGORIES } from '@/lib/depense'
import type { DepenseEnregistree } from '@/lib/depenses-api'
import { formaterDateCourte, formaterMontant } from '@/lib/format'

const libelleCategorie = (valeur: string) =>
  CATEGORIES.find((c) => c.valeur === valeur)?.libelle ?? valeur

/** Liste des dépenses d'un mois (déjà triée par la requête). */
export function ListeDepenses({ depenses }: { depenses: DepenseEnregistree[] }) {
  return (
    <ul className="divide-y rounded-xl border">
      {depenses.map((depense) => (
        <li key={depense.id} className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="font-medium">
              <span className="text-muted-foreground">{formaterDateCourte(depense.date)}</span>
              {' · '}
              {libelleCategorie(depense.categorie)}
            </p>
            {depense.description && (
              <p className="text-sm break-words text-muted-foreground">{depense.description}</p>
            )}
          </div>
          <p className="shrink-0 font-semibold whitespace-nowrap tabular-nums">
            {formaterMontant(depense.montant)}
          </p>
        </li>
      ))}
    </ul>
  )
}
