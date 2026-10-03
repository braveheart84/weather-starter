# Testing

- Run the backend API suite with `npm test`; use `npm run test:watch` for watch mode.
- Vitest uses the Node environment and discovers only `backend/src/**/*.test.ts`. Existing API tests are in `backend/src/routes/locations.test.ts` and use Supertest.
- Tests use temporary SQLite databases. Do not point tests at or modify the developer's default `backend/weather.db`.
- `npm run build` also checks TypeScript: frontend `tsc` and Vite build, followed by backend `tsc`.
