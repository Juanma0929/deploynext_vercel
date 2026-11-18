import { Supplier } from "../domain/supplier";
import type { SupplierDto } from "./dto/supplier.dto";

export function toSupplier(dto: SupplierDto): Supplier {
  return new Supplier({
    id: dto.id,
    name: dto.name,
    contactName: dto.contactName ?? null,
    phone: dto.phone ?? null,
    email: dto.email ?? null,
    address: dto.address ?? null,
  });
}
