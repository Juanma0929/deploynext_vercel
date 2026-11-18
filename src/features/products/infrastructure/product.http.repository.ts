import type { HttpClient } from "@/shared/infrastructure/http";

import type { Product } from "../domain/product";
import type {
  ProductRepository,
  SupplierName,
  SupplierNameRepository,
} from "../domain/product.repository";
import type { ProductDto, SupplierNameDto } from "./dto/product.dto";
import { toProduct, toSupplierName } from "./product.mapper";

export class ProductHttpRepository implements ProductRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Product[]> {
    const dtos = await this.http.get<ProductDto[]>("/products");
    return dtos.map(toProduct);
  }
}

export class SupplierNameHttpRepository implements SupplierNameRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<SupplierName[]> {
    const dtos = await this.http.get<SupplierNameDto[]>("/suppliers");
    return dtos.map(toSupplierName);
  }
}
