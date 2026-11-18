import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/errors";

import {
  InvalidPaymentRequestError,
  nequiPaymentIssues,
  normalizePhoneNumber,
  PaymentRequest,
  type PaymentIssues,
} from "./payment-request";

/** The message of each wrong field of a request that has to be refused. */
function issuesOf(build: () => unknown): PaymentIssues {
  try {
    build();
  } catch (error: unknown) {
    if (error instanceof InvalidPaymentRequestError) return error.issues;
    throw error;
  }
  throw new Error("The request should have been refused.");
}

describe("PaymentRequest.nequi", () => {
  it("builds the request with the number as the API expects it", () => {
    const request = PaymentRequest.nequi({ customerEmail: "  cliente@correo.co ", phoneNumber: "399 111-1111" });
    expect(request.customerEmail).toBe("cliente@correo.co");
    expect(request.details).toEqual({ method: "NEQUI", phoneNumber: "3991111111" });
  });

  it("refuses an empty or invalid email", () => {
    expect(issuesOf(() => PaymentRequest.nequi({ customerEmail: "", phoneNumber: "3991111111" }))).toEqual({
      customerEmail: "Escribe el correo del cliente.",
    });
    expect(
      issuesOf(() => PaymentRequest.nequi({ customerEmail: "no-es-correo", phoneNumber: "3991111111" })),
    ).toEqual({ customerEmail: "Escribe un correo válido." });
  });

  it("refuses a number that is not exactly 10 digits, and reports every wrong field", () => {
    expect(issuesOf(() => PaymentRequest.nequi({ customerEmail: "x", phoneNumber: "+57 3991111111" }))).toEqual({
      customerEmail: "Escribe un correo válido.",
      phoneNumber: "El número de Nequi debe tener 10 dígitos, sin el +57.",
    });
    expect(nequiPaymentIssues({ customerEmail: "a@b.co", phoneNumber: "" })).toEqual({
      phoneNumber: "Escribe el número de Nequi del cliente.",
    });
  });

  it("only drops how people write a number: spaces, dashes, dots, parentheses", () => {
    expect(normalizePhoneNumber("(399) 111.11-11")).toBe("3991111111");
  });
});

describe("PaymentRequest.card", () => {
  const valid = { customerEmail: "cliente@correo.co", cardToken: " tok_test_123 ", installments: 3 };

  it("builds the request with the card token, never the card", () => {
    expect(PaymentRequest.card(valid).details).toEqual({
      method: "CARD",
      cardToken: "tok_test_123",
      installments: 3,
    });
  });

  it("accepts from 1 to 36 installments, whole numbers only", () => {
    expect(() => PaymentRequest.card({ ...valid, installments: 1 })).not.toThrow();
    expect(() => PaymentRequest.card({ ...valid, installments: 36 })).not.toThrow();
    for (const installments of [0, 37, 2.5]) {
      expect(issuesOf(() => PaymentRequest.card({ ...valid, installments }))).toEqual({
        installments: "Las cuotas van de 1 a 36.",
      });
    }
  });

  it("refuses a request without the card token", () => {
    expect(() => PaymentRequest.card({ ...valid, cardToken: "  " })).toThrow(DomainError);
    expect(() => PaymentRequest.card({ ...valid, cardToken: "" })).toThrow("Falta el token de la tarjeta.");
  });
});
