# Local development and database workflow

Run commands from the repository root unless a workspace is specified.

## Commands

| Purpose | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Start the combined development server | `npm run dev` |
| Build frontend and backend | `npm run build` |
| Start the compiled production backend | `npm run start` |
| Check local health and API | `npm run doctor` |
| Generate a Drizzle migration | `npm run db:generate` |
| Apply Drizzle migrations | `npm run db:migrate` |
| Remove the local SQLite database | `npm run reset` |

Workspace commands include `npm run build -w frontend`, `npm run build -w backend`, and `npm run dev -w backend`. `npm run dev -w frontend` starts Vite alone; the normal development entry point instead serves Vite through the backend.

There is currently no `lint` script or ESLint configuration, so `npm run lint` is not a supported command. Do not describe the installed ESLint packages as an operational lint workflow.

## Configuration and local state

- `.env.example` documents root environment configuration. `WEATHER_API_KEY` is optional.
- `DATABASE_PATH` overrides the default `backend/weather.db` location.
- `npm run dev` uses Portless at `http://weather-starter.localhost:1355` by default. `PORTLESS_PORT` and `PORTLESS_HTTPS` configure its port and HTTPS mode.
- The SQLite database is runtime data, not source code. Avoid committing local database contents.
