import { expect, test } from "@playwright/test";

import { loginAs, mainNav } from "./support/session";

const ADMIN_SECTIONS = [
  { label: "Reportes", path: "/reportes" },
  { label: "Usuarios", path: "/usuarios" },
] as const;

test.describe("Autorización: seller", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "seller");
  });

  test("no ve Reportes ni Usuarios en el menú", async ({ page }) => {
    const nav = mainNav(page);
    await expect(nav.getByRole("link", { name: "Nueva venta" })).toBeVisible();
    for (const { label } of ADMIN_SECTIONS) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveCount(0);
    }
  });

  for (const { label, path } of ADMIN_SECTIONS) {
    test(`si abre ${label} por URL ve acceso denegado`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
      await expect(page.getByText("Tu rol no tiene permiso para ver esta sección.")).toBeVisible();
      // The URL stays: the page is denied, not redirected.
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    });
  }
});

test.describe("Autorización: admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  for (const { label, path } of ADMIN_SECTIONS) {
    test(`ve ${label} en el menú y lo abre`, async ({ page }) => {
      await mainNav(page).getByRole("link", { name: label, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1, name: label, exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Acceso denegado" })).toHaveCount(0);
    });
  }
});
