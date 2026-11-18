"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { productsContainer } from "../di/container";
import { Product, type ProductProps } from "../domain/product";
import { InvalidProductError } from "../domain/product-input";

export interface ProductQuickActions {
  readonly isWorking: boolean;
  /** The last failure, already written for the user, or null. */
  readonly error: string | null;
  /** The message of the stock field when the number breaks the rule. */
  readonly stockIssue: string | null;
  /** Resolves true when the stock was saved (or did not change). */
  readonly adjustStock: (newStock: string) => Promise<boolean>;
  /** Resolves true when the product was activated or deactivated. */
  readonly toggleActive: () => Promise<boolean>;
}

/**
 * The facade of the quick actions of a product. After each change the page is
 * refreshed, so the detail rendered on the server shows the saved product.
 */
export function useProductQuickActions(current: ProductProps): ProductQuickActions {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockIssue, setStockIssue] = useState<string | null>(null);

  const adjustStock = useCallback(
    async (newStock: string) => {
      setError(null);
      setStockIssue(null);
      setIsWorking(true);
      try {
        await productsContainer().adjustStock.execute(new Product(current), newStock);
        router.refresh();
        return true;
      } catch (cause: unknown) {
        if (cause instanceof InvalidProductError) {
          setStockIssue(cause.issues.currentStock ?? cause.message);
        } else {
          setError(errorMessage(cause));
        }
        return false;
      } finally {
        setIsWorking(false);
      }
    },
    [current, router],
  );

  const toggleActive = useCallback(async () => {
    setError(null);
    setIsWorking(true);
    try {
      await productsContainer().setProductActive.execute(new Product(current), !current.isActive);
      router.refresh();
      return true;
    } catch (cause: unknown) {
      setError(errorMessage(cause));
      return false;
    } finally {
      setIsWorking(false);
    }
  }, [current, router]);

  return { isWorking, error, stockIssue, adjustStock, toggleActive };
}
