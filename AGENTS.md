# Repository Guidelines

## Project Structure & Module Organization
The repository stays minimal: runtime code in `src/`, static files in `public/`, and mirrored specs in `tests/`. `src/main.ts` boots the app, `src/components/` contains UI helpers (status, clipboard), `src/format/` holds pure utilities such as `prettyPrint.ts`, and `src/editor/` wraps Ace configuration + worker URLs. Keep modules independent and export explicit functions so workers and the main thread can share them without side effects.

## Build, Test, and Development Commands
Install dependencies with `npm install`, then rely on three core scripts: `npm run dev` (Vite dev server with instant reload), `npm run build` (production bundle under `dist/`), and `npm run preview` (serve the built assets exactly how they will ship). Guard every change with `npm run test` plus `npm run lint && npm run format`; these commands finish in seconds, so they should run before every push or PR.

## Coding Style & Naming Conventions
Use TypeScript, ES modules, and 2-space indentation. Components and classes use PascalCase (`DualPane.ts`), utilities use camelCase (`prettyPrint.ts`), and constants live in `UPPER_SNAKE_CASE`. Favor `const`, keep functions under 50 lines, and move shared logic into `src/format` so it can be unit-tested easily. Formatting and linting are enforced through Prettier (`npm run format`) and ESLint with `@typescript-eslint` (`npm run lint`); do not bypass either.

## Testing Guidelines
Vitest drives the suite. Create files such as `tests/format/prettyPrint.spec.ts` for logic and `tests/components/dualPane.spec.ts` for DOM behavior with `@testing-library/dom`. Aim for ≥90 % coverage in `src/format` and smoke-test at least one payload around 5 MB to ensure we never block the UI thread. Name tests descriptively (`it('formats invalid JSON with clear errors')`) and run `npm run test -- --watch` while iterating.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat: auto-focus input`, `fix: layout jitter on iOS`). PRs must include: summary, linked issues, before/after screenshots for UI tweaks, verification notes (`npm run lint && npm run test && npm run build`), and any performance measurements. Keep diffs under ~300 lines when possible and request review only after resolving lint/test noise.

## Performance & Security Notes
Everything must work from static hosting: no servers, analytics, or dynamic imports that require credentials. Keep third-party packages to the bare minimum and watch the gzip budget with `npm run build -- --stats`. Treat pasted text as untrusted input, escape any rendered snippets, and never eval JSON—stick to `JSON.parse` plus transparent error reporting.
