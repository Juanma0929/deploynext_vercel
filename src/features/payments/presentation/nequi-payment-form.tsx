"use client";

import { useId, useState, type FormEvent } from "react";

import { Alert, Button, ButtonLink, Field, TextInput, describedBy } from "@/shared/presentation/ui";

import {
  nequiPaymentIssues,
  type NequiPaymentField,
  type NequiPaymentValues,
  type PaymentIssues,
} from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";
import { ChargeStarted, NotChargeable } from "./payment-outcome";
import { SandboxOptions } from "./sandbox-options";
import { useChargeWithNequi } from "./use-charge-with-nequi";

/** The numbers of the Wompi sandbox: the result does not depend on any phone. */
const SANDBOX_NUMBERS = [
  { value: "3991111111", display: "3991111111", outcome: "aprueba" },
  { value: "3992222222", display: "3992222222", outcome: "rechaza" },
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
      <ChargeStarted saleId={saleId} transactionId={started.transactionId} title="Cobro enviado a Nequi">
        <p>
          El cliente recibe una notificación en su app de Nequi para aceptar el pago de{" "}
          <strong>{totalLabel}</strong>. Mientras responde, la venta queda <strong>pendiente</strong>.
        </p>
      </ChargeStarted>
    );
  }

  if (notChargeable !== null) return <NotChargeable saleId={saleId} message={notChargeable} />;

  const sandboxHint = (
    <SandboxOptions
      title="Números de prueba del sandbox:"
      options={SANDBOX_NUMBERS}
      onPick={(phoneNumber) => set("phoneNumber", phoneNumber)}
    />
  );

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      {failure !== null && (
        <Alert tone="danger">
          <p>{failure.message}</p>
        </Alert>
      )}

      <Field id={ids.customerEmail} label="Correo del cliente" error={issues.customerEmail} required>
        <TextInput
          id={ids.customerEmail}
          name="customerEmail"
          type="email"
          autoComplete="off"
          value={values.customerEmail}
          onChange={(event) => set("customerEmail", event.target.value)}
          invalid={issues.customerEmail !== undefined}
          aria-describedby={describedBy(ids.customerEmail, { error: issues.customerEmail })}
          aria-required
          placeholder="cliente@correo.com"
        />
      </Field>

      <Field id={ids.phoneNumber} label="Número de Nequi" error={issues.phoneNumber} hint={sandboxHint} required>
        <TextInput
          id={ids.phoneNumber}
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={values.phoneNumber}
          onChange={(event) => set("phoneNumber", event.target.value)}
          invalid={issues.phoneNumber !== undefined}
          aria-describedby={describedBy(ids.phoneNumber, { hint: true, error: issues.phoneNumber })}
          aria-required
          placeholder="3001234567"
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href={`/ventas/${saleId}`} variant="secondary">
          Volver
        </ButtonLink>
        <Button type="submit" isLoading={isSending} loadingText="Enviando a Nequi…">
          {failure?.canRetry ? `Reintentar cobro de ${totalLabel}` : `Cobrar ${totalLabel} con Nequi`}
        </Button>
      </div>
    </form>
  );
}
