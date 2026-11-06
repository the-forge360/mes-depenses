import { afterEach, describe, expect, it, vi } from 'vitest'
import { genererIdentifiant } from './identifiant'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('genererIdentifiant', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renvoie un UUID v4', () => {
    expect(genererIdentifiant()).toMatch(UUID_V4)
  })

  it('fonctionne sans crypto.randomUUID (page en http sur téléphone)', () => {
    const cryptoSansRandomUUID = { getRandomValues: crypto.getRandomValues.bind(crypto) }
    vi.stubGlobal('crypto', cryptoSansRandomUUID)
    const ids = new Set(Array.from({ length: 50 }, genererIdentifiant))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(id).toMatch(UUID_V4)
  })
})
