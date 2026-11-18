"use client";

import { useCallback, useContext } from "react";

import { notifyDataChanged } from "@/shared/presentation/data-changes";
import { loadStateOf, useResource, type LoadState, type Resource } from "@/shared/presentation/store";

import type { SalesHistory } from "../application/list-sales-history.use-case";
import type { TodaySales } from "../application/list-today-sales.use-case";
import { salesContainer } from "../di/container";
import { NewSaleContext, type NewSaleContextValue } from "./new-sale-context";
import { salesHistoryResource, todaySalesResource } from "./sales-store";

export type SalesView<T> = LoadState<T> & { readonly reload: () => void };

/** What the screen needs; what it does not ask for is not loaded. */
export interface SalesOptions {
  /** The sales of the day of the user. */
  readonly today?: boolean;
  /** Every sale and the sellers (admin). */
  readonly history?: boolean;
}

export interface SalesFacade {
  readonly today: SalesView<TodaySales>;
  readonly history: SalesView<SalesHistory>;
  /** The sale being put together. Only inside <NewSaleProvider>. */
  readonly cart: NewSaleContextValue;
  /** Cancels a pending sale; the stock comes back. Rejects with SaleNotCancellableError (409). */
  readonly cancelSale: (input: { readonly id: string; readonly isAwaitingPayment: boolean }) => Promise<void>;
}

/**
 * The facade of sales: the only way components read or change sales. The
 * lists come from the sales store and are asked again each time a screen that
 * needs them opens; every change marks the stores of sales and products stale
 * (a sale moves the stock).
 */
export function useSales(options: SalesOptions = {}): SalesFacade {
  const today = useView(todaySalesResource, options.today === true);
  const history = useView(salesHistoryResource, options.history === true);
  const cart = useContext(NewSaleContext);

  const cancelSale = useCallback(async (input: { readonly id: string; readonly isAwaitingPayment: boolean }) => {
    try {
      await salesContainer().cancelSale.execute(input);
    } finally {
      // Even a 409 means the sale changed under us.
      notifyDataChanged("sales", "products");
    }
  }, []);

  return {
    today,
    history,
    cancelSale,
    get cart() {
      if (cart === null) throw new Error("useSales().cart must be used inside <NewSaleProvider>.");
      return cart;
    },
  };
}

function useView<T>(resource: Resource<T>, isWanted: boolean): SalesView<T> {
  const state = loadStateOf(useResource(resource, isWanted ? "fresh" : "none"));
  const reload = useCallback(() => void resource.reload(), [resource]);
  return { ...state, reload };
}
