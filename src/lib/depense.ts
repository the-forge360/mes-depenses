import { z } from 'zod'
import { aujourdhuiLocal } from './dates'

export const CATEGORIES = [
  { valeur: 'abonnement', libelle: 'Abonnement' },
  { valeur: 'fixe', libelle: 'Fixe' },
  { valeur: 'salaires', libelle: 'Salaires' },
] as const

export type Categorie = (typeof CATEGORIES)[number]['valeur']

const VALEURS_CATEGORIES = CATEGORIES.map((c) => c.valeur) as [Categorie, ...Categorie[]]

/** Plus grand montant accepté par la colonne `integer` de PostgreSQL. */
const MONTANT_MAX = 2_147_483_647

/** Valeurs brutes du formulaire, telles que saisies. */
export type SaisieDepense = {
  date: string
  montant: string
  categorie: string
  description: string
}

/**
 * Règles du PRD (§5–6) pour une dépense. `aujourdhui` (AAAA-MM-JJ, heure locale)
 * sert à refuser les dates dans le futur.
 */
export function schemaDepense(aujourdhui: string = aujourdhuiLocal()) {
  return z.object({
    date: z
      .string()
      .trim()
      .min(1, 'La date est obligatoire.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date est obligatoire.')
      .refine((date) => date <= aujourdhui, 'La date ne peut pas être dans le futur.'),

    montant: z.string().transform((brut, ctx) => {
      const chiffres = brut.replace(/\s/g, '') // « 1 250 000 » → « 1250000 »
      if (chiffres === '') {
        ctx.addIssue('Le montant est obligatoire.')
        return z.NEVER
      }
      if (!/^-?\d+$/.test(chiffres)) {
        ctx.addIssue('Le montant doit être un nombre entier, sans virgule.')
        return z.NEVER
      }
      const montant = Number(chiffres)
      if (montant <= 0) {
        ctx.addIssue('Le montant doit être supérieur à 0.')
        return z.NEVER
      }
      if (montant > MONTANT_MAX) {
        ctx.addIssue('Le montant est trop élevé.')
        return z.NEVER
      }
      return montant
    }),

    categorie: z.enum(VALEURS_CATEGORIES, { error: 'Choisissez une catégorie.' }),

    description: z
      .string()
      .trim()
      .max(100, 'La description ne doit pas dépasser 100 caractères.')
      .transform((texte) => (texte === '' ? null : texte)),
  })
}

/** Dépense validée, prête à être enregistrée. */
export type Depense = z.output<ReturnType<typeof schemaDepense>>
