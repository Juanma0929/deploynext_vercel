# StockPyme — Frontend

Frontend en Next.js (App Router) para la API de inventario y ventas StockPyme,
construido con Clean Architecture organizada por funcionalidad.

Computación en Internet III — Universidad Icesi, 2026B.

## Integrantes

| Integrante | GitHub |
| --- | --- |
| Juan José Reyes | [@jjrr2331](https://github.com/jjrr2331) |
| Juan Manuel | [@Juanma0929](https://github.com/Juanma0929) |
| Sebastián Poveda | [@Sebastian-Poevada-dev](https://github.com/Sebastian-Poevada-dev) |

## Backend

Este frontend consume la API desarrollada en el taller anterior:
[icesi-2026b-nestjs-taller-group-4](https://github.com/ICESI-CI3/icesi-2026b-nestjs-taller-group-4)
(NestJS, documentación Swagger en `/docs`).

## Requisitos

- Node.js 24 (la versión está fijada en `.node-version`)
- La API corriendo y accesible

## Instalación

```bash
npm install
cp .env.example .env.local   # y llenar los valores
npm run dev -- -p 3001
```

La API usa el puerto 3000 en desarrollo, así que el frontend corre en el 3001.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API NestJS, sin barra final |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Llave pública de Wompi sandbox, para tokenizar la tarjeta en el navegador |

`.env.local` no se commitea nunca. `.env.example` documenta las variables.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint, incluidas las fronteras entre capas |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm test` | Pruebas unitarias del dominio y los casos de uso (Vitest) |
| `npm run test:e2e` | Pruebas end-to-end en navegador (Playwright) |
| `npm run test:e2e:ui` | Lo mismo, en modo interactivo |

## Arquitectura

```
src/
  app/            App Router: layouts, rutas, loading/error/not-found
  features/       un folder por funcionalidad, con cinco capas cada uno
  shared/         el cliente HTTP único, los errores comunes y el kit de UI
```

Las capas y las reglas entre ellas están descritas en
[`src/features/README.md`](src/features/README.md) y las verifica
`eslint-plugin-boundaries`: un import que apunte en la dirección equivocada
hace fallar `npm run lint`.

## Pruebas

Las unitarias cubren el dominio y los casos de uso con repositorios falsos, sin
red: `npm test`.

Las end-to-end usan Playwright y cubren autenticación y autorización. Por
defecto compilan la aplicación, la sirven en el puerto 3001 y la prueban contra
la API desplegada, así que antes de correrlas hay que definir en `.env.local`
las cuatro variables `E2E_*` que documenta `.env.example`:

```bash
npm run test:e2e
```

Dos cosas que hay que saber:

- **La API tiene que permitir `http://localhost:3001` en `CORS_ORIGINS`**, o el
  navegador bloquea cada petición. La variable acepta varios orígenes separados
  por comas.
- **La suite corre en serie a propósito.** `POST /auth/logout` invalida todos
  los tokens del usuario en todos los dispositivos, y las pruebas comparten las
  dos cuentas del seed: en paralelo, una prueba que cierra sesión mataría la de
  otra. Correr de a una es lo que hace que la suite dé el mismo resultado dos
  veces seguidas.

Para probar contra el entorno desplegado en vez de uno local:

```bash
PLAYWRIGHT_BASE_URL=https://icesi-2026b-2026b-nextjs-taller-gro.vercel.app npm run test:e2e
```

## Pipelines

`.github/workflows/ci.yml` corre en cada pull request y en cada push a `main`:
lint (con las fronteras entre capas), typecheck, pruebas unitarias y build;
después las end-to-end con Playwright. Si todo pasa y el push fue a `main`,
despliega a Vercel con el CLI. No se despliega nada que no haya pasado las dos
suites.

Las pruebas end-to-end necesitan, en Settings → Secrets and variables →
Actions, la variable `NEXT_PUBLIC_API_URL` (es pública) y los cuatro secretos
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_SELLER_EMAIL` y
`E2E_SELLER_PASSWORD`.

El despliegue no usa la integración de GitHub de Vercel: esa integración exige
plan Pro para leer un repositorio privado de una organización, y este repo
pertenece a `ICESI-CI3`. El CLI no pasa por ahí, así que el plan gratuito
alcanza.

## Despliegue

El frontend se despliega en Vercel y el backend en Render. Pasos:

1. **Backend (Render):** ya está definido en `render.yaml` del repo del backend.
   Anotar la URL pública de la API.
2. **Frontend (Vercel):** crear el proyecto desde la máquina, sin conectar el
   repositorio:

   ```bash
   npx vercel login
   npx vercel link        # crea el proyecto y escribe .vercel/project.json
   ```

   En el panel de Vercel, definir `NEXT_PUBLIC_API_URL` con la URL de la API y
   `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` con la llave pública de Wompi sandbox.
3. **CORS:** en Render, definir `CORS_ORIGINS` con la URL de Vercel. Sin esto el
   navegador bloquea todas las peticiones, porque el frontend y la API quedan en
   dominios distintos.
4. **Pipeline:** en este repositorio, agregar tres secretos (Settings → Secrets
   and variables → Actions):

   | Secreto | De dónde sale |
   | --- | --- |
   | `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
   | `VERCEL_ORG_ID` | `.vercel/project.json`, campo `orgId` |
   | `VERCEL_PROJECT_ID` | `.vercel/project.json`, campo `projectId` |

   `.vercel/` no se commitea: queda ignorado por `.gitignore`.

Pendientes de este informe: funcionalidades implementadas, autenticación,
autorización, gestión del estado, URLs de producción y herramientas de IA
utilizadas.
