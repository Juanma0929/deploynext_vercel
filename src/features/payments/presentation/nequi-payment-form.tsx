"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import {
  nequiPaymentIssues,
  type NequiPaymentField,
  type NequiPaymentValues,
  type PaymentIssues,
} from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";
import { useChargeWithNequi } from "./use-charge-with-nequi";

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

/** The numbers of the Wompi sandbox: the result does not depend on any phone. */
const SANDBOX_NUMBERS = [
  { phoneNumber: "3991111111", label: "aprueba" },
  { phoneNumber: "3992222222", label: "rechaza" },
] as const;

interface NequiPaymentFormProps {
  readonly saleId: string;
  /** The total of the sale, already formatted ("$ 12.500"), for the button. */
  readonly totalLabel: string;
}

/**
 * Charges a sale with Nequi. The rules come from the PaymentRequest entity
 * (a valid email, a number of 10 digits). Once sent, Wompi pushes the charge
 * to the customer's phone and the sale stays pending until it is answered.
 */
export function NequiPaymentForm({ saleId, totalLabel }: NequiPaymentFormProps) {
  const charge = useChargeWithNequi(saleId);
  const ids = { customerEmail: useId(), phoneNumber: useId() } satisfies Record<
    NequiPaymentField,
    string
  >;

  const [values, setValues] = useState<NequiPaymentValues>({ customerEmail: "", phoneNumber: "" });
  const [issues, setIssues] = useState<PaymentIssues>({});
  const [failure, setFailure] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [notChargeable, setNotChargeable] = useState<string | null>(null);
  const [started, setStarted] = useState<StartedPayment | null>(null);
  const [isSending, setIsSending] = useState(false);

  function set(field: NequiPaymentField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setIssues((current) => {
      if (current[field] === undefined) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const found = nequiPaymentIssues(values);
    setIssues(found);
    if (Object.keys(found).length > 0) return;

    setIsSending(true);
    const result = await charge(values);
    setIsSending(false);

    switch (result.kind) {
      // No router.refresh(): the page would render again for a sale that is no
      // longer awaiting payment and replace this confirmation. "Ver la venta"
      // opens the detail, which is dynamic and loads the new status.
      case "started":
        setStarted(result.payment);
        return;
      case "invalid":
        setIssues(result.issues);
        return;
      case "not-chargeable":
        setNotChargeable(result.message);
        return;
      case "failed":
        setFailure({ message: result.message, canRetry: result.canRetry });
    }
  }

  if (started !== null) {
    return (
      <div role="status" className="flex max-w-lg flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-semibold">Cobro enviado a Nequi</p>
        <p>
          El cliente recibe una notificación en su app de Nequi para aceptar el pago de{" "}
          <strong>{totalLabel}</strong>. Mientras responde, la venta queda <strong>pendiente</strong>.
        </p>
        {started.transactionId !== "" && (
          <p>
            Transacción de Wompi:{" "}
            <span className="font-mono text-xs break-all">{started.transactionId}</span>
          </p>
        )}
        <Link
          href={`/ventas/${saleId}`}
          className="bg-primary self-start rounded-md px-4 py-2 font-medium text-white"
        >
          Ver la venta
        </Link>
      </div>
    );
  }

  if (notChargeable !== null) {
    return (
      <div role="alert" className="flex max-w-lg flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-medium">{notChargeable}</p>
        <Link href={`/ventas/${saleId}`} className="font-medium underline underline-offset-2">
          Ver el estado de la venta
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
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
          autoComplete="off"
          value={values.customerEmail}
          onChange={(event) => set("customerEmail", event.target.value)}
          aria-invalid={issues.customerEmail !== undefined}
          aria-describedby={issues.customerEmail ? `${ids.customerEmail}-error` : undefined}
          aria-required
          placeholder="cliente@correo.com"
          className={INPUT_CLASS}
        />
      </Field>

      <Field id={ids.phoneNumber} label="Número de Nequi" error={issues.phoneNumber}>
        <input
          id={ids.phoneNumber}
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={values.phoneNumber}
          onChange={(event) => set("phoneNumber", event.target.value)}
          aria-invalid={issues.phoneNumber !== undefined}
          aria-describedby={
            [`${ids.phoneNumber}-hint`, issues.phoneNumber ? `${ids.phoneNumber}-error` : ""]
              .filter(Boolean)
              .join(" ")
          }
          aria-required
          placeholder="3001234567"
          className={INPUT_CLASS}
        />
        <div id={`${ids.phoneNumber}-hint`} className="text-muted flex flex-wrap items-center gap-2 text-xs">
          <span>Números de prueba del sandbox:</span>
          {SANDBOX_NUMBERS.map((sandbox) => (
            <button
              key={sandbox.phoneNumber}
              type="button"
              onClick={() => set("phoneNumber", sandbox.phoneNumber)}
              className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono hover:bg-slate-100"
            >
              {sandbox.phoneNumber} <span className="font-sans">({sandbox.label})</span>
            </button>
          ))}
        </div>
      </Field>

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
            ? "Enviando a Nequi…"
            : failure?.canRetry
              ? `Reintentar cobro de ${totalLabel}`
              : `Cobrar ${totalLabel} con Nequi`}
        </button>
      </div>
    </form>
  );
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
