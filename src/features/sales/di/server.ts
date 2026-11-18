import { cache } from "react";

import { serverHttpClient } from "@/shared/di/http-server";

import { GetSaleDetailUseCase, type SaleDetail } from "../application/get-sale-detail.use-case";
import { SaleProductCatalogHttpRepository } from "../infrastructure/sale-product-catalog.http.repository";
import { SaleHttpRepository } from "../infrastructure/sale.http.repository";

export type { SaleDetail };
export { SaleNotFoundError, SaleNotYoursError } from "../domain/errors";

/**
 * A sale and the names of its products, for the server. Loaded here and not
 * in the browser so a 403 shows "Esta venta no es tuya" without the generic
 * notice the app shell raises for every 403 of the browser client.
 */
export const getSaleDetail = cache((id: string): Promise<SaleDetail> => {
  const http = serverHttpClient(`/ventas/${encodeURIComponent(id)}`);
  return new GetSaleDetailUseCase(
    new SaleHttpRepository(http),
    new SaleProductCatalogHttpRepository(http),
  ).execute(id);
});
