import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SessionProvider } from 'convex-helpers/react/sessions';
import { ToastProvider } from '@/context/toast-provider';
import './index.css';

/* ------- ROUTING ------*/
// Import the generated route tree
import { routeTree } from './routeTree.gen';
// Create a new router instance
const router = createRouter({ routeTree });
// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

/* ------- CONVEX ------*/
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <SessionProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </SessionProvider>
      </ConvexProvider>
    </StrictMode>
  );
}
