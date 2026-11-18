/** How the payment methods of Wompi are named in the interface. Unknown ones show as sent. */
const PAYMENT_METHOD_LABELS: Readonly<Record<string, string>> = {
  NEQUI: "Nequi",
  CARD: "Tarjeta",
  PSE: "PSE",
  BANCOLOMBIA_TRANSFER: "Transferencia Bancolombia",
};

export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method.toUpperCase()] ?? method;
}
