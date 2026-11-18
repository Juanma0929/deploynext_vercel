import type { HttpClient } from "@/shared/infrastructure/http";

import type { Seller, SellerDirectory } from "../domain/seller";
import type { SellerDto } from "./dto/seller.dto";

/** Reads the users only for their names, so sales does not import users. */
export class SellerDirectoryHttpRepository implements SellerDirectory {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Seller[]> {
    const users = await this.http.get<SellerDto[]>("/users");
    return users.map(({ id, name, isActive }) => ({ id, name, isActive }));
  }
}
