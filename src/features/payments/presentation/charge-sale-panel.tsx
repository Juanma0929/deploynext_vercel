"use client";

import { useId, useState } from "react";

import { CardPaymentForm } from "./card-payment-form";
import { NequiPaymentForm } from "./nequi-payment-form";

type Method = "NEQUI" | "CARD";

const METHODS: ReadonlyArray<{ readonly value: Method; readonly label: string }> = [
  { value: "NEQUI", label: "Nequi" },
  { value: "CARD", label: "Tarjeta" },
];

interface ChargeSalePanelProps {
  readonly saleId: string;
  /** The total of the sale, already formatted ("$ 12.500"). */
  readonly totalLabel: string;
}

/**
 * The ways to charge a sale. Switching the method unmounts the other form, so
 * whatever was typed in the card form is gone with it.
 */
export function ChargeSalePanel({ saleId, totalLabel }: ChargeSalePanelProps) {
  const [method, setMethod] = useState<Method>("NEQUI");
  const name = useId();

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Método de pago</legend>
        <div className="flex gap-2">
          {METHODS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-medium ${
                method === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-300 bg-white hover:bg-slate-100"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {method === "NEQUI" ? (
        <NequiPaymentForm saleId={saleId} totalLabel={totalLabel} />
      ) : (
        <CardPaymentForm saleId={saleId} totalLabel={totalLabel} />
      )}
    </div>
  );
}
