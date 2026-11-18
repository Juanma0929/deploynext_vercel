import { ApiRequestError, type HttpClient } from "@/shared/infrastructure/http";

import { ProductNotFoundError } from "../domain/errors";
import type { Product } from "../domain/product";
import type { ProductChanges, ProductDraft } from "../domain/product-input";
import type {
  ProductRepository,
  SupplierName,
  SupplierNameRepository,
} from "../domain/product.repository";
import type { ProductDto, SupplierNameDto } from "./dto/product.dto";
import {
  toCreateProductDto,
  toProduct,
  toProductUpdateError,
  toProductWriteError,
  toSupplierName,
  toUpdateProductDto,
} from "./product.mapper";

export class ProductHttpRepository implements ProductRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Product[]> {
    const dtos = await this.http.get<ProductDto[]>("/products");
    return dtos.map(toProduct);
  }

  async create(draft: ProductDraft): Promise<Product> {
    try {
      return toProduct(await this.http.post<ProductDto>("/products", toCreateProductDto(draft)));
    } catch (error: unknown) {
      throw toProductWriteError(error);
    }
  }

  async update(id: string, changes: ProductChanges): Promise<Product> {
    try {
      const path = `/products/${encodeURIComponent(id)}`;
      return toProduct(await this.http.patch<ProductDto>(path, toUpdateProductDto(changes)));
    } catch (error: unknown) {
      throw toProductUpdateError(error, changes);
    }
  }

  async findById(id: string): Promise<Product> {
    try {
      return toProduct(await this.http.get<ProductDto>(`/products/${encodeURIComponent(id)}`));
    } catch (error: unknown) {
      // 404: it does not exist; 400: the id is not a UUID. Both read as "not found".
      if (isMissing(error)) throw new ProductNotFoundError();
      throw error;
    }
  }
}

export class SupplierNameHttpRepository implements SupplierNameRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<SupplierName[]> {
    const dtos = await this.http.get<SupplierNameDto[]>("/suppliers");
    return dtos.map(toSupplierName);
  }

  async findById(id: string): Promise<SupplierName | null> {
    try {
      return toSupplierName(
        await this.http.get<SupplierNameDto>(`/suppliers/${encodeURIComponent(id)}`),
      );
    } catch (error: unknown) {
      if (isMissing(error)) return null;
      throw error;
    }
  }
}

function isMissing(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.status === 404 || error.status === 400);
}
