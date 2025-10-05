# router-events — Events Map App

Interactive events application with a map, list/details pages, auth, file uploads, i18n, and SSR.

### Tech Stack

- React 19, TypeScript, Vite
- React Router v7 (SSR, file-based routes)
- Tailwind CSS v4
- TanStack Query v5 + `@convex-dev/react-query`
- Convex (DB, functions, storage, auth)
- i18next + remix-i18next
- MapLibre GL + MapTiler

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Set up environment variables

Create a `.env` file in the root and add:

```bash
# Maps
MAPTILER_KEY=your_maptiler_api_key

# Convex URL (from `npx convex dev` output or Dashboard when deployed)
CONVEX_URL=https://<your-deployment>.convex.cloud

# For compatibility with loader in app/routes/event.$eventId.tsx
VITE_CONVEX_URL=${CONVEX_URL}

# (Optional for Google OAuth in Convex Auth, set in Convex env)
# AUTH_GOOGLE_ID=...
# AUTH_GOOGLE_SECRET=...

# (Optional) Convex domain for auth.config if needed
# CONVEX_SITE_URL=https://<your-deployment>.convex.cloud
```

3. Start Convex locally (in a separate terminal)

```bash
npm run dev:db
# copy URL from output to CONVEX_URL if needed
```

4. Start the application

```bash
npm run dev
# default: http://localhost:5173
```

## Scripts

- `npm run dev` — dev server (Vite + React Router SSR)
- `npm run dev:db` — Convex dev (local functions/DB environment)
- `npm run build` — build client and server
- `npm run start` — production server
- `npm run typecheck` — generate route types + TS check

## Project Structure

- `app/` — client and server-side rendering, UI modules and routes
  - `app/root.tsx` — providers: theme, Convex, QueryClient, i18n, SSR links/meta
  - `app/routes/` — routes (`_index.tsx`, `event.$eventId.tsx`, `action.set-theme.tsx`)
  - `app/modules/` — features: map, events, auth, header, etc.
  - `public/locales/{en,ru}/common.json` — translations
- `convex/` — database schema and server functions (events, http, auth)
  - `convex/schema.ts` — tables `events`, `attendees` + `authTables`
  - `convex/events.ts` — `list`, `get`, `getInBounds`, `create`, `toggleAttendance`, `generateUploadUrl`
  - `convex/http.ts` — authorization HTTP routes
  - `convex/auth.ts` — Convex Auth config (Google, Password)

## Authentication (Convex Auth)

Providers: Google, Password (`convex/auth.ts`). HTTP routes are added in `convex/http.ts`. Client and SSR are wrapped in `ConvexAuthProvider` in `app/root.tsx`.

ENV for Google OAuth are set in Convex Dashboard (not in app .env): `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Password provider doesn't need additional variables.

## Data & Convex

Schema (`convex/schema.ts`):

- `events` — event with geo-address, category, date, files, organizer and attendee count
- `attendees` — user ↔ event relationship
- `authTables` — authentication tables from `@convex-dev/auth`

Main functions (`convex/events.ts`):

- `list({ category?, date? })` — list of events with header image and organizer data
- `get({ eventId })` — event with resolved image URLs
- `getInBounds({ minLat, minLng, maxLat, maxLng })` — events within current map bounds
- `create({ event })` — create event (requires authentication)
- `toggleAttendance({ eventId })` — subscribe/unsubscribe to event
- `generateUploadUrl()` — pre-signed URL for file uploads to Convex Storage

Client usage through TanStack Query and `@convex-dev/react-query`:

```tsx
// query
const { data } = useQuery(convexQuery(api.events.list, {}));

// mutation
const { mutate } = useMutation({
  mutationFn: useConvexMutation(api.events.create),
});
```

SSR loading in route example `event.$eventId.tsx` uses `ConvexHttpClient`.

## Maps

- `react-map-gl/maplibre` + MapLibre GL
- MapTiler styles: requires `MAPTILER_KEY`
- Marker rendering using `address.lat`/`address.lon` fields
- Viewport and map bounds are passed to `events.getInBounds` query

## I18n & Theme

- i18next + remix-i18next, dictionaries in `public/locales/{en,ru}/common.json`
- Theme: `remix-themes`, cookie storage in `app/sessions.server.tsx`, action `app/routes/action.set-theme.tsx`

## Production

Build and run:

```bash
npm run build
npm run start
```

Docker (simplified):

```bash
docker build -t router-events .
docker run -p 3000:3000 --env-file .env router-events
```

Ensure environment variables are provided (especially `CONVEX_URL`, `MAPTILER_KEY`).

## Useful Links

- React Router 7 — https://reactrouter.com/
- Convex — https://docs.convex.dev/
- TanStack Query — https://tanstack.com/query/latest
- MapLibre — https://maplibre.org/
- MapTiler — https://www.maptiler.com/
- Tailwind CSS — https://tailwindcss.com/
