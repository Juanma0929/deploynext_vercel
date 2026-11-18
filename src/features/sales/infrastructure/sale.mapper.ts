import { parseUtcTimestamp } from "@/shared/domain/calendar";
import { ApiRequestError } from "@/shared/infrastructure/http";

import {
  SaleNotCancellableError,
  SaleNotFoundError,
  SaleNotYoursError,
  SaleRejectedError,
} from "../domain/errors";
import { Sale } from "../domain/sale";
import type { SaleItem } from "../domain/sale-draft";
import { SaleProduct } from "../domain/sale-product";
import type { SaleDto } from "./dto/sale.dto";
import type { CreateSaleDto, SaleProductDto } from "./dto/sale-product.dto";

export function toSale(dto: SaleDto): Sale {
  return new Sale({
    id: dto.id,
    createdAt: parseUtcTimestamp(dto.createdAt),
    sellerId: dto.sellerId,
    total: dto.total,
    status: dto.status,
    paymentTransactionId: dto.paymentTransactionId ?? null,
    paymentMethod: dto.paymentMethod ?? null,
    lines: dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  });
}

export function toSaleProduct(dto: SaleProductDto): SaleProduct {
  return new SaleProduct({
    id: dto.id,
    name: dto.name,
    category: dto.category ?? null,
    barcode: dto.barcode ?? null,
    salePrice: dto.salePrice,
    currentStock: dto.currentStock,
    isActive: dto.isActive,
  });
}

export function toCreateSaleDto(items: readonly SaleItem[]): CreateSaleDto {
  return { items: items.map(({ productId, quantity }) => ({ productId, quantity })) };
}

/** The messages of the 409 of POST /sales, in Spanish. Unknown ones go through as the API wrote them. */
const CONFLICT_MESSAGES: readonly { pattern: RegExp; spanish: (match: RegExpMatchArray) => string }[] = [
  {
    pattern: /^Not enough stock for product (.+) \(available: (\d+)\)$/,
    spanish: ([, name, available]) => `No hay suficiente stock de ${name} (disponibles: ${available}).`,
  },
  {
    pattern: /^Product (.+) is inactive$/,
    spanish: ([, name]) => `El producto ${name} está inactivo y no se puede vender.`,
  },
];

function toSpanish(message: string): string {
  for (const { pattern, spanish } of CONFLICT_MESSAGES) {
    const match = message.match(pattern);
    if (match !== null) return spanish(match);
  }
  return message;
}

/**
 * A 409 (inactive product or not enough stock) or a 404 (a product no longer
 * exists) becomes SaleRejectedError, carrying the message of the backend.
 */
export function toCreateSaleError(error: unknown): unknown {
  if (!(error instanceof ApiRequestError)) return error;

  if (error.status === 409) {
    const message = error.messages.map(toSpanish).join(" ");
    return new SaleRejectedError(message || "Uno de los productos no tiene stock suficiente.");
  }
  if (error.status === 404) {
    return new SaleRejectedError("Uno de los productos de la venta ya no existe.");
  }
  return error;
}

/** GET /sales/:id: 404, or 400 for an id that is not a UUID, and 403 for another seller's sale. */
export function toSaleLookupError(error: unknown): unknown {
  if (!(error instanceof ApiRequestError)) return error;
  if (error.status === 404 || error.status === 400) return new SaleNotFoundError();
  if (error.status === 403) return new SaleNotYoursError();
  return error;
}

/** The two 409 of POST /sales/:id/cancel, in Spanish. Unknown ones go through as the API wrote them. */
const CANCEL_CONFLICT_MESSAGES: Readonly<Record<string, string>> = {
  "A sale with a payment in progress cannot be cancelled":
    "Esta venta ya tiene un pago iniciado, así que no se puede cancelar.",
  "Only pending sales without a payment in progress can be cancelled":
    "Esta venta ya no está pendiente (se cobró, se rechazó o ya se canceló), así que no se puede cancelar.",
};

/** POST /sales/:id/cancel: 409 when it is not pending or has a payment in progress. */
export function toCancelSaleError(error: unknown): unknown {
  if (!(error instanceof ApiRequestError)) return error;
  if (error.status === 409) {
    const message = error.messages.map((text) => CANCEL_CONFLICT_MESSAGES[text] ?? text).join(" ");
    return message === "" ? new SaleNotCancellableError() : new SaleNotCancellableError(message);
  }
  if (error.status === 404) return new SaleNotFoundError();
  return error;
}
