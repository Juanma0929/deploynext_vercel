import { describe, expect, it } from "vitest";

import { DomainError } from "./errors";
import { Money } from "./money";

describe("Money", () => {
  it("is built from a whole number of pesos", () => {
    expect(Money.cop(12_500).amount).toBe(12_500);
    expect(Money.zero().isZero()).toBe(true);
  });

  it("refuses decimals and values that are not safe integers", () => {
    expect(() => Money.cop(10.5)).toThrow(DomainError);
    expect(() => Money.cop(Number.NaN)).toThrow(DomainError);
    expect(() => Money.cop(Number.MAX_SAFE_INTEGER + 1)).toThrow(DomainError);
  });

  it("adds, subtracts and multiplies by a whole quantity", () => {
    const price = Money.cop(2_000);
    expect(price.add(Money.cop(500)).amount).toBe(2_500);
    expect(price.subtract(Money.cop(500)).amount).toBe(1_500);
    expect(price.times(3).amount).toBe(6_000);
  });

  it("refuses a quantity with decimals", () => {
    expect(() => Money.cop(2_000).times(1.5)).toThrow("La cantidad debe ser un número entero.");
  });

  it("can be negative, as a difference such as a loss", () => {
    const loss = Money.cop(1_000).subtract(Money.cop(1_500));
    expect(loss.amount).toBe(-500);
    expect(loss.isNegative()).toBe(true);
  });

  it("is immutable: operations return a new value", () => {
    const price = Money.cop(1_000);
    price.add(Money.cop(1));
    expect(price.amount).toBe(1_000);
  });

  it("compares by amount", () => {
    expect(Money.cop(100).equals(Money.cop(100))).toBe(true);
    expect(Money.cop(200).isGreaterThan(Money.cop(100))).toBe(true);
    expect(Money.cop(100).isLessThan(Money.cop(200))).toBe(true);
  });

  it("sums a list, and an empty list is zero", () => {
    expect(Money.sum([Money.cop(1), Money.cop(2), Money.cop(3)]).amount).toBe(6);
    expect(Money.sum([]).isZero()).toBe(true);
  });

  it("formats as Colombian pesos without decimals", () => {
    expect(Money.cop(12_500).format()).toMatch(/^\$\s?12\.500$/u);
  });
});
