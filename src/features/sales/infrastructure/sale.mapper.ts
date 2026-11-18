import { ApiRequestError } from "@/shared/infrastructure/http";

import { SaleRejectedError } from "../domain/errors";
import { Sale } from "../domain/sale";
import type { SaleItem } from "../domain/sale-draft";
import { SaleProduct } from "../domain/sale-product";
import type { SaleDto } from "./dto/sale.dto";
import type { CreateSaleDto, SaleProductDto } from "./dto/sale-product.dto";

export function toSale(dto: SaleDto): Sale {
  return new Sale({
    id: dto.id,
    createdAt: new Date(dto.createdAt),
    sellerId: dto.sellerId,
    total: dto.total,
    status: dto.status,
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
