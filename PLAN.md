# Plan de trabajo — StockPyme Frontend (Next.js + Clean Architecture)

Entrega y sustentación: **18 de noviembre de 2026**.
Backend existente: `icesi-2026b-nestjs-taller-group-4` (NestJS 11, Swagger en `/docs`).

## Reglas de equipo (afectan la nota individual)

- Cada integrante commitea **con su propia cuenta de GitHub**, en commits pequeños y frecuentes.
  La rúbrica reduce la nota individual si el repo lo domina una sola persona o si todo llega en un
  commit masivo al final.
- Una rama por integrante: `feat/<area>` → PR a `main`. La rama base se mergea primero.
- Nadie toca archivos de otro feature. Lo compartido (`src/shared/**`) lo cambia el dueño de la base;
  si alguien necesita algo ahí, lo pide en el chat del equipo.
- Cada integrante debe poder **explicar y depurar cualquier parte** de la app en la sustentación:
  al terminar su feature, explíquele su código a los otros tres.

## Stack acordado

| Pieza | Elección |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript estricto |
| Estilos | Tailwind CSS v4 |
| Estado | Context API + hooks fachada por feature (como RodaYa en clase) |
| HTTP | `fetch` envuelto en un único cliente en `shared/infrastructure/http` |
| Tests unitarios | Vitest (dominio y casos de uso, con repos falsos) |
| E2E | Playwright |
| Fronteras de capas | `eslint-plugin-boundaries` |
| Despliegue | Vercel (frontend) + Render (backend ya existente) |

## Estructura objetivo

```
src/
  app/                              # App Router: layouts, rutas, loading/error/not-found
    (public)/login/
    (protected)/
      layout.tsx                    # layout propio de la zona protegida (guard + nav)
      dashboard/ products/ suppliers/ sales/ reports/ users/
  features/
    auth/        { domain, application, infrastructure, presentation, di }
    products/    { domain, application, infrastructure, presentation, di }
    suppliers/   { domain, application, infrastructure, presentation, di }
    sales/       { domain, application, infrastructure, presentation, di }
    reports/     { domain, application, infrastructure, presentation, di }
    users/       { domain, application, infrastructure, presentation, di }
  shared/
    domain/                         # errores de dominio, Money, Result
    infrastructure/http/            # HttpClient único + interceptor del Bearer
    presentation/components/        # Button, Input, Table, Modal, Pagination, Toast…
    presentation/hooks/
```

Contrato por capa, igual en **todos** los features:

- `domain/`: entidades que **validan sus invariantes en el constructor** (no pueden existir en
  estado inválido) + puertos (`ProductRepository`, etc.). Cero imports de React/Next/fetch.
- `application/`: casos de uso, una clase por caso (`CreateProduct`, `ListLowStock`…), dependen
  solo de puertos.
- `infrastructure/`: DTOs, mappers DTO↔entidad e implementación del repositorio sobre el
  `HttpClient` compartido.
- `presentation/`: componentes y **hooks fachada** (`useProducts`, `useSale`…). Los componentes no
  llaman red ni store directamente.
- `di/`: el **único** lugar donde se instancian repositorios y casos de uso concretos.

## Reparto de trabajo (4 integrantes)

### Integrante 1 — Base, shared y autenticación/autorización *(camino crítico: va primero)*
Peso en rúbrica: App Router 5% + Auth 5% + Autorización 5% + parte de Clean Architecture.

1. Scaffold: `create-next-app` (TS, Tailwind, App Router), `tsconfig` estricto, ESLint +
   `eslint-plugin-boundaries` con las reglas entre capas, scripts de npm.
2. `shared/infrastructure/http`: cliente HTTP único, interceptor que adjunta
   `Authorization: Bearer`, mapeo de 400/401/403/404/409/502 a errores de dominio tipados.
3. Feature `auth` completo: entidad `Session`/`User`, puerto `AuthRepository`, casos de uso
   `LoginUser`, `Logout`, `GetProfile`; repo HTTP contra `POST /auth/login`, `GET /auth/profile`,
   `POST /auth/logout`; `AuthProvider` (Context) + hook fachada `useAuth`; persistencia del token y
   limpieza total al cerrar sesión.
4. Rutas protegidas: grupo `(protected)` con su `layout.tsx`, guard de sesión y guard por rol
   (`admin` / `seller`), `loading.tsx` / `error.tsx` / `not-found.tsx`.
5. Navegación responsive (sidebar escritorio + menú móvil) que **oculta** ítems según rol.
6. Kit de UI tipado y reutilizable en `shared/presentation/components`: `Button`, `Input`, `Select`,
   `Table`, `Modal`, `Badge`, `Pagination`, `Toast`/`Alert` (prohibido `window.alert`).
7. Página `/login` y `/dashboard`.

**Desbloquea a los demás.** Debe mergear base + shared + auth antes que nadie más empiece a
integrar.

### Integrante 2 — Productos y proveedores
Peso: Funcionalidades + UI + Estado.

- Feature `suppliers`: entidad con invariantes (nombre obligatorio), puerto y casos de uso
  `ListSuppliers`, `GetSupplier`, `CreateSupplier`, `UpdateSupplier`, `DeleteSupplier`;
  `GET/POST /suppliers`, `GET/PATCH/DELETE /suppliers/:id`.
  Lista + detalle `[id]` con sus productos (`GET /suppliers/:supplierId/products`), formulario
  validado, y manejo del **409 cuando el proveedor tiene productos** (no se puede borrar).
- Feature `products`: entidad `Product` validando que precio/costo/stock sean **enteros no
  negativos en COP**, `isLowStock()` = `currentStock <= minimumStock`; casos de uso de listar,
  detalle, crear, editar, eliminar y `ListLowStock`.
  `GET /products`, `GET /products/low-stock`, `GET /products/:id`, escritura solo admin.
- UI: tabla con **filtros** (texto, categoría, proveedor, solo activos, solo stock bajo) y
  **paginación numérica en cliente** (el backend no pagina), formularios de crear/editar con
  validación y mensajes de error, badge de stock bajo, acciones de escritura visibles solo a admin.
- Tests unitarios de ambas entidades y de sus casos de uso con repos falsos.

### Integrante 3 — Ventas y pagos *(el feature más difícil: el que lo tome no toma nada más)*
Peso: Funcionalidades + UI + Estado.

- Feature `sales`: entidades `Sale`, `SaleItem` y los estados `pending | paid | declined | cancelled`
  como tipo de dominio; invariante: cantidad ≥ 1, no se arma venta vacía.
- Casos de uso: `CreateSale` (el front envía **solo producto y cantidad**; precios y total los
  calcula el servidor), `GetSale`, `ListTodaySales`, `ListAllSales` (admin), `CancelSale` (admin,
  solo `pending` sin pago en curso), `PaySale`, `CheckPaymentStatus`.
- Endpoints: `POST /sales`, `GET /sales/today`, `GET /sales/:id`, `GET /sales` (admin),
  `POST /sales/:id/payment`, `GET /sales/:id/payment/status`.
- UI "caja": buscador de productos, carrito con cantidades, total **confirmado por el servidor**,
  cobro con NEQUI o tarjeta (el token de tarjeta se obtiene **directo de Wompi**: el backend nunca
  ve el número), pantalla de resultado consultando `payment/status` hasta `approved`/`declined`,
  mensaje claro de "una venta solo admite un intento de pago".
- Historial: ventas del día del vendedor, detalle `[id]`, y vista de admin con todas las ventas +
  cancelar.
- Tests unitarios de las reglas de estado y del cálculo/validación del carrito.

### Integrante 4 — Reportes, usuarios, E2E y entregables
Peso: Reportes/usuarios (Funcionalidades) + Pruebas 15% + Despliegue 10% + README 5%.

- Feature `reports` (solo admin): casos de uso para `/reports/top-products`, `/reports/low-stock`,
  `/reports/sales` y descarga de `/reports/sales/pdf`; filtros por rango de fechas **inclusivos en
  hora de Colombia**; tarjetas de totales (ventas, ingresos, utilidad) y tablas.
- Feature `users` (solo admin): `GET/POST /users`, `GET/PATCH /users/:id`; crear usuario con rol,
  **desactivar** en lugar de borrar (`isActive: false`), cambio de rol desde la UI.
- Playwright: `login` correcto/incorrecto, cierre de sesión, un `seller` que **no** puede entrar a
  `/users` ni `/reports`, y un flujo de negocio completo (crear producto como admin → venderlo como
  seller). Suite repetible dos veces con el mismo resultado; tests independientes o en `serial`.
- CI/CD: workflow de GitHub Actions con lint + build + unit + E2E, y despliegue automático del
  frontend a Vercel.
- `README.md` (instalación, variables de entorno, cómo probar cada funcionalidad, enlaces a
  frontend y backend en producción, herramientas de IA usadas) e **informe de funcionalidades**
  (capas de la arquitectura, auth, autorización y gestión de estado) para subir a intu.

## Tareas que no son de un solo integrante

| Tarea | Dueño | Nota |
|---|---|---|
| `enableCors` en el backend (`src/main.ts`) con el origen de Vercel | Integrante 1 + 4 | **Obligatorio**: hoy el backend no tiene CORS y la app desplegada fallaría en la sustentación |
| `synchronize: true` en `app.module.ts` | Integrante 4 | Revisar antes de producción |
| Paginación | Integrante 2 y 3 | El backend no pagina: se pagina en cliente y se documenta en el informe |

## Orden de ejecución

1. **Integrante 1** sube base + shared + auth y mergea a `main`. Nadie integra antes de esto.
2. Los integrantes 2, 3 y 4 trabajan en paralelo sobre esa base, cada uno en su rama.
3. CORS en el backend + despliegue del frontend a Vercel en cuanto exista la primera pantalla real.
4. E2E y README al final, cuando los features estén en `main`.
5. Antes de entregar: `npm run lint`, `npm run build`, `npm test`, `npx playwright test` **dos veces
   seguidas**, y verificar que la URL de producción responde.

## Variables de entorno

```
NEXT_PUBLIC_API_URL=https://stockpyme-api.onrender.com
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=<llave pública de Wompi sandbox>
```

Ninguna credencial se commitea: `.env.local` queda en `.gitignore` y se documenta en
`.env.example`.
