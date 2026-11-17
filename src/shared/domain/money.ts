import { DomainError } from "./errors";

const COP_FORMAT = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * An amount of Colombian pesos. COP has no cents in practice, so the amount is
 * always a whole number: a Money with decimals cannot be built.
 *
 * It may be negative, because a difference such as an estimated profit can be.
 * Entities that need a non-negative price check it with isNegative().
 */
export class Money {
  private constructor(readonly amount: number) {}

  static cop(amount: number): Money {
    if (!Number.isSafeInteger(amount)) {
      throw new DomainError("El valor en pesos debe ser un número entero.");
    }
    return new Money(amount);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return Money.cop(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return Money.cop(this.amount - other.amount);
  }

  /** For a quantity of units, such as the subtotal of a sale line. */
  times(quantity: number): Money {
    if (!Number.isSafeInteger(quantity)) {
      throw new DomainError("La cantidad debe ser un número entero.");
    }
    return Money.cop(this.amount * quantity);
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  /** "$ 12.500" */
  format(): string {
    return COP_FORMAT.format(this.amount);
  }

  static sum(values: readonly Money[]): Money {
    return values.reduce((total, value) => total.add(value), Money.zero());
  }
}
