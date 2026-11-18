import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/errors";

import { SaleDraft } from "./sale-draft";
import { SaleProduct, type SaleProductProps } from "./sale-product";

function saleProduct(changes: Partial<SaleProductProps> = {}): SaleProduct {
  return new SaleProduct({
    id: "leche",
    name: "Leche",
    category: null,
    barcode: null,
    salePrice: 4_000,
    currentStock: 5,
    isActive: true,
    ...changes,
  });
}

const leche = saleProduct();
const pan = saleProduct({ id: "pan", name: "Pan", salePrice: 500, currentStock: 10 });

/** The cart of a sale being put together. */
describe("SaleDraft (cart)", () => {
  it("starts empty, and an empty cart cannot be sent", () => {
    const cart = SaleDraft.empty();
    expect(cart.isEmpty).toBe(true);
    expect(cart.estimatedTotal.isZero()).toBe(true);
    expect(() => cart.toItems()).toThrow("Agrega al menos un producto a la venta.");
  });

  it("adds products and estimates the total with their prices", () => {
    const cart = SaleDraft.empty().add(leche, 2).add(pan, 3);
    expect(cart.lines).toHaveLength(2);
    expect(cart.unitCount).toBe(5);
    expect(cart.estimatedTotal.amount).toBe(2 * 4_000 + 3 * 500);
  });

  it("adding a product already in the cart adds to its quantity, never a second line", () => {
    const cart = SaleDraft.empty().add(leche).add(leche, 2);
    expect(cart.lines).toHaveLength(1);
    expect(cart.quantityOf("leche")).toBe(3);
  });

  it("is immutable: every change returns a new cart", () => {
    const empty = SaleDraft.empty();
    const withMilk = empty.add(leche);
    expect(empty.isEmpty).toBe(true);
    expect(withMilk.quantityOf("leche")).toBe(1);
  });

  it("refuses more units than the stock", () => {
    expect(() => SaleDraft.empty().add(leche, 6)).toThrow("Solo hay 5 unidades de Leche.");
    expect(() => SaleDraft.empty().add(leche, 5).add(leche)).toThrow(DomainError);
  });

  it("refuses a quantity below 1 or with decimals", () => {
    const cart = SaleDraft.empty().add(leche);
    expect(() => cart.setQuantity("leche", 0)).toThrow("mayor o igual a 1");
    expect(() => cart.setQuantity("leche", 1.5)).toThrow(DomainError);
  });

  it("refuses products that cannot be sold: inactive or without stock", () => {
    expect(() => SaleDraft.empty().add(saleProduct({ isActive: false }))).toThrow("no está disponible");
    expect(() => SaleDraft.empty().add(saleProduct({ currentStock: 0 }))).toThrow(DomainError);
  });

  it("changes the quantity of a line, and refuses a product that is not in it", () => {
    const cart = SaleDraft.empty().add(leche).setQuantity("leche", 4);
    expect(cart.quantityOf("leche")).toBe(4);
    expect(() => cart.setQuantity("pan", 1)).toThrow("Ese producto no está en la venta.");
  });

  it("removes a line; removing one that is not there changes nothing", () => {
    const cart = SaleDraft.empty().add(leche).add(pan);
    expect(cart.remove("leche").lines.map((line) => line.product.id)).toEqual(["pan"]);
    expect(cart.remove("arroz")).toBe(cart);
  });

  it("says how many more units fit", () => {
    expect(SaleDraft.empty().add(leche, 2).remainingFor(leche)).toBe(3);
  });

  it("sends only ids and quantities: the server sets the prices", () => {
    expect(SaleDraft.empty().add(leche, 2).add(pan).toItems()).toEqual([
      { productId: "leche", quantity: 2 },
      { productId: "pan", quantity: 1 },
    ]);
  });

  it("reconciles with fresh products: drops the ones gone, lowers to the new stock", () => {
    const cart = SaleDraft.empty().add(leche, 4).add(pan, 2);
    const { draft, adjustments } = cart.reconcile([saleProduct({ currentStock: 3 })]);

    expect(draft.quantityOf("leche")).toBe(3);
    expect(draft.quantityOf("pan")).toBe(0);
    expect(adjustments).toEqual([
      { productName: "Leche", kind: "reduced", quantity: 3 },
      { productName: "Pan", kind: "removed" },
    ]);
  });

  it("refills from an earlier sale with the same rules", () => {
    const { draft, adjustments } = SaleDraft.fromItems(
      [
        { productId: "leche", quantity: 9 },
        { productId: "borrado", quantity: 1 },
      ],
      [leche],
      new Map([["borrado", "Arroz"]]),
    );

    expect(draft.quantityOf("leche")).toBe(5);
    expect(adjustments).toEqual([
      { productName: "Leche", kind: "reduced", quantity: 5 },
      { productName: "Arroz", kind: "removed" },
    ]);
  });
});
