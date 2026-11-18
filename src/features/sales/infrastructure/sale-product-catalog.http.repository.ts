import type { HttpClient } from "@/shared/infrastructure/http";

import type { SaleProduct } from "../domain/sale-product";
import type { SaleProductCatalog } from "../domain/sale.repository";
import type { SaleProductDto } from "./dto/sale-product.dto";
import { toSaleProduct } from "./sale.mapper";

export class SaleProductCatalogHttpRepository implements SaleProductCatalog {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<SaleProduct[]> {
    const products = await this.http.get<SaleProductDto[]>("/products");
    return products.map(toSaleProduct);
  }
}
