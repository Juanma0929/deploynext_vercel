import { describe, expect, it } from "vitest";

import { DomainError } from "./app-error";
import { assertPositiveInteger, assertWholePesos } from "./cop";

describe("assertWholePesos", () => {
  it("accepts whole pesos", () => {
    expect(assertWholePesos(15000, "price")).toBe(15000);
    expect(assertWholePesos(0, "price")).toBe(0);
  });

  it("rejects decimals, because the API stores integers", () => {
    expect(() => assertWholePesos(1500.5, "price")).toThrow(DomainError);
  });

  it("rejects negative amounts", () => {
    expect(() => assertWholePesos(-1, "price")).toThrow("price cannot be negative.");
  });
});

describe("assertPositiveInteger", () => {
  it("accepts one or more", () => {
    expect(assertPositiveInteger(1, "quantity")).toBe(1);
  });

  it("rejects zero and decimals", () => {
    expect(() => assertPositiveInteger(0, "quantity")).toThrow(DomainError);
    expect(() => assertPositiveInteger(1.5, "quantity")).toThrow(DomainError);
  });
});
