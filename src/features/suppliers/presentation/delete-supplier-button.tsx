"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Dialog } from "@/shared/presentation/dialog";

import { suppliersContainer } from "../di/container";
import { SupplierHasProductsError, SupplierNotFoundError } from "../domain/errors";
import { DELETED_SUPPLIER_PARAM, SUPPLIER_PRODUCTS_ANCHOR } from "./supplier-anchors";

type Failure =
  | { readonly kind: "has-products"; readonly message: string }
  | { readonly kind: "other"; readonly message: string };

interface DeleteSupplierButtonProps {
  readonly supplierId: string;
  readonly supplierName: string;
}

/** "Eliminar", with a confirmation first. Deleting cannot be undone. */
export function DeleteSupplierButton({ supplierId, supplierName }: DeleteSupplierButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  function open() {
    setFailure(null);
    setIsOpen(true);
  }

  function goToList() {
    const params = new URLSearchParams({ [DELETED_SUPPLIER_PARAM]: supplierName });
    router.replace(`/proveedores?${params.toString()}`);
    router.refresh();
  }

  async function confirm() {
    setIsDeleting(true);
    setFailure(null);
    try {
      await suppliersContainer().deleteSupplier.execute(supplierId);
      goToList();
      return;
    } catch (error: unknown) {
      if (error instanceof SupplierNotFoundError) {
        // Someone else deleted it already: the outcome the user wanted.
        goToList();
        return;
      }
      setFailure(
        error instanceof SupplierHasProductsError
          ? { kind: "has-products", message: error.message }
          : { kind: "other", message: errorMessage(error) },
      );
    }
    setIsDeleting(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Eliminar
      </button>

      <Dialog open={isOpen} title="¿Eliminar este proveedor?" onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <p>
            Vas a eliminar a <span className="font-medium">{supplierName}</span>. Esta acción no se
            puede deshacer.
          </p>

          {failure?.kind === "has-products" && (
            <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
              <p className="font-medium">{failure.message}</p>
              <p className="mt-1">
                Para eliminarlo, primero asigna esos productos a otro proveedor o elimínalos.{" "}
                <a
                  href={`#${SUPPLIER_PRODUCTS_ANCHOR}`}
                  onClick={() => setIsOpen(false)}
                  className="font-medium underline underline-offset-2"
                >
                  Ver sus productos
                </a>
              </p>
            </div>
          )}

          {failure?.kind === "other" && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-red-700">
              {failure.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              {failure?.kind === "has-products" ? "Cerrar" : "Cancelar"}
            </button>
            {failure?.kind !== "has-products" && (
              <button
                type="button"
                onClick={confirm}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Eliminando…" : "Eliminar proveedor"}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
