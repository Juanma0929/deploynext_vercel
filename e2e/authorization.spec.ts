import { expect, test } from "@playwright/test";

import { admin, logIn, seller } from "./support/accounts";

const ADMIN_SECTIONS = ["Reportes", "Usuarios"];
const SHARED_SECTIONS = ["Inicio", "Productos", "Proveedores", "Ventas"];

test.describe("Autorización por rol", () => {
  test("el administrador ve las secciones de administración", async ({ page }) => {
    await logIn(page, admin());

    const nav = page.getByRole("navigation", { name: "Secciones" });
    for (const section of [...SHARED_SECTIONS, ...ADMIN_SECTIONS]) {
      await expect(nav.getByRole("link", { name: section })).toBeVisible();
    }
  });

  test("el administrador entra a usuarios y ve la lista", async ({ page }) => {
    await logIn(page, admin());
    await page.getByRole("link", { name: "Usuarios" }).click();

    await expect(page.getByRole("heading", { name: "Usuarios" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("el administrador no puede desactivar su propia cuenta", async ({ page }) => {
    await logIn(page, admin());
    await page.goto("/users");

    // The rule lives in the use case; the screen shows it before enforcing it.
    const ownRow = page.getByRole("row").filter({ hasText: admin().email });
    await expect(ownRow.getByRole("button", { name: "Desactivar" })).toBeDisabled();

    // Another user keeps the action available.
    const otherRow = page.getByRole("row").filter({ hasText: seller().email });
    await expect(otherRow.getByRole("button", { name: "Desactivar" })).toBeEnabled();
  });

  test("el vendedor no ve las secciones de administración", async ({ page }) => {
    await logIn(page, seller());

    const nav = page.getByRole("navigation", { name: "Secciones" });
    for (const section of SHARED_SECTIONS) {
      await expect(nav.getByRole("link", { name: section })).toBeVisible();
    }
    for (const section of ADMIN_SECTIONS) {
      await expect(nav.getByRole("link", { name: section })).toHaveCount(0);
    }
  });

  test("el vendedor que escribe /users a mano recibe no encontrado", async ({ page }) => {
    await logIn(page, seller());
    await page.goto("/users");

    // The guard runs on the server, so the interface is never sent.
    await expect(page.getByText("No encontramos lo que buscabas")).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});
