import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { RouteConnectee, RoutePublique } from '@/composants/routes'
import { Accueil } from '@/ecrans/Accueil'
import { InscriptionConnexion } from '@/ecrans/InscriptionConnexion'
import { ModifierDepense } from '@/ecrans/ModifierDepense'
import { NouvelleDepense } from '@/ecrans/NouvelleDepense'
import { FournisseurSession } from '@/lib/session'
import './index.css'

const queryClient = new QueryClient()

const routeur = createBrowserRouter([
  {
    element: <RoutePublique />,
    children: [{ path: '/connexion', element: <InscriptionConnexion /> }],
  },
  {
    element: <RouteConnectee />,
    children: [
      { path: '/', element: <Accueil /> },
      { path: '/depenses/nouvelle', element: <NouvelleDepense /> },
      { path: '/depenses/:id', element: <ModifierDepense /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FournisseurSession>
        <RouterProvider router={routeur} />
      </FournisseurSession>
    </QueryClientProvider>
  </StrictMode>,
)
