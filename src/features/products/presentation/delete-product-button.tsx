"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Dialog } from "@/shared/presentation/dialog";

import { productsContainer } from "../di/container";
import { ProductHasSalesError, ProductNotFoundError } from "../domain/errors";
import { Product, type ProductProps } from "../domain/product";
import { DELETED_PRODUCT_PARAM, INVENTORY_PATH } from "./inventory-search-params";

type Step =
  | { readonly kind: "confirm" }
  /** The API answered 409: the product was sold, so it can only be deactivated. */
  | { readonly kind: "has-sales"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

interface DeleteProductButtonProps {
  /** The product as plain data, from the page rendered on the server. */
  readonly product: ProductProps;
}

/**
 * "Eliminar", with a confirmation first; deleting cannot be undone. If the
 * product was already sold the API refuses (409), and the same modal offers
 * to deactivate it instead: it leaves the inventory for sale but keeps the
 * history of its sales.
 */
export function DeleteProductButton({ product }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "confirm" });

  function open() {
    setStep({ kind: "confirm" });
    setIsOpen(true);
  }

  function goToInventory() {
    const params = new URLSearchParams({ [DELETED_PRODUCT_PARAM]: product.name });
    router.replace(`${INVENTORY_PATH}?${params.toString()}`);
    router.refresh();
  }

  async function remove() {
    setIsWorking(true);
    try {
      await productsContainer().deleteProduct.execute(product.id);
      goToInventory();
      return;
    } catch (error: unknown) {
      if (error instanceof ProductNotFoundError) {
        // Someone else deleted it already: the outcome the user wanted.
        goToInventory();
        return;
      }
      setStep(
        error instanceof ProductHasSalesError
          ? { kind: "has-sales", message: error.message }
          : { kind: "error", message: errorMessage(error) },
      );
    }
    setIsWorking(false);
  }

  async function deactivateInstead() {
    setIsWorking(true);
    try {
      await productsContainer().setProductActive.execute(new Product(product), false);
      setIsOpen(false);
      // The detail, rendered on the server, now shows the product as inactive.
      router.refresh();
    } catch (error: unknown) {
      setStep({ kind: "error", message: errorMessage(error) });
    }
    setIsWorking(false);
  }

  const title = step.kind === "has-sales" ? "No se puede eliminar" : "¿Eliminar este producto?";

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Eliminar
      </button>

      <Dialog open={isOpen} title={title} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-4 text-sm">
          {step.kind === "has-sales" ? (
            <div role="alert" className="flex flex-col gap-2">
              <p className="font-medium">{step.message}</p>
              {product.isActive ? (
                <p>
                  Las ventas de <span className="font-medium">{product.name}</span> lo siguen
                  usando en su historial. Puedes desactivarlo: queda en el inventario, pero ya no se
                  podrá vender.
                </p>
              ) : (
                <p>
                  Ya está inactivo, así que no se puede vender. Se queda en el inventario para que
                  sus ventas conserven su historial.
                </p>
              )}
            </div>
          ) : (
            <p>
              Vas a eliminar <span className="font-medium">{product.name}</span>. Esta acción no se
              puede deshacer.
            </p>
          )}

          {step.kind === "error" && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-red-700">
              {step.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              {step.kind === "has-sales" ? "Cerrar" : "Cancelar"}
            </button>
            {step.kind === "has-sales" ? (
              product.isActive && (
                <button
                  type="button"
                  onClick={deactivateInstead}
                  disabled={isWorking}
                  className="bg-primary rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
                >
                  {isWorking ? "Desactivando…" : "Desactivar en su lugar"}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={remove}
                disabled={isWorking}
                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isWorking ? "Eliminando…" : "Eliminar producto"}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
