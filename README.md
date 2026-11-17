# StockPyme — Frontend

Frontend en Next.js (App Router) para la API de inventario y ventas StockPyme, construido con
Clean Architecture organizada por feature.

Computación en Internet III — Universidad Icesi, 2026B.

## Requisitos

- Node.js 24 (fijado en `.node-version`)
- La API NestJS corriendo y accesible

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # y llenar los valores
npm run dev                  # next dev -p 3001 → http://localhost:3001
```

El frontend corre en el puerto **3001** porque el CORS del backend tiene ese origen permitido en
desarrollo (y la API ocupa el 3000).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API NestJS, sin barra final |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Llave **pública** de Wompi sandbox (`pub_test_…`). Las llaves privadas nunca van en el frontend |

`.env.local` nunca se commitea; `.env.example` documenta las variables.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3001 |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint, incluidas las fronteras entre capas |
| `npm run typecheck` | TypeScript en modo strict, sin emitir archivos |

## Arquitectura

```
src/
  app/                          App Router: layouts y rutas
  features/<feature>/           domain · application · infrastructure · presentation · di
  shared/
    domain/                     errores, Money, DateRange, paginate() y filter()
    infrastructure/http/        el único cliente HTTP de la API (Bearer, 401, ApiRequestError)
    infrastructure/config/      lectura de las variables de entorno
    presentation/               componentes de UI reutilizables
    di/                         la instancia del cliente HTTP
```

Features: `auth`, `users`, `suppliers`, `products`, `sales`, `payments`, `reports`. Las capas y las
reglas entre ellas están en [`src/features/README.md`](src/features/README.md).

### Cliente HTTP

`src/shared/infrastructure/http/fetch-http-client.ts` es el cliente de la API:

- agrega `Authorization: Bearer <token>` a todas las peticiones excepto `/auth/login` y `/health`;
- si recibe un **401** fuera del login, borra el token y redirige a `/login`, lo que cierra la
  sesión y reinicia el estado de todos los features;
- todo error se lanza como `ApiRequestError` (con `status` y `messages`), leyendo `message` tanto si
  la API lo manda como texto como si lo manda como arreglo;
- si la respuesta es **204**, no intenta parsear el cuerpo.

El token vive en una cookie para que el middleware pueda proteger las rutas desde el servidor.

La única excepción es el cliente de Wompi en `src/features/payments/infrastructure`, que usa la
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
| Sin token, cualquier ruta salvo `/login` | Redirige a `/login` |
| Token vencido o ilegible | Borra la cookie y redirige a `/login?session=expired` |
| Token vigente en `/login` | Redirige a `/dashboard` |

El token dura **1 hora** y no hay refresh; la cookie vive lo mismo. Si una petición recibe **401**,
el interceptor del cliente HTTP borra el token y lleva a `/login?session=expired`, donde se muestra
"Tu sesión expiró". El proxy solo lee la fecha de expiración del token; la firma y el rol los valida
la API en cada petición.

### Cold start de Render

El backend corre en el plan gratuito de Render, que lo duerme tras un rato sin tráfico. Al abrir
`/login` se llama a `GET /health` y se muestra "Conectando con el servidor…" hasta que responde, con
opción de reintentar si no lo hace.
