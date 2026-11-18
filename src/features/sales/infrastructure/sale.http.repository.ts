import type { HttpClient } from "@/shared/infrastructure/http";

import type { Sale } from "../domain/sale";
import type { SaleRepository } from "../domain/sale.repository";
import type { SaleDto } from "./dto/sale.dto";
import { toSale } from "./sale.mapper";

export class SaleHttpRepository implements SaleRepository {
  constructor(private readonly http: HttpClient) {}

  async findToday(): Promise<Sale[]> {
    const dtos = await this.http.get<SaleDto[]>("/sales/today");
    return dtos.map(toSale);
  }
}
