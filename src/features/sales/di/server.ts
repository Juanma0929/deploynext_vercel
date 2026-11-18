import { cache } from "react";

import { serverHttpClient } from "@/shared/di/http-server";

import { GetSaleDetailUseCase, type SaleDetail } from "../application/get-sale-detail.use-case";
import { SaleHttpRepository } from "../infrastructure/sale.http.repository";

export type { SaleDetail };
export { SaleNotFoundError, SaleNotYoursError } from "../domain/errors";

/**
 * A sale, for the server. Loaded here and not in the browser so a 403 shows
 * "Esta venta no es tuya" without the generic notice the app shell raises for
 * every 403 of the browser client.
 */
export const getSaleDetail = cache((id: string): Promise<SaleDetail> => {
  const http = serverHttpClient(`/ventas/${encodeURIComponent(id)}`);
  return new GetSaleDetailUseCase(new SaleHttpRepository(http)).execute(id);
});
