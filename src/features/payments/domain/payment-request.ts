import { isValidEmail } from "@/shared/domain/email";
import { DomainError } from "@/shared/domain/errors";

/** What the Nequi form holds, as typed. */
export interface NequiPaymentValues {
  readonly customerEmail: string;
  readonly phoneNumber: string;
}

export type NequiPaymentField = keyof NequiPaymentValues;

/** The message of each field that breaks a rule. Empty when the request is valid. */
export type PaymentIssues = Partial<Record<NequiPaymentField, string>>;

/** A Nequi number: exactly 10 digits, as the API checks it (/^\d{10}$/). */
const NEQUI_PHONE = /^\d{10}$/;

/**
 * Spaces, dashes, dots and parentheses are only how people write a number:
 * "399 111 1111" and "399-111-1111" are the same 3991111111.
 */
export function normalizePhoneNumber(text: string): string {
  return text.replace(/[\s\-.()]/g, "");
}

/** The rules of a Nequi charge, the same ones the API applies. */
export function nequiPaymentIssues(values: NequiPaymentValues): PaymentIssues {
  const issues: PaymentIssues = {};

  const email = values.customerEmail.trim();
  if (email === "") issues.customerEmail = "Escribe el correo del cliente.";
  else if (!isValidEmail(email)) issues.customerEmail = "Escribe un correo válido.";

  const phone = normalizePhoneNumber(values.phoneNumber);
  if (phone === "") issues.phoneNumber = "Escribe el número de Nequi del cliente.";
  else if (!NEQUI_PHONE.test(phone)) {
    issues.phoneNumber = "El número de Nequi debe tener 10 dígitos, sin el +57.";
  }

  return issues;
}

/**
 * A request to charge a sale. It cannot exist with an invalid email or, for
 * Nequi, with a number that is not 10 digits: whatever is built here is what
 * POST /sales/:id/payment accepts.
 */
export class PaymentRequest {
  private constructor(
    readonly customerEmail: string,
    readonly method: "NEQUI",
    readonly phoneNumber: string,
  ) {}

  /** Throws InvalidPaymentRequestError with the message of each wrong field. */
  static nequi(values: NequiPaymentValues): PaymentRequest {
    const issues = nequiPaymentIssues(values);
    if (Object.keys(issues).length > 0) throw new InvalidPaymentRequestError(issues);

    return new PaymentRequest(
      values.customerEmail.trim(),
      "NEQUI",
      normalizePhoneNumber(values.phoneNumber),
    );
  }
}

/** A payment request that breaks at least one rule, with the message of each field. */
export class InvalidPaymentRequestError extends DomainError {
  constructor(readonly issues: PaymentIssues) {
    super("Revisa los datos del cobro.");
    this.name = "InvalidPaymentRequestError";
  }
}
