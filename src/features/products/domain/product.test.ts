import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/errors";

import { Product, type ProductProps } from "./product";

const props: ProductProps = {
  id: "p-1",
  name: "Leche entera",
  description: null,
  category: "Lácteos",
  barcode: "7701234567890",
  purchasePrice: 3_000,
  salePrice: 4_200,
  currentStock: 20,
  minimumStock: 5,
  supplierId: "s-1",
  isActive: true,
};

const product = (changes: Partial<ProductProps> = {}) => new Product({ ...props, ...changes });

describe("Product", () => {
  it("keeps its data, with the prices as Money", () => {
    const leche = product();
    expect(leche.name).toBe("Leche entera");
    expect(leche.salePrice.amount).toBe(4_200);
    expect(leche.purchasePrice.amount).toBe(3_000);
  });

  it("trims the name and refuses an empty one", () => {
    expect(product({ name: "  Pan  " }).name).toBe("Pan");
    expect(() => product({ name: "   " })).toThrow("El nombre del producto es obligatorio.");
  });

  it("keeps empty optional fields as null", () => {
    const bare = product({ description: "  ", category: "", barcode: null });
    expect(bare.description).toBeNull();
    expect(bare.category).toBeNull();
    expect(bare.barcode).toBeNull();
  });

  it("refuses negative prices and prices with decimals", () => {
    expect(() => product({ salePrice: -1 })).toThrow("no pueden ser negativos");
    expect(() => product({ purchasePrice: -100 })).toThrow(DomainError);
    expect(() => product({ salePrice: 99.9 })).toThrow(DomainError);
  });

  it("refuses a stock that is negative or not whole", () => {
    expect(() => product({ currentStock: -1 })).toThrow("El stock de un producto");
    expect(() => product({ minimumStock: 2.5 })).toThrow(DomainError);
  });

  it("is in low stock at or below its minimum, as the API counts it", () => {
    expect(product({ currentStock: 6, minimumStock: 5 }).isLowStock).toBe(false);
    expect(product({ currentStock: 5, minimumStock: 5 }).isLowStock).toBe(true);
    expect(product({ currentStock: 0, minimumStock: 5 }).isLowStock).toBe(true);
  });

  it("needs restocking only when it is active and in low stock", () => {
    expect(product({ currentStock: 2 }).needsRestock).toBe(true);
    expect(product({ currentStock: 2, isActive: false }).needsRestock).toBe(false);
    expect(product({ currentStock: 50 }).needsRestock).toBe(false);
  });

  it("has a margin of salePrice − purchasePrice, which can be negative", () => {
    expect(product().margin.amount).toBe(1_200);
    expect(product({ salePrice: 2_500 }).margin.amount).toBe(-500);
  });

  it("goes to plain props and back unchanged", () => {
    const leche = product();
    expect(new Product(leche.toProps()).toProps()).toEqual(leche.toProps());
  });
});
