import { isValidEmail } from "@/shared/domain/email";
import { DomainError } from "@/shared/domain/errors";

/** What the Nequi form holds, as typed. */
export interface NequiPaymentValues {
  readonly customerEmail: string;
  readonly phoneNumber: string;
}

export type NequiPaymentField = keyof NequiPaymentValues;

/** A card charge: the token Wompi gave for the card, never the card itself. */
export interface CardPaymentValues {
  readonly customerEmail: string;
  readonly cardToken: string;
  readonly installments: number;
}

/** The message of each field that breaks a rule. Empty when the request is valid. */
export type PaymentIssues = Partial<Record<"customerEmail" | "phoneNumber" | "installments", string>>;

/** A Nequi number: exactly 10 digits, as the API checks it (/^\d{10}$/). */
const NEQUI_PHONE = /^\d{10}$/;

/** The installments Wompi accepts for a credit card. */
export const MIN_INSTALLMENTS = 1;
export const MAX_INSTALLMENTS = 36;

/**
 * Spaces, dashes, dots and parentheses are only how people write a number:
 * "399 111 1111" and "399-111-1111" are the same 3991111111.
 */
export function normalizePhoneNumber(text: string): string {
  return text.replace(/[\s\-.()]/g, "");
}

export function customerEmailIssue(email: string): string | undefined {
  const value = email.trim();
  if (value === "") return "Escribe el correo del cliente.";
  if (!isValidEmail(value)) return "Escribe un correo válido.";
  return undefined;
}

export function installmentsIssue(installments: number): string | undefined {
  if (!Number.isSafeInteger(installments) || installments < MIN_INSTALLMENTS || installments > MAX_INSTALLMENTS) {
    return `Las cuotas van de ${MIN_INSTALLMENTS} a ${MAX_INSTALLMENTS}.`;
  }
  return undefined;
}

/** The rules of a Nequi charge, the same ones the API applies. */
export function nequiPaymentIssues(values: NequiPaymentValues): PaymentIssues {
  const issues: PaymentIssues = {};

  const email = customerEmailIssue(values.customerEmail);
  if (email !== undefined) issues.customerEmail = email;

  const phone = normalizePhoneNumber(values.phoneNumber);
  if (phone === "") issues.phoneNumber = "Escribe el número de Nequi del cliente.";
  else if (!NEQUI_PHONE.test(phone)) {
    issues.phoneNumber = "El número de Nequi debe tener 10 dígitos, sin el +57.";
  }

  return issues;
}

/** How the sale is paid, with what each method needs. */
export type PaymentMethodDetails =
  | { readonly method: "NEQUI"; readonly phoneNumber: string }
  | { readonly method: "CARD"; readonly cardToken: string; readonly installments: number };

/**
 * A request to charge a sale. It cannot exist with an invalid email, a Nequi
 * number that is not 10 digits, or a card without its token: whatever is
 * built here is what POST /sales/:id/payment accepts.
 */
export class PaymentRequest {
  private constructor(
    readonly customerEmail: string,
    readonly details: PaymentMethodDetails,
  ) {}

  /** Throws InvalidPaymentRequestError with the message of each wrong field. */
  static nequi(values: NequiPaymentValues): PaymentRequest {
    const issues = nequiPaymentIssues(values);
    if (Object.keys(issues).length > 0) throw new InvalidPaymentRequestError(issues);

    return new PaymentRequest(values.customerEmail.trim(), {
      method: "NEQUI",
      phoneNumber: normalizePhoneNumber(values.phoneNumber),
    });
  }

  /** Throws InvalidPaymentRequestError for a wrong email or installments. */
  static card(values: CardPaymentValues): PaymentRequest {
    const issues: PaymentIssues = {};
    const email = customerEmailIssue(values.customerEmail);
    if (email !== undefined) issues.customerEmail = email;
    const installments = installmentsIssue(values.installments);
    if (installments !== undefined) issues.installments = installments;
    if (Object.keys(issues).length > 0) throw new InvalidPaymentRequestError(issues);

    const cardToken = values.cardToken.trim();
    if (cardToken === "") throw new DomainError("Falta el token de la tarjeta.");

    return new PaymentRequest(values.customerEmail.trim(), {
      method: "CARD",
      cardToken,
      installments: values.installments,
    });
  }
}

/** A payment request that breaks at least one rule, with the message of each field. */
export class InvalidPaymentRequestError extends DomainError {
  constructor(readonly issues: PaymentIssues) {
    super("Revisa los datos del cobro.");
    this.name = "InvalidPaymentRequestError";
  }
}
