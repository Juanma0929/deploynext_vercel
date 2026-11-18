import { cache } from "react";

import { serverHttpClient } from "@/shared/di/http-server";

import {
  GetSupplierDetailUseCase,
  type SupplierDetail,
} from "../application/get-supplier-detail.use-case";
import { SupplierHttpRepository } from "../infrastructure/supplier.http.repository";

export type { SupplierDetail };
export { SupplierNotFoundError } from "../domain/errors";

/**
 * The detail of a supplier, for the server. cache() makes generateMetadata
 * and the page of the same request share one pair of API calls.
 */
export const getSupplierDetail = cache((id: string): Promise<SupplierDetail> => {
  const http = serverHttpClient(`/proveedores/${encodeURIComponent(id)}`);
  return new GetSupplierDetailUseCase(new SupplierHttpRepository(http)).execute(id);
});
