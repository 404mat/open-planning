import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import ConvexProvider from '../integrations/convex/provider';

import appCss from '../styles.css?url';
import { SessionProvider } from 'convex-helpers/react/sessions';
import { useLocalStorage } from 'usehooks-ts';
import { ToastProvider } from '@/context/toast-provider';
import CookieBanner from '@/components/cookie-banner';

const SESSION_STORAGE_KEY = 'open-planning-session-id';

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Open Planning',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          <SessionProvider
            storageKey={SESSION_STORAGE_KEY}
            useStorage={useLocalStorage}
          >
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
          <CookieBanner />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
