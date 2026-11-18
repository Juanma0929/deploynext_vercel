import type { Sale } from "./sale";

export interface SaleRepository {
  /**
   * The sales of today in Colombian time, newest first. A seller gets only its
   * own; an admin gets every one.
   */
  findToday(): Promise<Sale[]>;
}
