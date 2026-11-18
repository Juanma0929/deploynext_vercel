import type { Sale } from "../domain/sale";
import type { SaleDraft } from "../domain/sale-draft";
import type { SaleRepository } from "../domain/sale.repository";

/**
 * Registers the cart as a pending sale. Only product ids and quantities are
 * sent: the seller is the logged-in user and the server sets the prices.
 */
export class CreateSaleUseCase {
  constructor(private readonly repository: SaleRepository) {}

  execute(draft: SaleDraft): Promise<Sale> {
    // toItems() refuses an empty cart before any request.
    return this.repository.create(draft.toItems());
  }
}
