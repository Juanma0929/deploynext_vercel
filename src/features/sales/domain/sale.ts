import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

import { isSaleStatus, type SaleStatus } from "./sale-status";

export interface SaleLineProps {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
}

/** One product of a sale, with the price it had when it was sold. */
export class SaleLine {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly subtotal: Money;

  constructor(props: SaleLineProps) {
    if (!Number.isSafeInteger(props.quantity) || props.quantity < 1) {
      throw new DomainError("La cantidad de cada producto debe ser un entero mayor que cero.");
    }

    this.productId = props.productId;
    this.quantity = props.quantity;
    this.unitPrice = Money.cop(props.unitPrice);
    this.subtotal = Money.cop(props.subtotal);
  }
}

export interface SaleProps {
  readonly id: string;
  readonly createdAt: Date;
  readonly sellerId: string;
  readonly total: number;
  readonly status: string;
  readonly lines: readonly SaleLineProps[];
  /** Set by the payment: the Wompi transaction and how it was paid ("NEQUI", "CARD"). */
  readonly paymentTransactionId?: string | null;
  readonly paymentMethod?: string | null;
}

/** A sale as the API keeps it. The prices and the total come from the server. */
export class Sale {
  readonly id: string;
  readonly createdAt: Date;
  readonly sellerId: string;
  readonly total: Money;
  readonly status: SaleStatus;
  readonly lines: readonly SaleLine[];
  readonly paymentTransactionId: string | null;
  readonly paymentMethod: string | null;

  constructor(props: SaleProps) {
    if (!isSaleStatus(props.status)) {
      throw new DomainError("El estado de la venta no es válido.");
    }
    if (Number.isNaN(props.createdAt.getTime())) {
      throw new DomainError("La fecha de la venta no es válida.");
    }
    if (props.lines.length === 0) {
      throw new DomainError("Una venta debe tener al menos un producto.");
    }

    this.id = props.id;
    this.createdAt = props.createdAt;
    this.sellerId = props.sellerId;
    this.total = Money.cop(props.total);
    this.status = props.status;
    this.lines = props.lines.map((line) => new SaleLine(line));
    this.paymentTransactionId = props.paymentTransactionId?.trim() || null;
    this.paymentMethod = props.paymentMethod?.trim() || null;
  }

  /**
   * Pending and with no payment started: the only state in which a sale can
   * be charged, or cancelled by an admin (the API refuses both otherwise).
   */
  get isAwaitingPayment(): boolean {
    return this.status === "pending" && this.paymentTransactionId === null;
  }

  /** How many units were sold, adding every line. */
  get unitCount(): number {
    return this.lines.reduce((count, line) => count + line.quantity, 0);
  }

  /** How many different products, one per line of the sale. */
  get itemCount(): number {
    return this.lines.length;
  }
}

export interface SalesSummary {
  readonly count: number;
  /** Only paid sales are money in the till. */
  readonly paidTotal: Money;
  readonly pendingCount: number;
}

export function summarizeSales(sales: readonly Sale[]): SalesSummary {
  return {
    count: sales.length,
    paidTotal: Money.sum(sales.filter((sale) => sale.status === "paid").map((sale) => sale.total)),
    pendingCount: sales.filter((sale) => sale.status === "pending").length,
  };
}
