import { DomainError } from "@/shared/domain/errors";
import { isUuid } from "@/shared/domain/uuid";

import type { Product } from "./product";

/** What the product form holds: every field as typed, "" when empty. */
export interface ProductFormValues {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly barcode: string;
  readonly purchasePrice: string;
  readonly salePrice: string;
  readonly currentStock: string;
  readonly minimumStock: string;
  readonly supplierId: string;
}

export type ProductField = keyof ProductFormValues;

/** The message of each field that breaks a rule. Empty when the product is valid. */
export type ProductIssues = Partial<Record<ProductField, string>>;

/**
 * A product that passed every rule, still as text: the infrastructure mapper
 * turns the amounts into numbers for the API. Optional fields left empty are
 * null, so they are not sent.
 */
export interface ProductDraft {
  readonly name: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly purchasePrice: string;
  readonly salePrice: string;
  readonly currentStock: string;
  readonly minimumStock: string;
  readonly supplierId: string;
}

/** A whole number of 0 or more, written only with digits: "2900", never "2.900" or "29,5". */
const WHOLE_NUMBER = /^\d+$/;

/**
 * The rules of a new product, the same ones the API applies:
 * - the name is not empty;
 * - prices and stocks are whole numbers >= 0;
 * - the supplier is required;
 * - the barcode, if written, is not only spaces (an empty one is not sent).
 */
export function productIssues(values: ProductFormValues): ProductIssues {
  const issues: ProductIssues = {};

  if (values.name.trim() === "") issues.name = "El nombre del producto es obligatorio.";

  const amount = (field: ProductField, label: string) => {
    if (!isWholeNumber(values[field])) {
      issues[field] = `${label} debe ser un número entero mayor o igual a 0, sin puntos ni decimales.`;
    }
  };
  amount("purchasePrice", "El precio de compra");
  amount("salePrice", "El precio de venta");
  amount("currentStock", "El stock actual");
  amount("minimumStock", "El stock mínimo");

  if (values.supplierId.trim() === "") {
    issues.supplierId = "Elige el proveedor del producto.";
  } else if (!isUuid(values.supplierId.trim())) {
    issues.supplierId = "El proveedor elegido no es válido.";
  }

  return issues;
}

export function hasIssues(issues: ProductIssues): boolean {
  return Object.keys(issues).length > 0;
}

/** The product, ready to be created. Throws if it breaks a rule. */
export function toProductDraft(values: ProductFormValues): ProductDraft {
  const issues = productIssues(values);
  if (hasIssues(issues)) throw new InvalidProductError(issues);

  return {
    name: values.name.trim(),
    description: optional(values.description),
    category: optional(values.category),
    barcode: optional(values.barcode),
    purchasePrice: values.purchasePrice.trim(),
    salePrice: values.salePrice.trim(),
    currentStock: values.currentStock.trim(),
    minimumStock: values.minimumStock.trim(),
    supplierId: values.supplierId.trim(),
  };
}

/** The form filled with a saved product, to edit it. */
export function formValuesOf(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? "",
    category: product.category ?? "",
    barcode: product.barcode ?? "",
    purchasePrice: String(product.purchasePrice.amount),
    salePrice: String(product.salePrice.amount),
    currentStock: String(product.currentStock),
    minimumStock: String(product.minimumStock),
    supplierId: product.supplierId,
  };
}

/**
 * What PATCH /products/:id receives: only what changed. An optional field
 * that had a value and was emptied is null, so the API clears it; amounts
 * stay as text until the infrastructure mapper turns them into numbers.
 */
export interface ProductChanges {
  readonly name?: string;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly barcode?: string | null;
  readonly purchasePrice?: string;
  readonly salePrice?: string;
  readonly currentStock?: string;
  readonly minimumStock?: string;
  readonly supplierId?: string;
  readonly isActive?: boolean;
}

/**
 * The fields of the form that differ from the saved product. It applies the
 * same rules as a new product first: an edit cannot leave a product invalid.
 */
export function changesBetween(current: Product, values: ProductFormValues): ProductChanges {
  const next = toProductDraft(values);
  const saved = formValuesOf(current);
  const changes: { -readonly [K in keyof ProductChanges]: ProductChanges[K] } = {};

  if (next.name !== current.name) changes.name = next.name;
  if (next.description !== current.description) changes.description = next.description;
  if (next.category !== current.category) changes.category = next.category;
  if (next.barcode !== current.barcode) changes.barcode = next.barcode;
  // Compared as numbers, so "0050" against a saved 50 is not a change.
  for (const field of ["purchasePrice", "salePrice", "currentStock", "minimumStock"] as const) {
    if (Number(next[field]) !== Number(saved[field])) changes[field] = next[field];
  }
  if (next.supplierId !== current.supplierId) changes.supplierId = next.supplierId;

  return changes;
}

export function hasProductChanges(changes: ProductChanges): boolean {
  return Object.keys(changes).length > 0;
}

/**
 * The quick adjustment of the stock: only currentStock, with the same rule as
 * the form. Returns no changes if the number is the same one.
 */
export function stockAdjustment(current: Product, newStock: string): ProductChanges {
  const values = { ...formValuesOf(current), currentStock: newStock };
  const issue = productIssues(values).currentStock;
  if (issue !== undefined) throw new InvalidProductError({ currentStock: issue });

  const stock = values.currentStock.trim();
  return Number(stock) === current.currentStock ? {} : { currentStock: stock };
}

/**
 * Whether the product would be sold for less than it costs. It is only a
 * warning: the API allows it, for example for a clearance sale.
 */
export function sellsBelowCost(values: Pick<ProductFormValues, "purchasePrice" | "salePrice">): boolean {
  if (!isWholeNumber(values.purchasePrice) || !isWholeNumber(values.salePrice)) return false;
  return Number(values.salePrice.trim()) < Number(values.purchasePrice.trim());
}

/** A product that breaks at least one rule, with the message of each field. */
export class InvalidProductError extends DomainError {
  constructor(readonly issues: ProductIssues) {
    super("Revisa los datos del producto.");
    this.name = "InvalidProductError";
  }
}

function isWholeNumber(text: string): boolean {
  const value = text.trim();
  return WHOLE_NUMBER.test(value) && Number.isSafeInteger(Number(value));
}

function optional(text: string): string | null {
  const value = text.trim();
  return value === "" ? null : value;
}
