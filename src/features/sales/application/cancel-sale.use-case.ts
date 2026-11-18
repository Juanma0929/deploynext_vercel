import { SaleNotCancellableError } from "../domain/errors";
import type { Sale } from "../domain/sale";
import type { SaleRepository } from "../domain/sale.repository";

/**
 * Cancels a pending sale without a payment and gives the stock back. Admin
 * only (the route hides it from sellers and the API refuses them).
 */
export class CancelSaleUseCase {
  constructor(private readonly repository: SaleRepository) {}

  execute(sale: { readonly id: string; readonly isAwaitingPayment: boolean }): Promise<Sale> {
    if (!sale.isAwaitingPayment) return Promise.reject(new SaleNotCancellableError());
    return this.repository.cancel(sale.id);
  }
}
