"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import type { StartedCardPayment } from "../application/charge-with-card.use-case";
import {
  cardPaymentIssues,
  type CardPaymentField,
  type CardPaymentFormValues,
  type CardPaymentIssues,
} from "../domain/card-details";
import { MAX_INSTALLMENTS, MIN_INSTALLMENTS } from "../domain/payment-request";
import { ChargeStarted, NotChargeable } from "./payment-outcome";
import { useChargeWithCard } from "./use-charge-with-card";

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

/** The cards of the Wompi sandbox: the result depends only on the number. */
const SANDBOX_CARDS = [
  { number: "4242 4242 4242 4242", label: "aprueba" },
  { number: "4111 1111 1111 1111", label: "rechaza" },
] as const;

const INSTALLMENT_OPTIONS = Array.from(
  { length: MAX_INSTALLMENTS - MIN_INSTALLMENTS + 1 },
  (_, index) => MIN_INSTALLMENTS + index,
);

interface CardPaymentFormProps {
  readonly saleId: string;
  /** The total of the sale, already formatted ("$ 12.500"), for the button. */
  readonly totalLabel: string;
}

/**
 * Charges a sale with a card. The card fields are uncontrolled: their values
 * live only in the inputs and are read once, on submit, to be tokenised with
 * Wompi. They are never put in React state, in a store, nor sent to our
 * backend, which only receives the token. The form is emptied after the
 * charge starts.
 */
export function CardPaymentForm({ saleId, totalLabel }: CardPaymentFormProps) {
  const charge = useChargeWithCard(saleId);
  const formRef = useRef<HTMLFormElement>(null);
  const ids = {
    customerEmail: useId(),
    cardNumber: useId(),
    expMonth: useId(),
    expYear: useId(),
    cvc: useId(),
    cardHolder: useId(),
    installments: useId(),
  } satisfies Record<CardPaymentField, string>;

  const [issues, setIssues] = useState<CardPaymentIssues>({});
  const [failure, setFailure] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [notChargeable, setNotChargeable] = useState<string | null>(null);
  const [started, setStarted] = useState<StartedCardPayment | null>(null);
  const [isSending, setIsSending] = useState(false);

  /** Fills the form with a sandbox card, for the demo. */
  function fillSandboxCard(number: string) {
    const form = formRef.current;
    if (form === null) return;
    const set = (name: CardPaymentField, value: string, onlyIfEmpty = false) => {
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement && (!onlyIfEmpty || input.value === "")) input.value = value;
    };
    set("cardNumber", number);
    set("expMonth", "12", true);
    set("expYear", String((new Date().getFullYear() + 2) % 100), true);
    set("cvc", "123", true);
    set("cardHolder", "Cliente de Prueba", true);
    setIssues({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const values = readValues(event.currentTarget);
    const found = cardPaymentIssues(values, new Date());
    setIssues(found);
    if (Object.keys(found).length > 0) return;

    setIsSending(true);
    const result = await charge(values);
    setIsSending(false);

    switch (result.kind) {
      case "started":
        formRef.current?.reset();
        setStarted(result.result);
        return;
      case "invalid":
        setIssues(result.issues);
        if (result.message !== null) setFailure({ message: result.message, canRetry: false });
        return;
      case "not-chargeable":
        formRef.current?.reset();
        setNotChargeable(result.message);
        return;
      case "failed":
        setFailure({ message: result.message, canRetry: result.canRetry });
    }
  }

  if (started !== null) {
    return (
      <ChargeStarted
        saleId={saleId}
        transactionId={started.payment.transactionId}
        title="Cobro con tarjeta enviado"
      >
        <p>
          Se envió el cobro de <strong>{totalLabel}</strong> a la tarjeta {started.card.brand}{" "}
          terminada en <span className="font-mono">{started.card.lastFour}</span>. Wompi está
          procesando el pago: mientras tanto, la venta queda <strong>pendiente</strong>.
        </p>
      </ChargeStarted>
    );
  }

  if (notChargeable !== null) return <NotChargeable saleId={saleId} message={notChargeable} />;

  const describedBy = (field: CardPaymentField, extra = "") =>
    [extra, issues[field] ? `${ids[field]}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      autoComplete="off"
      className="flex max-w-lg flex-col gap-4"
    >
      {failure !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {failure.message}
        </p>
      )}

      <Field id={ids.customerEmail} label="Correo del cliente" error={issues.customerEmail}>
        <input
          id={ids.customerEmail}
          name="customerEmail"
          type="email"
          aria-invalid={issues.customerEmail !== undefined}
          aria-describedby={describedBy("customerEmail")}
          aria-required
          placeholder="cliente@correo.com"
          className={INPUT_CLASS}
        />
      </Field>

      <Field id={ids.cardNumber} label="Número de la tarjeta" error={issues.cardNumber}>
        <input
          id={ids.cardNumber}
          name="cardNumber"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={issues.cardNumber !== undefined}
          aria-describedby={describedBy("cardNumber", `${ids.cardNumber}-hint`)}
          aria-required
          placeholder="4242 4242 4242 4242"
          className={`${INPUT_CLASS} font-mono`}
        />
        <div id={`${ids.cardNumber}-hint`} className="text-muted flex flex-wrap items-center gap-2 text-xs">
          <span>Tarjetas de prueba del sandbox:</span>
          {SANDBOX_CARDS.map((card) => (
            <button
              key={card.number}
              type="button"
              onClick={() => fillSandboxCard(card.number)}
              className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono hover:bg-slate-100"
            >
              {card.number.slice(0, 4)}…{card.number.slice(-4)}{" "}
              <span className="font-sans">({card.label})</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field id={ids.expMonth} label="Mes" error={issues.expMonth}>
          <input
            id={ids.expMonth}
            name="expMonth"
            type="text"
            inputMode="numeric"
            maxLength={2}
            aria-invalid={issues.expMonth !== undefined}
            aria-describedby={describedBy("expMonth")}
            aria-required
            placeholder="MM"
            className={INPUT_CLASS}
          />
        </Field>
        <Field id={ids.expYear} label="Año" error={issues.expYear}>
          <input
            id={ids.expYear}
            name="expYear"
            type="text"
            inputMode="numeric"
            maxLength={4}
            aria-invalid={issues.expYear !== undefined}
            aria-describedby={describedBy("expYear")}
            aria-required
            placeholder="AA"
            className={INPUT_CLASS}
          />
        </Field>
        <Field id={ids.cvc} label="CVC" error={issues.cvc}>
          <input
            id={ids.cvc}
            name="cvc"
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            aria-invalid={issues.cvc !== undefined}
            aria-describedby={describedBy("cvc")}
            aria-required
            placeholder="123"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field id={ids.cardHolder} label="Nombre en la tarjeta" error={issues.cardHolder}>
        <input
          id={ids.cardHolder}
          name="cardHolder"
          type="text"
          aria-invalid={issues.cardHolder !== undefined}
          aria-describedby={describedBy("cardHolder")}
          aria-required
          className={INPUT_CLASS}
        />
      </Field>

      <Field id={ids.installments} label="Cuotas" error={issues.installments}>
        <select
          id={ids.installments}
          name="installments"
          defaultValue="1"
          aria-invalid={issues.installments !== undefined}
          aria-describedby={describedBy("installments")}
          className={INPUT_CLASS}
        >
          {INSTALLMENT_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count === 1 ? "1 cuota" : `${count} cuotas`}
            </option>
          ))}
        </select>
      </Field>

      <p className="text-muted text-xs">
        Los datos de la tarjeta van directo a Wompi. StockPyme solo recibe un token para cobrarla.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href={`/ventas/${saleId}`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Volver
        </Link>
        <button
          type="submit"
          disabled={isSending}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSending
            ? "Cobrando…"
            : failure?.canRetry
              ? `Reintentar cobro de ${totalLabel}`
              : `Cobrar ${totalLabel} con tarjeta`}
        </button>
      </div>
    </form>
  );
}

/** Reads the form once, on submit. The values are passed on and not kept. */
function readValues(form: HTMLFormElement): CardPaymentFormValues {
  const data = new FormData(form);
  const text = (name: CardPaymentField) => {
    const value = data.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    customerEmail: text("customerEmail"),
    cardNumber: text("cardNumber"),
    expMonth: text("expMonth"),
    expYear: text("expYear"),
    cvc: text("cvc"),
    cardHolder: text("cardHolder"),
    installments: text("installments"),
  };
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        <span className="text-red-600" aria-hidden="true"> *</span>
      </label>
      {children}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
