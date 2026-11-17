import { DomainError } from "./app-error";

/**
 * Prices in the API are whole Colombian pesos: no decimals, never negative.
 * Entities use this to guard their own invariants.
 */
export function assertWholePesos(value: number, field: string): number {
  if (!Number.isInteger(value)) {
    throw new DomainError(`${field} must be a whole number of pesos.`);
  }
  if (value < 0) {
    throw new DomainError(`${field} cannot be negative.`);
  }
  return value;
}

export function assertPositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new DomainError(`${field} must be an integer of 1 or more.`);
  }
  return value;
}
