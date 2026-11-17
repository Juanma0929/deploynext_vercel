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
npm run dev                  # http://localhost:3001
```

La API usa el puerto 3000 en desarrollo, por eso el frontend corre en el 3001.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API NestJS, sin barra final |

`.env.local` nunca se commitea; `.env.example` documenta las variables.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint, incluidas las fronteras entre capas |
| `npm run typecheck` | TypeScript en modo strict, sin emitir archivos |

## Arquitectura

```
src/
  app/                          App Router: layouts y rutas
  features/<feature>/           domain · application · infrastructure · presentation · di
  shared/
    domain/                     errores comunes de la aplicación
    infrastructure/http/        el único cliente HTTP, con el interceptor del Bearer y del 401
    infrastructure/config/      lectura de las variables de entorno
    presentation/               componentes de UI reutilizables
    di/                         la instancia del cliente HTTP
```

Las capas y las reglas entre ellas están en [`src/features/README.md`](src/features/README.md).

### Cliente HTTP

`src/shared/infrastructure/http/fetch-http-client.ts` es el único lugar que llama a `fetch`:

- agrega `Authorization: Bearer <token>` a cada petición;
- si una petición autenticada recibe **401**, borra el token y redirige a `/login`, lo que cierra
  la sesión y reinicia el estado de todos los features;
- traduce 400, 401, 403, 404 y 409 a errores de la aplicación con mensajes para el usuario.

El token vive en una cookie para que el middleware pueda proteger las rutas desde el servidor.
