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

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint, incluidas las fronteras entre capas |
| `npm run typecheck` | TypeScript sin emitir archivos |

Pendientes de este informe: funcionalidades implementadas, autenticación,
autorización, gestión del estado, variables de entorno, URLs de producción y
herramientas de IA utilizadas.
