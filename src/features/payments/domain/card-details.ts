import { DomainError } from "@/shared/domain/errors";

import { customerEmailIssue, installmentsIssue } from "./payment-request";

/** What the card form holds, as typed. It lives only while the form is submitted. */
export interface CardFormValues {
  readonly cardNumber: string;
  /** "MM", 1 to 12. */
  readonly expMonth: string;
  /** "AA" or "AAAA". */
  readonly expYear: string;
  readonly cvc: string;
  readonly cardHolder: string;
}

export type CardField = keyof CardFormValues;
export type CardIssues = Partial<Record<CardField, string>>;

/** Wompi asks for at least 5 characters in the name of the holder. */
const MIN_HOLDER_LENGTH = 5;

/** Spaces and dashes are only how a card number is written: "4242 4242 …" is 4242…. */
export function normalizeCardNumber(text: string): string {
  return text.replace(/[\s-]/g, "");
}

/**
 * The rules of a card before sending it to Wompi: a number of 13 to 19 digits
 * that passes the Luhn check, an expiry that has not passed, a CVC of 3 or 4
 * digits and the name of the holder. Wompi checks again; this only spares the
 * user a round trip for a typo.
 */
export function cardIssues(values: CardFormValues, now: Date): CardIssues {
  const issues: CardIssues = {};

  const number = normalizeCardNumber(values.cardNumber);
  if (number === "") issues.cardNumber = "Escribe el número de la tarjeta.";
  else if (!/^\d{13,19}$/.test(number) || !passesLuhn(number)) {
    issues.cardNumber = "El número de la tarjeta no es válido.";
  }

  const month = Number(values.expMonth.trim());
  const year = fullYear(values.expYear.trim());
  if (!/^\d{1,2}$/.test(values.expMonth.trim()) || month < 1 || month > 12) {
    issues.expMonth = "Escribe el mes de vencimiento, de 01 a 12.";
  } else if (year === null) {
    issues.expYear = "Escribe el año de vencimiento, por ejemplo 29.";
  } else if (isExpired(month, year, now)) {
    issues.expYear = "La tarjeta está vencida.";
  }

  if (!/^\d{3,4}$/.test(values.cvc.trim())) issues.cvc = "El CVC tiene 3 o 4 dígitos.";

  if (values.cardHolder.trim().length < MIN_HOLDER_LENGTH) {
    issues.cardHolder = `Escribe el nombre como aparece en la tarjeta (mínimo ${MIN_HOLDER_LENGTH} letras).`;
  }

  return issues;
}

/**
 * A card that passed the rules, ready to be tokenised. It is never stored and
 * never sent to our backend: only the tokeniser sends it, to Wompi, and the
 * backend receives the token.
 */
export class CardDetails {
  private constructor(
    readonly number: string,
    /** Two digits: "08". */
    readonly expMonth: string,
    /** Two digits: "29". */
    readonly expYear: string,
    readonly cvc: string,
    readonly holder: string,
  ) {}

  /** Throws InvalidCardPaymentError with the message of each wrong field. */
  static from(values: CardFormValues, now: Date): CardDetails {
    const issues = cardIssues(values, now);
    if (Object.keys(issues).length > 0) throw new InvalidCardPaymentError(issues);

    const year = fullYear(values.expYear.trim()) as number;
    return new CardDetails(
      normalizeCardNumber(values.cardNumber),
      values.expMonth.trim().padStart(2, "0"),
      String(year % 100).padStart(2, "0"),
      values.cvc.trim(),
      values.cardHolder.trim(),
    );
  }
}

/** The whole card form: the card, plus the email of the customer and the installments. */
export interface CardPaymentFormValues extends CardFormValues {
  readonly customerEmail: string;
  /** As typed in the select: "1" to "36". */
  readonly installments: string;
}

export type CardPaymentField = keyof CardPaymentFormValues;
export type CardPaymentIssues = Partial<Record<CardPaymentField, string>>;

/** Every rule of a card charge at once, so the form shows all the wrong fields together. */
export function cardPaymentIssues(values: CardPaymentFormValues, now: Date): CardPaymentIssues {
  const issues: CardPaymentIssues = { ...cardIssues(values, now) };

  const email = customerEmailIssue(values.customerEmail);
  if (email !== undefined) issues.customerEmail = email;

  const installments = installmentsIssue(Number(values.installments));
  if (installments !== undefined) issues.installments = installments;

  return issues;
}

/** A card charge that breaks at least one rule, with the message of each field. */
export class InvalidCardPaymentError extends DomainError {
  constructor(readonly issues: CardPaymentIssues) {
    super("Revisa los datos del cobro con tarjeta.");
    this.name = "InvalidCardPaymentError";
  }
}

/** The Luhn checksum every card number carries in its last digit. */
function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** "29" is 2029 and "2029" is 2029; anything else is not a year. */
function fullYear(text: string): number | null {
  if (/^\d{2}$/.test(text)) return 2000 + Number(text);
  if (/^\d{4}$/.test(text)) return Number(text);
  return null;
}

/** A card works until the last day of its month. */
function isExpired(month: number, year: number, now: Date): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}
