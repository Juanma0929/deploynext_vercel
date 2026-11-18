import { isUuid } from "@/shared/domain/uuid";

import { SaleNotFoundError } from "../domain/errors";
import type { Sale } from "../domain/sale";
import type { SaleRepository } from "../domain/sale.repository";

export interface SaleDetail {
  readonly sale: Sale;
}

/**
 * A sale. The names of its products are not asked here: the view reads them
 * from the cached catalog of products of the browser (a sale keeps only the
 * productId), so opening a sale costs one request, not two.
 */
export class GetSaleDetailUseCase {
  constructor(private readonly repository: SaleRepository) {}

  async execute(id: string): Promise<SaleDetail> {
    if (!isUuid(id)) throw new SaleNotFoundError();
    return { sale: await this.repository.findById(id) };
  }
}
