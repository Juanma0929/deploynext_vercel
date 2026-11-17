# Features

Cada feature (`auth`, `users`, `suppliers`, `products`, `sales`, `payments`, `reports`) tiene las
mismas cinco capas:

```
src/features/<feature>/
  domain/          entidades (validan sus invariantes en el constructor) + puertos (interfaces de repositorio)
  application/     casos de uso, una clase por caso, que dependen solo de los puertos
  infrastructure/  repositorios HTTP, DTOs y mappers DTO ↔ entidad
  presentation/    componentes, hooks fachada y el store/context del feature
  di/              el ÚNICO lugar donde se instancian repositorios y casos de uso
```

## Qué puede importar cada capa

`eslint-plugin-boundaries` lo verifica en `npm run lint`: un import que no esté en esta tabla es un error.

| Desde | Puede importar |
| --- | --- |
| `domain` | `domain` del mismo feature, `shared/domain` |
| `application` | `domain` y `application` del mismo feature, `shared/domain` |
| `infrastructure` | `domain` e `infrastructure` del mismo feature, `shared/domain`, `shared/infrastructure` |
| `presentation` | `domain`, `application`, `presentation` y `di` del mismo feature, `shared/domain`, `shared/presentation` |
| `di` | `domain`, `application`, `infrastructure` y `di` del mismo feature, `shared/domain`, `shared/infrastructure`, `shared/di` |
| `src/app` | `presentation` y `di` de cualquier feature, `shared/domain`, `shared/presentation` |

Además:

- `domain` y `application` (y `shared/domain`) no pueden importar React, Next.js ni librerías HTTP.
- `presentation` nunca importa `infrastructure`: obtiene los casos de uso desde `di/`.
- Solo las capas `infrastructure` pueden usar `fetch`. Todo lo demás pasa por el `HttpClient` de
  `src/shared/infrastructure/http`, que se crea en `src/shared/di/http.ts`.
- Un feature no importa otro feature. Si dos necesitan lo mismo, va en `src/shared`.

## Al cerrar sesión

`POST /auth/logout` invalida los tokens del usuario en todos sus dispositivos. El front borra el
token (memoria y cookie) aunque la llamada falle, limpia los stores y redirige a `/login` con una
recarga completa.

Cada store de un feature debe registrar su reset en `src/shared/presentation/session-reset.ts`, para
que no quede nada del usuario anterior aunque el store sobreviva a la recarga (por ejemplo, uno que
persiste en `localStorage`):

```ts
import { onSessionReset } from "@/shared/presentation/session-reset";

onSessionReset(() => useProductsStore.getState().reset());
```

## Excepción justificada: el cliente de Wompi

`src/features/payments/infrastructure/wompi-client.ts` es el **único** segundo cliente HTTP del
proyecto, y existe a propósito:

- habla con Wompi, no con nuestra API, así que **no debe** enviar el JWT del usuario. Se autentica con
  la llave **pública** del comercio (`NEXT_PUBLIC_WOMPI_PUBLIC_KEY`);
- tokeniza la tarjeta (o Nequi) directamente desde el navegador hacia Wompi, para que el número y el
  CVC nunca pasen por nuestro backend. El backend solo recibe el token resultante;
- las llaves privadas viven únicamente en el backend.

Solo `payments/di/wompi.ts` lo instancia. Cualquier otra llamada HTTP usa el cliente compartido.
