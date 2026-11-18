# StockPyme — Frontend

Frontend en Next.js (App Router) para la API de inventario y ventas StockPyme, construido con
Clean Architecture organizada por feature.

Computación en Internet III — Universidad Icesi, 2026B.

| | URL |
| --- | --- |
| Frontend (Vercel) | https://deploynext-vercel.vercel.app |
| API (Render) | https://stockpyme-api-g4.onrender.com |
| Repositorio de la API | `ICESI-CI3/icesi-2026b-nestjs-taller-group-4` (privado) |

## Contenido

- [Requisitos](#requisitos)
- [Cómo correrlo](#cómo-correrlo)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Pruebas](#pruebas)
- [Despliegue y CI/CD](#despliegue-y-cicd)
- [Arquitectura](#arquitectura)

## Requisitos

- Node.js 24 (fijado en `.node-version`)
- La API NestJS corriendo y accesible (local o la de Render)

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # y llenar los valores
npm run dev                  # next dev -p 3001 → http://localhost:3001
```

El frontend corre en el puerto **3001** porque el CORS del backend tiene ese origen permitido en
desarrollo (y la API ocupa el 3000).

## Variables de entorno

| Variable | Archivo | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `.env.local` | URL base de la API NestJS, sin barra final |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | `.env.local` | Llave **pública** de Wompi sandbox (`pub_test_…`). Las llaves privadas nunca van en el frontend |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | `.env.e2e.local` | Usuario admin del seed de la API, para las pruebas E2E |
| `E2E_SELLER_EMAIL`, `E2E_SELLER_PASSWORD` | `.env.e2e.local` | Usuario seller del seed de la API, para las pruebas E2E |
| `E2E_BASE_URL` | `.env.e2e.local` | Opcional: probar un frontend ya desplegado en vez de levantar uno local |

Las variables `NEXT_PUBLIC_*` se **incrustan en el build**: si cambian, hay que volver a construir
(y en Vercel, volver a desplegar).

Ningún `.env*` se commitea (`.gitignore`), salvo las plantillas `.env.example` y
`.env.e2e.example`, que documentan las variables.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3001 |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción en el puerto 3001 |
| `npm run lint` | ESLint, incluidas las fronteras entre capas |
| `npm run typecheck` | TypeScript en modo strict, sin emitir archivos |
| `npm test` | Pruebas unitarias con Vitest (`npm run test:watch` para dejarlas corriendo) |
| `npm run test:e2e` | Pruebas E2E con Playwright contra la API real (`npm run test:e2e:ui` para el modo visual) |

## Pruebas

### Unitarias

`npm test` corre Vitest en Node, sin navegador: el dominio y la aplicación no dependen de React.
Cada prueba vive junto a lo que prueba (`product.ts` → `product.test.ts`).

- **Entidades y valores:** `Product`, `SaleDraft` (carrito), `DateRange`, `PaymentRequest`, `Money`
  y la matriz de permisos.
- **Casos de uso con repositorios falsos:** creación de una venta, polling del pago (`pending` →
  `paid`, con un reloj falso que no espera segundos reales) y el relleno de días en el reporte de
  ventas (`byDay`).

El detalle está en [`src/features/README.md`](src/features/README.md#pruebas-unitarias).

### E2E

Corren en Chromium contra la API de `NEXT_PUBLIC_API_URL`, con los usuarios que crea su seed:

1. La API tiene que estar corriendo, con el seed aplicado y las llaves del sandbox de Wompi.
2. Copia `.env.e2e.example` a `.env.e2e.local` (no se sube) y escribe las contraseñas de
   `SEED_ADMIN_PASSWORD` y `SEED_SELLER_PASSWORD` de esa API.
3. La primera vez: `npx playwright install chromium`.
4. `npm run test:e2e`. Playwright compila y levanta el frontend en el puerto 3001 (o usa el que
   ya esté corriendo ahí); con `E2E_BASE_URL` prueba otro.

| Archivo | Qué prueba |
| --- | --- |
| `e2e/auth.spec.ts` | Login correcto, login fallido, logout, y que una ruta protegida sin token redirige a `/login` |
| `e2e/authorization.spec.ts` | El seller no ve Reportes ni Usuarios y por URL ve "Acceso denegado"; el admin sí los ve |
| `e2e/business-flow.spec.ts` | En serie: el admin crea un producto, el seller lo vende y lo cobra con Nequi `3991111111` hasta `paid`, y el admin lo desactiva |

Son **repetibles**: el flujo de negocio crea su propio producto con un código de barras único
(`E2E<timestamp>`), así que no depende del stock del seed ni lo agota. Cada corrida deja un
producto inactivo (`E2E Producto …`) y una venta pagada.

Si una prueba falla, el reporte HTML queda en `playwright-report/` (con el *trace* del fallo) y
se abre con `npx playwright show-report`. En CI se descarga como artifact.

## Despliegue y CI/CD

```
 GitHub (push / PR)
        │
        ▼
 GitHub Actions ── quality ──┐
                 └─ e2e ─────┼──► deploy (solo push a main) ──► Vercel (frontend)
                             │                                     │  fetch + JWT
                             └── llaman a la API ─────────────────►▼
                                                              Render (API NestJS + Postgres)
```

- El **frontend** vive en Vercel y lo despliega **solo GitHub Actions**, después de que pasan todas
  las pruebas.
- La **API** vive en Render (Blueprint `render.yaml` del repo del backend) y la despliega el CI de
  ese repo con un *deploy hook*.

### Pipeline: `.github/workflows/ci.yml`

Corre en cada pull request y en cada push a `main`. Un push nuevo a la misma rama cancela la
corrida anterior.

| Job | Cuándo | Qué hace |
| --- | --- | --- |
| `quality` — Lint, typecheck y pruebas unitarias | Siempre | `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` |
| `e2e` — Pruebas E2E (Playwright) | Siempre | Instala Chromium, espera a que `GET /health` de Render responda (hasta 3 min, por el cold start), construye el front con la API de Render y corre `npm run test:e2e`. Sube `playwright-report/` y `test-results/` como artifact |
| `deploy` — Desplegar en Vercel | Solo push a `main`, y solo si `quality` y `e2e` pasan | `vercel deploy --prod`: sube el código y Vercel construye y publica |

Decisiones del pipeline:

- **Los E2E corren contra la API de Render**, no contra un backend levantado en el runner: el repo
  del backend es privado y clonarlo desde otro repo necesita un token con permisos sobre la
  organización. Por eso el job `e2e` nunca corre dos veces a la vez (`concurrency: e2e-render`):
  la API es estado compartido.
- **El build de producción lo hace Vercel**, no el runner: las variables de Vercel son *Sensitive*
  y solo se pueden leer dentro de sus propios builds. Con `vercel pull` + `vercel build` en el runner,
  el bundle quedaría con el texto `[SENSITIVE]` en lugar de la URL de la API.
- **Vercel no despliega por su cuenta**: `vercel.json` tiene `"git": { "deploymentEnabled": false }`,
  así que ni un push ni un PR publican código que no pasó las pruebas.

### Secrets de GitHub Actions

En **Settings → Secrets and variables → Actions** del repo:

| Secret | Para qué |
| --- | --- |
| `VERCEL_TOKEN` | Token de la cuenta de Vercel (Account Settings → Tokens) |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | `orgId` y `projectId` de `.vercel/project.json` (lo crea `npx vercel link`) |
| `E2E_ADMIN_PASSWORD`, `E2E_SELLER_PASSWORD` | Contraseñas de los usuarios del seed **en Render** |
| `E2E_ADMIN_EMAIL`, `E2E_SELLER_EMAIL` | Opcionales: por defecto `admin@stockpyme.com` y `seller@stockpyme.com` |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Llave pública del sandbox de Wompi, para el build de los E2E |

### Configuración de Vercel

- Proyecto importado como Next.js; `vercel.json` fija `npm ci` y `npm run build`.
- En **Settings → Environment Variables → Production**:
  - `NEXT_PUBLIC_API_URL` = `https://stockpyme-api-g4.onrender.com`
  - `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` = `pub_test_…`
- Para redesplegar sin un push (por ejemplo, tras cambiar una variable): **Deployments → Redeploy**.

### Configuración de Render (CORS)

La API solo acepta peticiones de los orígenes de `CORS_ORIGINS` (lista separada por comas, sin `/`
final). En el servicio `stockpyme-api-g4` → **Environment**:

```
CORS_ORIGINS=https://deploynext-vercel.vercel.app,http://localhost:3001
```

- `https://deploynext-vercel.vercel.app`: la app publicada.
- `http://localhost:3001`: el desarrollo local y **los E2E de GitHub Actions**, que abren el front
  en ese puerto contra la API de Render.

La variable se lee al arrancar: después de cambiarla, **Save, rebuild and deploy**. Para verificar:

```bash
curl -si -X OPTIONS https://stockpyme-api-g4.onrender.com/auth/login \
  -H "Origin: https://deploynext-vercel.vercel.app" \
  -H "Access-Control-Request-Method: POST" | grep -i access-control-allow-origin
```

### Problemas comunes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| "No se pudo conectar con el servidor" en Vercel | El origen de Vercel no está en `CORS_ORIGINS`, o el bundle no tiene la URL de la API | Agregar el origen en Render; revisar las variables de Vercel y redesplegar |
| Todos los E2E fallan en CI a los ~15 s, incluso el login fallido | `http://localhost:3001` no está en `CORS_ORIGINS` | Agregarlo en Render y redesplegar la API |
| Solo fallan los logins correctos | Los secrets `E2E_*_PASSWORD` no coinciden con el seed de Render | Corregir los secrets |
| El job `e2e` falla en "Despertar la API de Render" | Render tardó más de 3 min en arrancar | Volver a correr el job |
| El primer login en la app tarda | Cold start del plan gratis de Render | Esperar: `/login` muestra "Conectando con el servidor…" |

## Arquitectura

```
src/
  app/                          App Router: layouts y rutas
  features/<feature>/           domain · application · infrastructure · presentation · di
  shared/
    domain/                     errores, Money, DateRange, paginate() y filter()
    infrastructure/http/        el único cliente HTTP de la API (Bearer, 401, mapper de errores)
    infrastructure/config/      lectura de las variables de entorno
    presentation/               store, catálogos de nombres, avisos de cambios entre features
    presentation/ui/            el kit de UI tipado (ver abajo)
    di/                         la instancia del cliente HTTP
e2e/                            pruebas Playwright y sus helpers de sesión
```

Features: `auth`, `users`, `suppliers`, `products`, `sales`, `payments`, `reports`. Los features
nunca se importan entre sí. Las capas, las reglas entre ellas y los temas de abajo están en
[`src/features/README.md`](src/features/README.md):

- [Qué puede importar cada capa](src/features/README.md#qué-puede-importar-cada-capa)
- [Manejo de errores](src/features/README.md#manejo-de-errores): un mapper central traduce cada
  respuesta de la API a un error de dominio
- [Permisos por rol](src/features/README.md#permisos-por-rol): la matriz de permisos, `<Can>` y
  "Acceso denegado"
- [Al cerrar sesión](src/features/README.md#al-cerrar-sesión): el logout resetea todos los stores
- [Estado centralizado](src/features/README.md#estado-centralizado): un store por feature,
  catálogos cacheados y hooks fachada
- [Pruebas unitarias](src/features/README.md#pruebas-unitarias)

### Layout y kit de UI

El área privada (`AppShell`) tiene un **sidebar fijo en escritorio** y, en móvil, una barra con un botón
**Menú** que abre un **drawer** (sobre `<dialog>`: atrapa el foco, cierra con Escape, con el fondo o al
elegir una opción). El menú se filtra con la matriz de permisos del rol y resalta la página actual.

Todas las pantallas usan los componentes de `src/shared/presentation/ui`, importados desde
`@/shared/presentation/ui`, en vez de repetir clases de Tailwind:

| Componente | Para qué |
| --- | --- |
| `Button`, `ButtonLink`, `FilterChip` | Acciones (`primary`, `secondary`, `danger`, `danger-outline`, `link`) y filtros en píldora |
| `Field`, `TextInput`, `Select`, `Textarea`, `Checkbox` | Formularios: etiqueta, `*`/`(opcional)`, ayuda y error con `aria-describedby` (`describedBy()`) |
| `Table` y sus celdas, `EmptyState`, `MissingValue` | Tablas que se desplazan en pantallas angostas |
| `Pagination`, `LinkPagination` | Paginación en estado del cliente o en la URL |
| `Modal`, `ModalActions` | Confirmaciones (nunca `window.confirm`) |
| `Toast` (`ToastProvider`, `useToast`) | Avisos breves de una acción: "Stock guardado", 403 |
| `Alert`, `RetryAlert`, `LoadingText` | Mensajes que se quedan en pantalla, errores con "Reintentar" |
| `Badge` | Estados con un color por significado; `SaleStatusBadge` da uno por `SaleStatus` |
| `MoneyText` | Un `Money` en formato es-CO, con dígitos alineados y opción de rojo si es negativo |
| `PageHeader`, `Breadcrumbs`, `Panel`, `Stat`, `StatusPage` | La estructura de cada pantalla, y las de 403, 404 y error |

### Cliente HTTP

`src/shared/infrastructure/http/fetch-http-client.ts` es el cliente de la API:

- agrega `Authorization: Bearer <token>` a todas las peticiones excepto `/auth/login` y `/health`;
- si recibe un **401** fuera del login, borra el token y redirige a `/login`, lo que cierra la
  sesión y reinicia el estado de todos los features;
- todo error pasa por el mapper central y llega como un error de dominio (`ValidationError`,
  `ConflictError`, `NetworkError`…), así que ninguna pantalla lee códigos de estado;
- si la respuesta es **204**, no intenta parsear el cuerpo.

El token vive en una cookie para que el proxy pueda proteger las rutas desde el servidor.

La única excepción es `WompiCardTokenizer` en `src/features/payments/infrastructure`, que usa la
llave pública y no el token del usuario. La justificación está en
[`src/features/README.md`](src/features/README.md#excepción-justificada-el-cliente-de-wompi).

### Utilidades del dominio compartido

| Utilidad | Qué garantiza |
| --- | --- |
| `Money` | Pesos colombianos siempre enteros; `format()` en `es-CO` (`$ 12.500`) |
| `DateRange` | Fechas `YYYY-MM-DD` que existen en el calendario y `from ≤ to` |
| `paginate()` | Página de una lista, con la página fuera de rango ajustada |
| `filter()` | Aplica solo los criterios activos (los vacíos se ignoran) |

### Rutas protegidas

Las rutas privadas viven en el grupo `src/app/(protected)`, con su propio `layout.tsx`.
`src/proxy.ts` (el `middleware.ts` de Next.js 16, que lo renombró a *proxy*) decide en el servidor,
antes de renderizar:

| Situación | Resultado |
| --- | --- |
| Sin token, cualquier ruta salvo `/login` | Redirige a `/login?next=<ruta pedida>` |
| Token vencido o ilegible | Borra la cookie y redirige a `/login?session=expired&next=<ruta pedida>` |
| Token vigente en `/login` | Redirige al inicio (`/`) |

El token dura **1 hora** y no hay refresh; la cookie vive lo mismo. Si una petición recibe **401**,
el interceptor del cliente HTTP borra el token y lleva a `/login?session=expired`, donde se muestra
"Tu sesión expiró". Tras iniciar sesión de nuevo, `?next=` devuelve al usuario a donde estaba. El
proxy solo lee la fecha de expiración del token; la firma y el rol los valida la API en cada
petición.

### Cold start de Render

El backend corre en el plan gratuito de Render, que lo duerme tras un rato sin tráfico. Al abrir
`/login` se llama a `GET /health` y se muestra "Conectando con el servidor…" hasta que responde, con
opción de reintentar si no lo hace.
