# Architecture and API boundaries

## Runtime layout

- `backend/src/server.ts` creates the Express app, configures logging and JSON parsing, exposes `/health` and `/api/logs`, mounts the location router, and serves the frontend. Development uses Vite middleware; production serves `frontend/dist`.
- `backend/src/routes/locations.ts` implements location endpoints, validates Singapore coordinates, coordinates persistence and refresh, and accepts an injectable `WeatherClient` for testing.
- `backend/src/weather.ts` integrates with data.gov.sg and transforms provider responses into the app's `WeatherSnapshot` shape.
- `backend/src/db.ts` initializes SQLite, applies migrations, and provides persistence helpers. `backend/src/schema.ts` defines the Drizzle schema and snapshot shape; generated SQL migrations are in `backend/drizzle/`.
- `backend/src/logger.ts` configures structured Pino logging.
- `frontend/src/main.tsx` mounts React. `frontend/src/App.tsx`, `frontend/src/state/store.tsx`, and `frontend/src/api.ts` form the main UI, client state, and API layer. Reusable UI is in `frontend/src/components/`; shared frontend types are in `frontend/src/types.ts`.
- `scripts/` holds development/production launchers and operational helpers. Root `package.json` coordinates the npm workspaces and tools.

## Request and data flow

The browser calls same-origin `/api` endpoints. Express serves those requests and hosts the frontend. Creating a location stores its coordinates and attempts an initial weather refresh. Refreshes fetch data.gov.sg and persist the latest snapshot in SQLite; listing locations reads the stored snapshot and does not fetch from the provider on every page load.

## Boundaries when changing behavior

- Keep HTTP handling and validation in the location router, database operations in `db.ts`, and provider request/parsing logic in `weather.ts`.
- Keep frontend API requests relative (for example, `/api/locations`) so development and production use the same origin.
- For schema changes, update `backend/src/schema.ts` and generate and commit the matching migration under `backend/drizzle/`.
