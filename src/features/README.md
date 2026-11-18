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

## Manejo de errores

Un **único mapper central** (`src/shared/infrastructure/http/api-error-mapper.ts`) traduce cada respuesta
fallida de la API a un error de dominio (`src/shared/domain/errors.ts`). El cliente HTTP lo aplica a
todo, así que ninguna capa por encima de `infrastructure/http` lee un código de estado:

| Respuesta | Error de dominio | En la interfaz |
| --- | --- | --- |
| 400 con `message` como arreglo | `ValidationError` con `fieldErrors` en español | Cada mensaje junto a su campo (`formErrorsFrom`); lo que no es de ningún campo, arriba del formulario |
| 401 | `UnauthorizedError` | El cliente cierra la sesión y lleva a `/login` |
| 403 | `ForbiddenError` | Un toast de aviso, venga de donde venga la petición |
| 404 | `NotFoundError` | `not-found.tsx` o el mensaje de la feature |
| 409 | `ConflictError` con el mensaje de negocio de la API | El mensaje, traducido por la feature cuando lo conoce |
| 502 | `GatewayError` (`isRetryable`) | Opción de reintentar: no cambió nada |
| otro 5xx / sin red | `ServerError` / `NetworkError` (`isRetryable`) | Opción de reintentar |

Los mappers de cada feature solo **especializan** esos errores (`ConflictError` en `POST /products` es
`DuplicateBarcodeError`), por tipo y nunca por número; los mensajes originales de la API quedan en
`error.details` para reconocerlos.

El feedback de una acción es un **toast** (`useToast`) y una confirmación es un **Modal**:
`window.alert`, `confirm` y `prompt` están prohibidos por ESLint (`no-alert`). Cada segmento de
`(protected)` tiene su `error.tsx` y su `loading.tsx` (`SegmentError`, `SegmentLoading`), y hay
`not-found.tsx` en el área privada, en cada detalle y en la raíz, más un `global-error.tsx`.

## Permisos por rol

La matriz vive en el dominio de auth (`src/features/auth/domain/permissions.ts`) y refleja los
`@Roles()` de la API. El admin puede todo; el seller solo `products:read`, `suppliers:read`,
`sales:create` y `sales:read-today`.

- **Esconder una acción:** `<Can permission="sales:cancel">…</Can>` o `usePermissions().can(...)`,
  exportados por `@/features/auth/presentation`. La regla nunca se escribe en el JSX
  (`role === "admin"`), siempre se pregunta a la matriz.
- **Bloquear una ruta:** se agrega a `ROUTE_RULES` en la misma matriz. El `AppShell` compara la ruta
  con el rol del perfil y, si no puede, muestra "Acceso denegado" en vez de la página, aunque se
  escriba la URL a mano. El rol no viaja en el JWT (la API lo lee de la base de datos), por eso esto no
  lo hace `proxy.ts`.
- **Si aun así llega un 403**, el cliente HTTP avisa y el `AppShell` muestra un aviso.

| Ruta | Permiso |
| --- | --- |
| `/usuarios` | `users:manage` |
| `/reportes` | `reports:read` |
| `/ventas/historial` | `sales:history` |
| `/ventas/nueva` | `sales:create` |
| `/productos/nuevo`, `/productos/[id]/editar` | `products:write` |
| `/proveedores/nuevo`, `/proveedores/[id]/editar` | `suppliers:write` |

## Al cerrar sesión

`POST /auth/logout` invalida los tokens del usuario en todos sus dispositivos. El front borra el
token (memoria y cookie) aunque la llamada falle, limpia los stores y redirige a `/login` con una
recarga completa.

Todo store creado con `createStore` o `createResource` se registra solo en
`src/shared/presentation/session-reset.ts`, y `logout` llama a `resetSessionState()`: todos los
stores vuelven a su estado inicial, estén o no en pantalla. Una petición que estaba en curso al
cerrar sesión se descarta, para que su respuesta no llene el store del siguiente usuario.

## Estado centralizado

Cada feature tiene **un store** en `presentation/<feature>-store.ts`, construido con
`src/shared/presentation/store.ts`:

| Feature | Store | Cómo se carga |
| --- | --- | --- |
| products | `productsCatalog` | **Catálogo cacheado**: se carga una vez y lo comparten las pantallas (alerta de stock bajo, `nameOf(id)`) |
| suppliers | `suppliersCatalog` | **Catálogo cacheado** (lista, `nameOf(id)`) |
| sales | `todaySalesResource`, `salesHistoryResource` | Se vuelven a pedir al abrir cada pantalla; mientras tanto se ve la copia anterior |
| reports | dashboard, stock bajo y una familia por rango / límite | Igual que ventas, y cada rango queda guardado |
| payments | `paymentStatuses` | El último estado conocido de cada venta cobrada en la sesión |
| users | `usersResource` | Cacheado, y cada cambio del admin actualiza la lista sin pedirla otra vez |
| auth | `AuthProvider` | La sesión; su `logout` resetea todos los demás |

Los componentes **solo** usan los hooks fachada: `useProducts`, `useSuppliers`, `useSales`,
`usePayment`, `useReports`, `useUsers` y `useAuth` (y `usePaymentStatus`, que exporta
`use-payment.ts`). Nunca llaman a un container ni a un store directamente. Las fachadas reciben qué
datos necesita la pantalla y no cargan lo demás:

```ts
const { today } = useSales({ today: true });
const { sales } = useReports({ salesRange: range });
const { cart } = useSales(); // dentro de <NewSaleProvider>
```

### Nombres por id desde otros features

Los catálogos de productos y proveedores se publican en `src/shared/presentation/name-catalogs.ts`
(los registra `src/app/(protected)/name-catalogs.tsx`, el único lugar que conoce ambos features).
Cualquier feature muestra un nombre por id sin importarlos:

```tsx
<CatalogName catalog="products" id={line.productId} fallback="Producto no disponible" />
```

Así lo hacen el detalle de una venta (nombres de sus productos) y el detalle de un producto (su
proveedor); por eso ya no piden en el servidor `GET /products` ni `GET /suppliers/:id` cada vez
que se abren: el catálogo se pide una vez por sesión.

Los features no se importan entre sí, así que cuando uno cambia datos que otro tiene en caché lo
avisa por `src/shared/presentation/data-changes.ts`: una venta llama a
`notifyDataChanged("sales", "products")`, y el catálogo de productos se marca desactualizado (se
recarga ya si está en pantalla, o la próxima vez que se abra).

## Pruebas unitarias

`npm test` corre Vitest en Node, sin navegador: el dominio y la aplicación no dependen de React.
Cada prueba vive junto a lo que prueba (`product.ts` → `product.test.ts`).

| Qué | Prueba |
| --- | --- |
| `Product`, `SaleDraft` (carrito), `DateRange`, `PaymentRequest`, `Money` | Sus reglas: qué aceptan, qué rechazan y con qué mensaje |
| Matriz de permisos | Cada permiso por rol y la regla de cada ruta |
| `CreateSaleUseCase` | Con un `SaleRepository` falso: solo envía ids y cantidades, y un carrito vacío no llega a la API |
| `PollPaymentStatusUseCase` | Con un `PaymentRepository` falso que responde `pending` y luego `paid`, y un reloj falso: no espera segundos reales |
| `GetSalesReportUseCase` | Con un `ReportRepository` falso que manda días sueltos: `byDay` sale completo, con 0 en los días sin ventas |

Los repositorios falsos son clases que implementan el puerto del dominio (`implements
SaleRepository`), así que TypeScript avisa si el puerto cambia. El reloj del polling es un puerto
(`PollingClock`) por la misma razón: el navegador recibe el real desde `di/`.

## Excepción justificada: el cliente de Wompi

`src/features/payments/infrastructure/wompi-card-tokenizer.ts` (`WompiCardTokenizer`) es el **único**
segundo cliente HTTP del proyecto, y existe a propósito:

- habla con Wompi, no con nuestra API, así que **no debe** enviar el JWT del usuario. Se autentica con
  la llave **pública** del comercio (`NEXT_PUBLIC_WOMPI_PUBLIC_KEY`);
- solo hace `POST /tokens/cards`: tokeniza la tarjeta directamente desde el navegador hacia Wompi,
  para que el número y el CVC nunca pasen por nuestro backend. El backend solo recibe el token, en
  `POST /sales/:id/payment` con `{ customerEmail, method: 'CARD', cardToken, installments }`;
- los datos de la tarjeta no se guardan en ningún estado ni store: el formulario usa campos no
  controlados, los lee una vez al enviar y se vacía al terminar;
- las llaves privadas viven únicamente en el backend, que es quien cobra (también el `acceptance_token`
  lo obtiene él).

Solo `payments/di/container.ts` lo instancia. Cualquier otra llamada HTTP usa el cliente compartido,
incluido el cobro con Nequi, que no pasa por Wompi desde el front.
