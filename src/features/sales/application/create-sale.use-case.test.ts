import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/errors";

import { SaleRejectedError } from "../domain/errors";
import { Sale } from "../domain/sale";
import { SaleDraft, type SaleItem } from "../domain/sale-draft";
import { SaleProduct } from "../domain/sale-product";
import type { SaleRepository } from "../domain/sale.repository";
import { CreateSaleUseCase } from "./create-sale.use-case";

/**
 * A fake of the API: it records what it receives and answers as POST /sales
 * would, with the prices it decides (the "server" sells milk at 4.100, not at
 * the 4.000 the cart estimated).
 */
class FakeSaleRepository implements SaleRepository {
  readonly created: (readonly SaleItem[])[] = [];
  rejectWith: Error | null = null;

  constructor(private readonly prices: ReadonlyMap<string, number>) {}

  async create(items: readonly SaleItem[]): Promise<Sale> {
    this.created.push(items);
    if (this.rejectWith !== null) throw this.rejectWith;

    const lines = items.map((item) => {
      const unitPrice = this.prices.get(item.productId) ?? 0;
      return { productId: item.productId, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity };
    });
    return new Sale({
      id: "9f1c2b3a-0000-4000-8000-000000000001",
      createdAt: new Date("2026-11-17T15:00:00Z"),
      sellerId: "seller-1",
      total: lines.reduce((total, line) => total + line.subtotal, 0),
      status: "pending",
      lines,
    });
  }

  findToday(): Promise<Sale[]> {
    throw new Error("Not used by this use case.");
  }
  findAll(): Promise<Sale[]> {
    throw new Error("Not used by this use case.");
  }
  findById(): Promise<Sale> {
    throw new Error("Not used by this use case.");
  }
  cancel(): Promise<Sale> {
    throw new Error("Not used by this use case.");
  }
}

const leche = new SaleProduct({
  id: "leche",
  name: "Leche",
  category: null,
  barcode: null,
  salePrice: 4_000,
  currentStock: 10,
  isActive: true,
});
const pan = new SaleProduct({ ...leche, id: "pan", name: "Pan", salePrice: 500, isActive: true, currentStock: 30 });

function setup() {
  const repository = new FakeSaleRepository(
    new Map([
      ["leche", 4_100],
      ["pan", 500],
    ]),
  );
  return { repository, createSale: new CreateSaleUseCase(repository) };
}

describe("CreateSaleUseCase", () => {
  it("sends only the product ids and quantities of the cart", async () => {
    const { repository, createSale } = setup();

    await createSale.execute(SaleDraft.empty().add(leche, 2).add(pan, 3));

    expect(repository.created).toEqual([
      [
        { productId: "leche", quantity: 2 },
        { productId: "pan", quantity: 3 },
      ],
    ]);
  });

  it("returns the pending sale with the prices set by the server, not the estimate", async () => {
    const { createSale } = setup();
    const draft = SaleDraft.empty().add(leche, 2).add(pan, 3);

    const sale = await createSale.execute(draft);

    expect(sale.status).toBe("pending");
    expect(sale.isAwaitingPayment).toBe(true);
    expect(sale.total.amount).toBe(2 * 4_100 + 3 * 500);
    expect(draft.estimatedTotal.amount).toBe(2 * 4_000 + 3 * 500);
  });

  it("refuses an empty cart without asking the API", async () => {
    const { repository, createSale } = setup();

    await expect(createSale.execute(SaleDraft.empty())).rejects.toThrow(DomainError);
    expect(repository.created).toHaveLength(0);
  });

  it("passes on the rejection of the API (stock changed under us)", async () => {
    const { repository, createSale } = setup();
    repository.rejectWith = new SaleRejectedError("No hay suficiente stock de Leche (disponibles: 1).");

    await expect(createSale.execute(SaleDraft.empty().add(leche, 2))).rejects.toBeInstanceOf(SaleRejectedError);
  });
});
