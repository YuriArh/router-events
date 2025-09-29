import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types/root";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./sessions.server";
import clsx from "clsx";
import { getPublicEnvToExpose } from "env.server";
import { PublicEnv } from "./public-env";
import maplibre from "maplibre-gl/dist/maplibre-gl.css?url";
import i18next from "./i18next.server";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import stylesheet from "./app.css?url";
import { ConvexReactClient } from "convex/react";
import { useState } from "react";
import { Toaster } from "./shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: maplibre },
];

export const loader = async (args: Route.LoaderArgs) => {
  return rootAuthLoader(args, async (args) => {
    const { getTheme } = await themeSessionResolver(args.request);
    const locale = await i18next.getLocale(args.request);

    return {
      theme: getTheme(),
      publicEnv: getPublicEnvToExpose(),
      locale,
    };
  });
};

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

export default function AppWithProviders() {
  return (
    <ThemeProvider
      specifiedTheme={Theme.LIGHT}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange={true}
    >
      <App />
    </ThemeProvider>
  );
}

function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { locale, theme: dataTheme, publicEnv } = loaderData;
  const [convex] = useState(() => new ConvexReactClient(publicEnv.CONVEX_URL));
  const [theme] = useTheme();

  const { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);
  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      data-theme={theme ?? ""}
      className={clsx(theme)}
      suppressHydrationWarning
    >
      <ConvexAuthProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <Meta />
            <PreventFlashOnWrongTheme ssrTheme={Boolean(dataTheme)} />
            <Links />
          </head>
          <body className="flex flex-1 flex-col h-full">
            <PublicEnv {...publicEnv} />
            <Outlet />
            <Toaster />
            <ScrollRestoration />
            <Scripts />
          </body>
        </QueryClientProvider>
      </ConvexAuthProvider>
    </html>
  );
}

export function HydrateFallback() {
  return <h1>Loading...</h1>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
