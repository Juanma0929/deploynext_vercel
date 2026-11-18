"use client";

import { useEffect, useState } from "react";

import { productsContainer } from "../di/container";

/**
 * How many products are in low stock, or null while it loads or if it failed.
 * A failure is not shown: the alert is a hint, and the home page has to work
 * without it.
 */
export function useLowStockCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isCurrent = true;

    productsContainer()
      .countLowStock.execute()
      .then((value) => {
        if (isCurrent) setCount(value);
      })
      .catch(() => {
        if (isCurrent) setCount(null);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return count;
}
