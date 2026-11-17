# StockPyme — Frontend

Frontend in Next.js (App Router) for the StockPyme inventory and sales API,
built with Clean Architecture organised by feature.

Backend: [`icesi-2026b-nestjs-taller-group-4`](https://github.com/ICESI-CI3/icesi-2026b-nestjs-taller-group-4)
(NestJS, Swagger at `/docs`).

## Requirements

- Node.js 24
- The API running and reachable

## Installation

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3001
```

The API already uses port 3000 in development, so run the frontend on another
port: `npm run dev -- -p 3001`.

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the NestJS API, with no trailing slash |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Wompi sandbox public key, used to tokenise the card in the browser |

`.env.local` is never committed. `.env.example` documents the variables.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint, including the architecture boundaries |
| `npm run typecheck` | TypeScript with no emit |
| `npm test` | Unit tests of the domain and the use cases (Vitest) |

## Architecture

```
src/
  app/            App Router: layouts, routes, loading/error/not-found
  features/       one folder per feature, five layers each
  shared/         the single HTTP client, shared errors and the UI kit
```

The layers and the rules between them are described in
[`src/features/README.md`](src/features/README.md) and enforced by
`eslint-plugin-boundaries` in `eslint.config.mjs`: an import that points the
wrong way fails `npm run lint`.

Pending sections of this report: implemented features, authentication,
authorisation, state management, deployed URLs and the AI tools used.
