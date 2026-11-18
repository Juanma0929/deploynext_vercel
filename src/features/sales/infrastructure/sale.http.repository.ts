import type { HttpClient } from "@/shared/infrastructure/http";

import type { Sale } from "../domain/sale";
import type { SaleItem } from "../domain/sale-draft";
import type { SaleRepository } from "../domain/sale.repository";
import type { SaleDto } from "./dto/sale.dto";
import {
  toCancelSaleError,
  toCreateSaleDto,
  toCreateSaleError,
  toSale,
  toSaleLookupError,
} from "./sale.mapper";

export class SaleHttpRepository implements SaleRepository {
  constructor(private readonly http: HttpClient) {}

  async findToday(): Promise<Sale[]> {
    const dtos = await this.http.get<SaleDto[]>("/sales/today");
    return dtos.map(toSale);
  }

  async findAll(): Promise<Sale[]> {
    const dtos = await this.http.get<SaleDto[]>("/sales");
    return dtos.map(toSale);
  }

  async create(items: readonly SaleItem[]): Promise<Sale> {
    try {
      return toSale(await this.http.post<SaleDto>("/sales", toCreateSaleDto(items)));
    } catch (error: unknown) {
      throw toCreateSaleError(error);
    }
  }

  async findById(id: string): Promise<Sale> {
    try {
      return toSale(await this.http.get<SaleDto>(`/sales/${encodeURIComponent(id)}`));
    } catch (error: unknown) {
      throw toSaleLookupError(error);
    }
  }

  async cancel(id: string): Promise<Sale> {
    try {
      return toSale(await this.http.post<SaleDto>(`/sales/${encodeURIComponent(id)}/cancel`));
    } catch (error: unknown) {
      throw toCancelSaleError(error);
    }
  }
}
