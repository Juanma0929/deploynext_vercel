import { Sale } from "../domain/sale";
import type { SaleDto } from "./dto/sale.dto";

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
