## router-events — Events Map App (RU/EN)

Билингвальная документация ниже. English version follows.

---

## 🇷🇺 О проекте

Интерактивное приложение для поиска и создания событий на карте:

- Карта с маркерами событий (MapTiler + MapLibre + react-map-gl)
- Лента событий и страница события
- Аутентификация (Convex Auth: Google + Password)
- Хранение и загрузка файлов (Convex Storage)
- I18n (ru/en), управление темой, SSR на React Router v7

### Технологии

- React 19, TypeScript, Vite
- React Router v7 (SSR включён), файловые маршруты в `app/routes`
- Tailwind CSS v4
- TanStack Query v5 + `@convex-dev/react-query`
- Convex 1.x (функции, storage, auth)
- i18next + remix-i18next
- MapLibre GL + MapTiler

### Структура

- `app/` — клиент и серверный рендер, модули UI и маршруты
  - `app/root.tsx` — провайдеры: тема, Convex, QueryClient, i18n, SSR links/meta
  - `app/routes/` — маршруты (`_index.tsx`, `event.$eventId.tsx`, `action.set-theme.tsx`)
  - `app/modules/` — фичи: карта, события, аутентификация, заголовок и т.п.
  - `public/locales/{en,ru}/common.json` — переводы
- `convex/` — схема БД и серверные функции (events, http, auth)
  - `convex/schema.ts` — таблицы `events`, `attendees` + `authTables`
  - `convex/events.ts` — `list`, `get`, `getInBounds`, `create`, `toggleAttendance`, `generateUploadUrl`
  - `convex/http.ts` — HTTP роуты авторизации
  - `convex/auth.ts` — конфиг Convex Auth (Google, Password)

---

## 🚀 Быстрый старт (dev)

1. Установите зависимости

```bash
npm install
```

2. Настройте переменные окружения

Создайте файл `.env` в корне и добавьте:

```bash
# Карты
MAPTILER_KEY=your_maptiler_api_key

# Convex URL (из вывода `npx convex dev` или из Dashboard при деплое)
CONVEX_URL=https://<your-deployment>.convex.cloud

# Для совместимости с loader-ом в app/routes/event.$eventId.tsx
VITE_CONVEX_URL=${CONVEX_URL}

# (Опционально для Google OAuth в Convex Auth, задаются в Convex env)
# AUTH_GOOGLE_ID=...
# AUTH_GOOGLE_SECRET=...

# (Опционально) Домен Convex для auth.config, если требуется
# CONVEX_SITE_URL=https://<your-deployment>.convex.cloud
```

3. Запустите Convex локально (в отдельном терминале)

```bash
npm run dev:db
# скопируйте URL из вывода в CONVEX_URL, если требуется
```

4. Запустите приложение

```bash
npm run dev
# по умолчанию: http://localhost:5173
```

---

## 📦 Скрипты

- `npm run dev` — dev сервер (Vite + React Router SSR)
- `npm run dev:db` — Convex dev (локальная среда функций/БД)
- `npm run build` — сборка клиента и сервера
- `npm run start` — запуск production-сервера
- `npm run typecheck` — генерация типов роутов + TS проверка

---

## 🔐 Аутентификация (Convex Auth)

Провайдеры: Google, Password (`convex/auth.ts`). HTTP-роуты добавляются в `convex/http.ts`. Клиент и SSR обёрнуты в `ConvexAuthProvider` в `app/root.tsx`.

ENV для Google OAuth задаются в Convex Dashboard (не в .env приложения): `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Для Password провайдера дополнительных переменных не нужно.

---

## 🗄️ Данные и Convex

Схема (`convex/schema.ts`):

- `events` — событие с гео-адресом, категорией, датой, файлами, организатором и счётчиком участников
- `attendees` — связь пользователь ↔ событие
- `authTables` — таблицы аутентификации от `@convex-dev/auth`

Основные функции (`convex/events.ts`):

- `list({ category?, date? })` — список событий с заголовочным изображением и данными организатора
- `get({ eventId })` — событие c резолвом URL-ов изображений
- `getInBounds({ minLat, minLng, maxLat, maxLng })` — события в пределах текущих границ карты
- `create({ event })` — создание события (требует авторизации)
- `toggleAttendance({ eventId })` — подписка/отписка на событие
- `generateUploadUrl()` — pre-signed URL для загрузки файлов в Convex Storage

Клиентские вызовы через TanStack Query и `@convex-dev/react-query`:

```tsx
// загрузка
const { data } = useQuery(convexQuery(api.events.list, {}));

// мутация
const { mutate } = useMutation({
  mutationFn: useConvexMutation(api.events.create),
});
```

SSR-загрузка на маршруте примера `event.$eventId.tsx` использует `ConvexHttpClient`.

---

## 🗺️ Карта

- `react-map-gl/maplibre` + MapLibre GL
- Стили MapTiler: требуется `MAPTILER_KEY`
- Отрисовка маркеров по полям `address.lat`/`address.lon`
- Вьюпорт и границы карты передаются в запрос `events.getInBounds`

---

## 🌐 I18n и тема

- i18next + remix-i18next, словари в `public/locales/{en,ru}/common.json`
- Тема: `remix-themes`, cookie-хранилище в `app/sessions.server.tsx`, экшен `app/routes/action.set-theme.tsx`

---

## ⚙️ Продакшн

Сборка и запуск:

```bash
npm run build
npm run start
```

Docker (упрощённо):

```bash
docker build -t router-events .
docker run -p 3000:3000 --env-file .env router-events
```

Убедитесь, что переменные окружения проброшены (особенно `CONVEX_URL`, `MAPTILER_KEY`).

---

## 🔍 Полезные ссылки

- React Router 7 — https://reactrouter.com/
- Convex — https://docs.convex.dev/
- TanStack Query — https://tanstack.com/query/latest
- MapLibre — https://maplibre.org/
- MapTiler — https://www.maptiler.com/
- Tailwind CSS — https://tailwindcss.com/

---

## 🇬🇧 About

Interactive events application with a map, list/details pages, auth, file uploads, i18n, and SSR.

### Tech Stack

- React 19, TypeScript, Vite
- React Router v7 (SSR, file-based routes)
- Tailwind CSS v4
- TanStack Query v5 + `@convex-dev/react-query`
- Convex (DB, functions, storage, auth)
- i18next + remix-i18next
- MapLibre GL + MapTiler

### Quick Start

```bash
npm i

# .env
MAPTILER_KEY=your_maptiler_api_key
CONVEX_URL=https://<your-deployment>.convex.cloud
VITE_CONVEX_URL=${CONVEX_URL}

npm run dev:db  # start Convex locally
npm run dev     # http://localhost:5173
```

### Scripts

- `dev` — dev server
- `dev:db` — Convex dev
- `build` — build client and server
- `start` — production server
- `typecheck` — generate route types + TS

### Convex & Data

Schema: `events`, `attendees`, and `authTables`. See `convex/schema.ts` and `convex/events.ts` for queries/mutations.

Client usage:

```tsx
const { data } = useQuery(convexQuery(api.events.list, {}));
const { mutate } = useMutation({
  mutationFn: useConvexMutation(api.events.create),
});
```

### Auth

Convex Auth (Google + Password). Configure `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex env. HTTP routes are registered in `convex/http.ts`.

### Maps

Set `MAPTILER_KEY`. Map markers use event `address.lat/lon`. Viewport bounds drive `events.getInBounds`.

### Production

```bash
npm run build && npm start
# or docker build -t router-events . && docker run -p 3000:3000 --env-file .env router-events
```

Ensure required env vars are provided (`CONVEX_URL`, `MAPTILER_KEY`).
