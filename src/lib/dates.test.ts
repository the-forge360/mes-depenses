import { describe, expect, it } from 'vitest'
import { aujourdhuiLocal } from './dates'

// Les tests tournent dans le fuseau Africa/Douala (UTC+1), fixé dans vite.config.ts.
describe('aujourdhuiLocal', () => {
  it('renvoie la date locale au format AAAA-MM-JJ', () => {
    expect(aujourdhuiLocal(new Date(2026, 0, 5, 14, 0))).toBe('2026-01-05')
  })

  it('à 0 h 30 heure locale (UTC+1), renvoie le jour local et non la veille en UTC', () => {
    const minuitTrente = new Date('2026-11-05T23:30:00Z') // = 6 nov. 0 h 30 à Douala
    expect(minuitTrente.toISOString().slice(0, 10)).toBe('2026-11-05') // le piège UTC
    expect(aujourdhuiLocal(minuitTrente)).toBe('2026-11-06')
  })
})
