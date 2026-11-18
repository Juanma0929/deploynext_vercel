import { expect, test } from "@playwright/test";

import { credentialsOf, emailOf, fillLogin, loginAs, logout } from "./support/session";

test.describe("Autenticación", () => {
  test("login correcto: entra al inicio con su nombre y rol", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  });

  test("login fallido: se queda en /login con el mensaje de error", async ({ page }) => {
    const email = emailOf("admin");

    await page.goto("/login");
    await fillLogin(page, { email, password: `incorrecta-${Date.now()}` });

    // Next.js has its own role="alert" (the route announcer): look for the one of the form.
    await expect(page.getByRole("alert").filter({ hasText: "Correo o contraseña incorrectos." })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout: cierra la sesión y las rutas privadas vuelven a pedir login", async ({ page }) => {
    await loginAs(page, "seller");
    await logout(page);

    await page.goto("/ventas");
    await expect(page).toHaveURL(/\/login\?next=%2Fventas/);
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("una ruta protegida sin token redirige a /login y recuerda a dónde iba", async ({ page, context }) => {
    await context.clearCookies();

    await page.goto("/productos");

    await expect(page).toHaveURL(/\/login\?next=%2Fproductos$/);
    await expect(page.getByLabel("Correo")).toBeVisible();
  });

  test("después del login vuelve a la ruta que pidió", async ({ page }) => {
    await page.goto("/proveedores");
    await expect(page).toHaveURL(/\/login\?next=/);

    await fillLogin(page, credentialsOf("seller"));

    await expect(page).toHaveURL(/\/proveedores$/);
  });
});
