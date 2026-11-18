import { Product } from "../domain/product";
import type { SupplierName } from "../domain/product.repository";
import type { ProductDto, SupplierNameDto } from "./dto/product.dto";

export function toProduct(dto: ProductDto): Product {
  return new Product({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    barcode: dto.barcode,
    purchasePrice: dto.purchasePrice,
    salePrice: dto.salePrice,
    currentStock: dto.currentStock,
    minimumStock: dto.minimumStock,
    supplierId: dto.supplierId,
    isActive: dto.isActive,
  });
}

export function toSupplierName(dto: SupplierNameDto): SupplierName {
  return { id: dto.id, name: dto.name };
}
