"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Alert, Button, Modal, ModalActions } from "@/shared/presentation/ui";

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
      <Button variant="danger-outline" onClick={open}>
        Eliminar
      </Button>

      <Modal open={isOpen} title="¿Eliminar este proveedor?" onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <p>
            Vas a eliminar a <span className="font-medium">{supplierName}</span>. Esta acción no se
            puede deshacer.
          </p>

          {failure?.kind === "has-products" && (
            <Alert tone="warning">
              <p className="font-medium">{failure.message}</p>
              <p>
                Para eliminarlo, primero asigna esos productos a otro proveedor o elimínalos.{" "}
                <a
                  href={`#${SUPPLIER_PRODUCTS_ANCHOR}`}
                  onClick={() => setIsOpen(false)}
                  className="font-medium underline underline-offset-2"
                >
                  Ver sus productos
                </a>
              </p>
            </Alert>
          )}

          {failure?.kind === "other" && (
            <Alert tone="danger">
              <p>{failure.message}</p>
            </Alert>
          )}

          <ModalActions>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              {failure?.kind === "has-products" ? "Cerrar" : "Cancelar"}
            </Button>
            {failure?.kind !== "has-products" && (
              <Button variant="danger" onClick={confirm} isLoading={isDeleting} loadingText="Eliminando…">
                Eliminar proveedor
              </Button>
            )}
          </ModalActions>
        </div>
      </Modal>
    </>
  );
}
