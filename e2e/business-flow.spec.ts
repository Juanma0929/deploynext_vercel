import { expect, test } from "@playwright/test";

import { loginAs } from "./support/session";

/**
 * The whole life of a product, chained: the admin creates it, the seller sells
 * it and charges it with Nequi, and the admin deactivates it (once sold it can
 * no longer be deleted).
 *
 * Repeatable on purpose: every run creates its own product with a unique
 * barcode, so the suite never depends on (nor runs out of) the stock of the
 * seed. Serial: each step needs what the previous one left, and if one fails
 * the rest are skipped instead of failing for the wrong reason.
 */
test.describe.serial("Negocio: crear, vender, cobrar con Nequi y desactivar", () => {
  const stamp = Date.now();
  const product = {
    name: `E2E Producto ${stamp}`,
    barcode: `E2E${stamp}`,
    purchasePrice: "1000",
    salePrice: "1500",
    stock: "5",
    minimumStock: "1",
  };

  /** Wompi sandbox: this Nequi number always approves. */
  const NEQUI_APPROVED = "3991111111";

  let productPath = "";
  let salePath = "";

  test("el admin crea un producto con un código de barras único", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/productos/nuevo");

    await page.getByRole("textbox", { name: "Nombre", exact: true }).fill(product.name);
    await page.getByLabel("Código de barras").fill(product.barcode);
    // The first real supplier of the seed; the option 0 is "Elige un proveedor".
    await page.getByLabel("Proveedor").selectOption({ index: 1 });
    await page.getByLabel("Precio de compra").fill(product.purchasePrice);
    await page.getByLabel("Precio de venta").fill(product.salePrice);
    await page.getByRole("textbox", { name: "Stock actual", exact: true }).fill(product.stock);
    await page.getByLabel("Stock mínimo").fill(product.minimumStock);
    await page.getByRole("button", { name: "Crear producto" }).click();

    await expect(page).toHaveURL(/\/productos\/[0-9a-f-]{36}$/);
    await expect(page.getByText("Producto creado.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: product.name })).toBeVisible();
    await expect(page.getByText(product.barcode)).toBeVisible();
    productPath = new URL(page.url()).pathname;
  });

  test("el seller lo vende", async ({ page }) => {
    await loginAs(page, "seller");
    await page.goto("/ventas/nueva");

    await page.getByLabel("Buscar producto").fill(product.barcode);
    await page.getByRole("button", { name: `Agregar ${product.name}`, exact: true }).click();
    await expect(page.getByText("1 en la venta")).toBeVisible();
    await page.getByRole("button", { name: "Registrar venta" }).click();

    await expect(page).toHaveURL(/\/ventas\/[0-9a-f-]{36}$/);
    await expect(page.getByText("Venta registrada. El stock ya se descontó.")).toBeVisible();
    await expect(page.getByText("Pendiente", { exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: product.name })).toBeVisible();
    salePath = new URL(page.url()).pathname;
  });

  test("se cobra con Nequi 3991111111 y la venta pasa a paid", async ({ page }) => {
    await loginAs(page, "seller");
    await page.goto(salePath);
    await page.getByRole("link", { name: "Cobrar", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${salePath}/cobrar$`));

    // Nequi is the method selected by default.
    await expect(page.getByRole("radio", { name: "Nequi" })).toBeChecked();
    await page.getByLabel("Correo del cliente").fill(`cliente.e2e.${stamp}@example.com`);
    await page.getByLabel("Número de Nequi").fill(NEQUI_APPROVED);
    await page.getByRole("button", { name: /^Cobrar .+ con Nequi$/ }).click();

    await expect(page.getByText("Cobro enviado a Nequi")).toBeVisible();
    // The polling asks Wompi every 2.5 s for up to a minute.
    await expect(page.getByText("Pago aprobado.")).toBeVisible({ timeout: 75_000 });

    // The detail is rendered on the server from the API: the sale really is paid there.
    await page.getByRole("link", { name: "Ver la venta" }).click();
    await expect(page).toHaveURL(new RegExp(`${salePath}$`));
    await expect(page.getByText("Pagada", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cobrar", exact: true })).toHaveCount(0);
  });

  test("el admin no puede borrarlo porque ya se vendió, y lo desactiva", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto(productPath);

    await page.getByRole("button", { name: "Eliminar", exact: true }).click();
    await page.getByRole("button", { name: "Eliminar producto" }).click();

    const dialog = page.getByRole("dialog", { name: "No se puede eliminar" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Desactivar en su lugar" }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText("El producto está inactivo: sigue en el inventario, pero no se puede vender.")).toBeVisible();
    await expect(page.getByRole("switch", { name: "Activar" })).not.toBeChecked();
  });

  test("ya desactivado, el seller no lo encuentra para vender", async ({ page }) => {
    await loginAs(page, "seller");
    await page.goto("/ventas/nueva");

    await page.getByLabel("Buscar producto").fill(product.barcode);

    await expect(page.getByText("Ningún producto coincide con la búsqueda.")).toBeVisible();
    await expect(page.getByRole("button", { name: `Agregar ${product.name}`, exact: true })).toHaveCount(0);
  });
});
