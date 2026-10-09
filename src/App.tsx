import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorPage } from './pages/ErrorPage';
import { DEFAULT_FORMAT_ID } from './features/qr/formats/registry';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/crear', element: <Navigate to={`/crear/${DEFAULT_FORMAT_ID}`} replace /> },
          {
            path: '/crear/:formatId',
            // El generador (motor QR, formularios, diseño) se descarga solo al entrar en él.
            lazy: async () => ({ Component: (await import('./pages/GeneratorPage')).GeneratorPage }),
          },
          { path: '/privacidad', element: <PrivacyPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
