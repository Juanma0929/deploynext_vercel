"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { onSessionReset } from "@/shared/presentation/session-reset";

import { salesContainer } from "../di/container";
import { SaleRejectedError } from "../domain/errors";
import { SaleDraft, type DraftAdjustment } from "../domain/sale-draft";
import type { SaleProduct } from "../domain/sale-product";

export type ProductsState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly products: readonly SaleProduct[] }
  | { readonly status: "error"; readonly message: string };

/** Why the last attempt to register the sale failed. */
export interface SubmitFailure {
  readonly message: string;
  /** Only after a refusal of the API: how the cart was brought up to date. */
  readonly adjustments: readonly DraftAdjustment[];
}

export type SubmitResult = { readonly ok: true; readonly saleId: string } | { readonly ok: false };

export interface NewSaleContextValue {
  readonly products: ProductsState;
  readonly draft: SaleDraft;
  readonly failure: SubmitFailure | null;
  readonly isSubmitting: boolean;
  readonly reloadProducts: () => void;
  /** Each returns the message to show when the domain refuses the change, or null. */
  readonly add: (product: SaleProduct) => string | null;
  readonly setQuantity: (productId: string, quantity: number) => string | null;
  readonly remove: (productId: string) => void;
  readonly submit: () => Promise<SubmitResult>;
  readonly dismissFailure: () => void;
}

export const NewSaleContext = createContext<NewSaleContextValue | null>(null);

/** The store of the sale being put together: the products on offer and the cart. */
export function NewSaleProvider({ children }: { readonly children: ReactNode }) {
  const [products, setProducts] = useState<ProductsState>({ status: "loading" });
  const [draft, setDraft] = useState<SaleDraft>(() => SaleDraft.empty());
  const [failure, setFailure] = useState<SubmitFailure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    salesContainer()
      .listSellableProducts.execute()
      .then((list) => {
        if (isCurrent) setProducts({ status: "ready", products: list });
      })
      .catch((error: unknown) => {
        if (isCurrent) setProducts({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  // A cart must never survive into the session of another user.
  useEffect(
    () =>
      onSessionReset(() => {
        setDraft(SaleDraft.empty());
        setProducts({ status: "loading" });
        setFailure(null);
      }),
    [],
  );

  const reloadProducts = useCallback(() => {
    setProducts({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  const change = useCallback(
    (next: () => SaleDraft): string | null => {
      try {
        setDraft(next());
        return null;
      } catch (error: unknown) {
        return errorMessage(error);
      }
    },
    [],
  );

  const add = useCallback((product: SaleProduct) => change(() => draft.add(product)), [change, draft]);

  const setQuantity = useCallback(
    (productId: string, quantity: number) => change(() => draft.setQuantity(productId, quantity)),
    [change, draft],
  );

  const remove = useCallback((productId: string) => setDraft((current) => current.remove(productId)), []);

  const submit = useCallback(async (): Promise<SubmitResult> => {
    const { createSale, listSellableProducts } = salesContainer();
    setIsSubmitting(true);
    setFailure(null);

    try {
      const sale = await createSale.execute(draft);
      return { ok: true, saleId: sale.id };
    } catch (error: unknown) {
      if (!(error instanceof SaleRejectedError)) {
        setFailure({ message: errorMessage(error), adjustments: [] });
        setIsSubmitting(false);
        return { ok: false };
      }

      // The stock changed under us: load the products again and fix the cart.
      try {
        const fresh = await listSellableProducts.execute();
        const { draft: reconciled, adjustments } = draft.reconcile(fresh);
        setProducts({ status: "ready", products: fresh });
        setDraft(reconciled);
        setFailure({ message: error.message, adjustments });
      } catch (reloadError: unknown) {
        setFailure({ message: `${error.message} ${errorMessage(reloadError)}`, adjustments: [] });
      }
      setIsSubmitting(false);
      return { ok: false };
    }
  }, [draft]);

  const dismissFailure = useCallback(() => setFailure(null), []);

  const value = useMemo<NewSaleContextValue>(
    () => ({
      products,
      draft,
      failure,
      isSubmitting,
      reloadProducts,
      add,
      setQuantity,
      remove,
      submit,
      dismissFailure,
    }),
    [products, draft, failure, isSubmitting, reloadProducts, add, setQuantity, remove, submit, dismissFailure],
  );

  return <NewSaleContext.Provider value={value}>{children}</NewSaleContext.Provider>;
}
