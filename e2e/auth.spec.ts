import { expect, test } from "@playwright/test";

import { admin, logIn } from "./support/accounts";

test.describe("Autenticación", () => {
  test("manda al login a quien no tiene sesión", async ({ page }) => {
    await page.goto("/dashboard");

    // The middleware answers before the page is rendered, so the protected
    // route is never sent to the browser.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("rechaza un correo con formato inválido sin llamar a la API", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill("no-es-un-correo");
    await page.getByLabel("Contraseña").fill("cualquier-cosa");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // The message comes from the Credentials entity, not from the server.
    // Scoped to the form, because Next.js renders a route announcer that also
    // carries role="alert".
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "El correo no tiene un formato válido.",
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("rechaza credenciales incorrectas con un mensaje que se entiende", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill(admin().email);
    await page.getByLabel("Contraseña").fill("contrasena-incorrecta");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // A 401 while logging in is not an expired session: there was none.
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "Correo o contraseña incorrectos.",
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("entra con credenciales válidas y muestra el nombre y el rol", async ({ page }) => {
    await logIn(page, admin());

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hola,");
    // The role is shown in the header, next to the name, and comes from
    // GET /auth/profile rather than from the token.
    await expect(page.getByRole("banner")).toContainText("Administrador");
  });

  test("cierra la sesión y deja de dar acceso a las rutas protegidas", async ({ page }) => {
    await logIn(page, admin());

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // The cookie is gone, not only the screen: going back in is not possible.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
