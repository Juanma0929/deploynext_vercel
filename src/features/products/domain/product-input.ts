import { DomainError } from "@/shared/domain/errors";
import { isUuid } from "@/shared/domain/uuid";

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
