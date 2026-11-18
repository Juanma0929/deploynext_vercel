"use client";

import { useContext } from "react";

import { SuppliersContext, type SuppliersContextValue } from "./suppliers-context";

/** The facade of suppliers: the list and how to reload it. */
export function useSuppliers(): SuppliersContextValue {
  const value = useContext(SuppliersContext);
  if (value === null) throw new Error("useSuppliers must be used inside <SuppliersProvider>.");
  return value;
}
