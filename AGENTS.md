# AGENTS.md

Weather Starter is an npm-workspace TypeScript app for tracking Singapore weather snapshots, with a React/Vite frontend and an Express/SQLite backend.

## Repository guidance

- The root build is `npm run build`; it runs the frontend typecheck and Vite production build, then compiles backend TypeScript.
- Read the focused guide relevant to your task:
  - [Architecture and API boundaries](docs/agent-guides/architecture.md)
  - [Testing](docs/agent-guides/testing.md)
  - [Local development and database workflow](docs/agent-guides/local-development.md)

## Agent skills

### Issue tracker

Issues and specs for this repo live in GitHub Issues on `braveheart84/weather-starter`. Use the `gh` CLI with `--repo braveheart84/weather-starter`. See `docs/agents/issue-tracker.md`.

### Domain docs

Use the single-context domain docs layout. See `docs/agents/domain.md`.
