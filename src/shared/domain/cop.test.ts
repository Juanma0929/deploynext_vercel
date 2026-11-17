import { describe, expect, it } from "vitest";

import { DomainError } from "./app-error";
import { assertNonNegativeInteger, assertPositiveInteger, assertWholePesos } from "./cop";

describe("assertWholePesos", () => {
  it("accepts whole pesos, zero included", () => {
    expect(assertWholePesos(15000, "El precio")).toBe(15000);
    expect(assertWholePesos(0, "El precio")).toBe(0);
  });

  it("rejects decimals, because the API stores integers", () => {
    expect(() => assertWholePesos(1500.5, "El precio")).toThrow(DomainError);
  });

  it("names the field in the message, so the form can show it", () => {
    expect(() => assertWholePesos(-1, "El precio de venta")).toThrow(
      "El precio de venta no puede ser negativo.",
    );
  });
});

describe("assertPositiveInteger", () => {
  it("accepts one or more", () => {
    expect(assertPositiveInteger(1, "La cantidad")).toBe(1);
  });

  it("rejects zero, an empty line in a sale is not a sale", () => {
    expect(() => assertPositiveInteger(0, "La cantidad")).toThrow(DomainError);
  });

  it("rejects decimals", () => {
    expect(() => assertPositiveInteger(1.5, "La cantidad")).toThrow(DomainError);
  });
});

describe("assertNonNegativeInteger", () => {
  it("accepts zero, a product can be out of stock", () => {
    expect(assertNonNegativeInteger(0, "El stock actual")).toBe(0);
  });

  it("rejects a negative stock", () => {
    expect(() => assertNonNegativeInteger(-2, "El stock actual")).toThrow(DomainError);
  });
});
