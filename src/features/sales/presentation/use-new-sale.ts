"use client";

import { useContext } from "react";

import { NewSaleContext, type NewSaleContextValue } from "./new-sale-context";

/** The facade of the sale being put together: the cart and its actions. */
export function useNewSale(): NewSaleContextValue {
  const value = useContext(NewSaleContext);
  if (value === null) throw new Error("useNewSale must be used inside <NewSaleProvider>.");
  return value;
}
