/** Traduit une erreur de Supabase Auth en message français pour le gérant. */
export function traduireErreurAuth(erreur: { code?: string } | null | undefined): string {
  switch (erreur?.code) {
    case 'invalid_credentials':
      return 'E-mail ou mot de passe incorrect.'
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cet e-mail. Connectez-vous.'
    case 'weak_password':
      return 'Le mot de passe doit contenir au moins 8 caractères.'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Cette adresse e-mail n’est pas valide.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Trop de tentatives. Patientez quelques minutes, puis réessayez.'
    case 'signup_disabled':
      return 'La création de compte est désactivée.'
    default:
      return 'Une erreur est survenue. Vérifiez votre connexion internet et réessayez.'
  }
}
