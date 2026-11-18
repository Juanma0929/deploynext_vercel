import type { HttpClient } from "@/shared/infrastructure/http";

import type { Supplier } from "../domain/supplier";
import type { NewSupplier, SupplierChanges } from "../domain/supplier-input";
import type { SupplierProduct } from "../domain/supplier-product";
import type { SupplierRepository } from "../domain/supplier.repository";
import type { SupplierProductDto } from "./dto/supplier-product.dto";
import type { SupplierDto } from "./dto/supplier.dto";
import {
  toCreateSupplierDto,
  toSupplierDeleteError,
  toSupplier,
  toSupplierLookupError,
  toSupplierProduct,
  toSupplierWriteError,
  toUpdateSupplierDto,
} from "./supplier.mapper";

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

  async create(supplier: NewSupplier): Promise<Supplier> {
    return toSupplier(await this.http.post<SupplierDto>("/suppliers", toCreateSupplierDto(supplier)));
  }

  async update(id: string, changes: SupplierChanges): Promise<Supplier> {
    try {
      const path = `/suppliers/${encodeURIComponent(id)}`;
      return toSupplier(await this.http.patch<SupplierDto>(path, toUpdateSupplierDto(changes)));
    } catch (error: unknown) {
      throw toSupplierWriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // 204 No Content: the client returns undefined without reading a body.
      await this.http.delete<void>(`/suppliers/${encodeURIComponent(id)}`);
    } catch (error: unknown) {
      throw toSupplierDeleteError(error);
    }
  }
}
