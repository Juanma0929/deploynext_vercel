"use client";

import { useId, useRef, useState, type FormEvent } from "react";

import { Alert, Button, ButtonLink, Field, Select, TextInput, describedBy } from "@/shared/presentation/ui";

import type { StartedCardPayment } from "../application/charge-with-card.use-case";
import {
  cardPaymentIssues,
  type CardPaymentField,
  type CardPaymentFormValues,
  type CardPaymentIssues,
} from "../domain/card-details";
import { MAX_INSTALLMENTS, MIN_INSTALLMENTS } from "../domain/payment-request";
import { ChargeStarted, NotChargeable } from "./payment-outcome";
import { SandboxOptions } from "./sandbox-options";
import { usePayment } from "./use-payment";

/** The cards of the Wompi sandbox: the result depends only on the number. */
const SANDBOX_CARDS = [
  { value: "4242 4242 4242 4242", display: "4242…4242", outcome: "aprueba" },
  { value: "4111 1111 1111 1111", display: "4111…1111", outcome: "rechaza" },
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
  const charge = usePayment(saleId).chargeWithCard;
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

  /** The props every card field shares: its id, its error and the aria wiring. */
  const control = (field: CardPaymentField, hint = false) => ({
    id: ids[field],
    name: field,
    invalid: issues[field] !== undefined,
    "aria-describedby": describedBy(ids[field], { hint, error: issues[field] }),
    "aria-required": true,
  });

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      autoComplete="off"
      className="flex max-w-lg flex-col gap-4"
    >
      {failure !== null && (
        <Alert tone="danger">
          <p>{failure.message}</p>
        </Alert>
      )}

      <Field id={ids.customerEmail} label="Correo del cliente" error={issues.customerEmail} required>
        <TextInput {...control("customerEmail")} type="email" placeholder="cliente@correo.com" />
      </Field>

      <Field
        id={ids.cardNumber}
        label="Número de la tarjeta"
        error={issues.cardNumber}
        required
        hint={
          <SandboxOptions title="Tarjetas de prueba del sandbox:" options={SANDBOX_CARDS} onPick={fillSandboxCard} />
        }
      >
        <TextInput
          {...control("cardNumber", true)}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          className="font-mono"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field id={ids.expMonth} label="Mes" error={issues.expMonth} required>
          <TextInput {...control("expMonth")} type="text" inputMode="numeric" maxLength={2} placeholder="MM" />
        </Field>
        <Field id={ids.expYear} label="Año" error={issues.expYear} required>
          <TextInput {...control("expYear")} type="text" inputMode="numeric" maxLength={4} placeholder="AA" />
        </Field>
        <Field id={ids.cvc} label="CVC" error={issues.cvc} required>
          <TextInput
            {...control("cvc")}
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            placeholder="123"
          />
        </Field>
      </div>

      <Field id={ids.cardHolder} label="Nombre en la tarjeta" error={issues.cardHolder} required>
        <TextInput {...control("cardHolder")} type="text" />
      </Field>

      <Field id={ids.installments} label="Cuotas" error={issues.installments} required>
        <Select {...control("installments")} defaultValue="1">
          {INSTALLMENT_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count === 1 ? "1 cuota" : `${count} cuotas`}
            </option>
          ))}
        </Select>
      </Field>

      <p className="text-muted text-xs">
        Los datos de la tarjeta van directo a Wompi. StockPyme solo recibe un token para cobrarla.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href={`/ventas/${saleId}`} variant="secondary">
          Volver
        </ButtonLink>
        <Button type="submit" isLoading={isSending} loadingText="Cobrando…">
          {failure?.canRetry ? `Reintentar cobro de ${totalLabel}` : `Cobrar ${totalLabel} con tarjeta`}
        </Button>
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
