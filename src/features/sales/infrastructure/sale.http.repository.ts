import type { HttpClient } from "@/shared/infrastructure/http";

import type { Sale } from "../domain/sale";
import type { SaleItem } from "../domain/sale-draft";
import type { SaleRepository } from "../domain/sale.repository";
import type { SaleDto } from "./dto/sale.dto";
import { toCreateSaleDto, toCreateSaleError, toSale } from "./sale.mapper";

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
}
