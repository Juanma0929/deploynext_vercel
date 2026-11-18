import type { HttpClient } from "@/shared/infrastructure/http";

import type { Supplier } from "../domain/supplier";
import type { SupplierRepository } from "../domain/supplier.repository";
import type { SupplierDto } from "./dto/supplier.dto";
import { toSupplier } from "./supplier.mapper";

export class SupplierHttpRepository implements SupplierRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Supplier[]> {
    const suppliers = await this.http.get<SupplierDto[]>("/suppliers");
    return suppliers.map(toSupplier);
  }
}
