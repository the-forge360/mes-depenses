import type { ReactNode } from 'react'

/** Écran centré pour les états d'attente, de configuration ou d'erreur. */
export function EcranMessage({ titre, children }: { titre: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">{titre}</h1>
      {children}
    </main>
  )
}
