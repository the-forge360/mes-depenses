import { describe, expect, it } from 'vitest'
import { traduireErreurAuth } from './erreurs-auth'

describe('traduireErreurAuth', () => {
  it('identifiants incorrects', () => {
    expect(traduireErreurAuth({ code: 'invalid_credentials' })).toBe(
      'E-mail ou mot de passe incorrect.',
    )
  })

  it('e-mail déjà utilisé : invite à se connecter', () => {
    expect(traduireErreurAuth({ code: 'user_already_exists' })).toMatch(/Connectez-vous/)
  })

  it('erreur inconnue ou réseau : message générique en français', () => {
    expect(traduireErreurAuth({ code: 'code_inconnu' })).toMatch(/Vérifiez votre connexion/)
    expect(traduireErreurAuth(undefined)).toMatch(/Vérifiez votre connexion/)
  })
})
