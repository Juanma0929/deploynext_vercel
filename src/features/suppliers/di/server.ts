import { cache } from "react";

import { serverHttpClient } from "@/shared/di/http-server";

import {
  GetSupplierDetailUseCase,
  type SupplierDetail,
} from "../application/get-supplier-detail.use-case";
import { GetSupplierUseCase } from "../application/get-supplier.use-case";
import type { Supplier } from "../domain/supplier";
import { SupplierHttpRepository } from "../infrastructure/supplier.http.repository";

export type { SupplierDetail };
export type { SupplierProps } from "../domain/supplier";
export { SupplierNotFoundError } from "../domain/errors";

/**
 * The detail of a supplier, for the server. cache() makes generateMetadata
 * and the page of the same request share one pair of API calls.
 */
export const getSupplierDetail = cache((id: string): Promise<SupplierDetail> => {
  const http = serverHttpClient(`/proveedores/${encodeURIComponent(id)}`);
  return new GetSupplierDetailUseCase(new SupplierHttpRepository(http)).execute(id);
});

/** One supplier for the edit page, cached like the detail. */
export const getSupplier = cache((id: string): Promise<Supplier> => {
  const http = serverHttpClient(`/proveedores/${encodeURIComponent(id)}/editar`);
  return new GetSupplierUseCase(new SupplierHttpRepository(http)).execute(id);
});
