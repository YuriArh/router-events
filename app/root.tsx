import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./sessions.server";
import clsx from "clsx";
import { getPublicEnvToExpose } from "env.server";
import { PublicEnv } from "./public-env";
import "maplibre-gl/dist/maplibre-gl.css";
import i18next from "./i18next.server";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { Header } from "./modules/header";
import { getSupabaseServerClient } from "./supabase.server";

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
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { getTheme } = await themeSessionResolver(request);
  let locale = await i18next.getLocale(request);

  const headersToSet = new Headers();
  const { supabase } = getSupabaseServerClient(request, headersToSet);

  const { data } = await supabase.auth.getUser();

  return {
    theme: getTheme(),
    publicEnv: getPublicEnvToExpose(),
    locale,
    user: data.user,
  };
};

export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

export default function AppWithProviders({ loaderData }: Route.ComponentProps) {
  const { theme } = loaderData;

  return (
    <>
      <ThemeProvider
        specifiedTheme={theme}
        themeAction="/action/set-theme"
        disableTransitionOnThemeChange={true}
      >
        <App />
      </ThemeProvider>
    </>
  );
}

function App() {
  const { locale, theme: dataTheme, publicEnv } = useLoaderData();
  const [theme] = useTheme();

  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      data-theme={theme ?? ""}
      className={clsx(theme)}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(dataTheme)} />
        <Links />
      </head>
      <body className="flex flex-1 flex-col h-full">
        <PublicEnv {...publicEnv} />
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
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
