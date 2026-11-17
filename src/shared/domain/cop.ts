import { DomainError } from "./app-error";

/**
 * Prices in the API are whole Colombian pesos: no decimals, never negative.
 * Entities call these guards in their constructor so they cannot exist in an
 * invalid state.
 *
 * `label` is the name of the field as the user reads it, because the message
 * ends up in the interface: "El precio de venta", "El stock actual".
 */
export function assertWholePesos(value: number, label: string): number {
  if (!Number.isInteger(value)) {
    throw new DomainError(`${label} debe ser un número entero de pesos, sin decimales.`);
  }
  if (value < 0) {
    throw new DomainError(`${label} no puede ser negativo.`);
  }
  return value;
}

/** For stock and quantities: a whole number, and at least one. */
export function assertPositiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new DomainError(`${label} debe ser un número entero mayor o igual a 1.`);
  }
  return value;
}

/** For stock and minimums, where zero is a legitimate value. */
export function assertNonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError(`${label} debe ser un número entero mayor o igual a 0.`);
  }
  return value;
}
