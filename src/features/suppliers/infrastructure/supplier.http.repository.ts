import type { HttpClient } from "@/shared/infrastructure/http";

import type { Supplier } from "../domain/supplier";
import type { SupplierProduct } from "../domain/supplier-product";
import type { SupplierRepository } from "../domain/supplier.repository";
import type { SupplierProductDto } from "./dto/supplier-product.dto";
import type { SupplierDto } from "./dto/supplier.dto";
import { toSupplier, toSupplierLookupError, toSupplierProduct } from "./supplier.mapper";

export class SupplierHttpRepository implements SupplierRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Supplier[]> {
    const suppliers = await this.http.get<SupplierDto[]>("/suppliers");
    return suppliers.map(toSupplier);
  }

  async findById(id: string): Promise<Supplier> {
    try {
      return toSupplier(await this.http.get<SupplierDto>(`/suppliers/${encodeURIComponent(id)}`));
    } catch (error: unknown) {
      throw toSupplierLookupError(error);
    }
  }

  async listProducts(supplierId: string): Promise<SupplierProduct[]> {
    try {
      const path = `/suppliers/${encodeURIComponent(supplierId)}/products`;
      const products = await this.http.get<SupplierProductDto[]>(path);
      return products.map(toSupplierProduct);
    } catch (error: unknown) {
      throw toSupplierLookupError(error);
    }
  }
}
