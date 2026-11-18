"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { paginate } from "@/shared/domain/collections";
import {
  Alert,
  Badge,
  ButtonLink,
  EmptyState,
  Field,
  LoadingText,
  MissingValue,
  PageHeader,
  Pagination,
  RetryAlert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@/shared/presentation/ui";

import type { Supplier } from "../domain/supplier";
import { searchSuppliers } from "../domain/supplier-filters";
import { useSuppliers } from "./use-suppliers";

const PAGE_SIZE = 10;
const NO_SUPPLIERS: readonly Supplier[] = [];

interface SuppliersScreenProps {
  /**
   * Whether the role may create, edit or delete suppliers. The route reads it
   * from the permission matrix of auth (suppliers:write); a seller gets false
   * and sees the list read-only.
   */
  readonly canManage: boolean;
  /** The name of a supplier just deleted, to confirm it above the list. */
  readonly deletedName?: string | undefined;
}

/**
 * The list of suppliers, for every role. It reads the cached catalog of the
 * suppliers store, so coming back to it does not ask the API again.
 */
export function SuppliersScreen({ canManage, deletedName }: SuppliersScreenProps) {
  const { list, reload } = useSuppliers();
  const [notice, setNotice] = useState(
    deletedName !== undefined && deletedName !== "" ? `Se eliminó el proveedor ${deletedName}.` : null,
  );
  const searchId = useId();
  const [term, setTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const suppliers = list.status === "ready" ? list.suppliers : NO_SUPPLIERS;
  const page = useMemo(
    () => paginate(searchSuppliers(suppliers, term), pageNumber, PAGE_SIZE),
    [suppliers, term, pageNumber],
  );

  return (
    <section aria-labelledby="suppliers-title" className="flex flex-col gap-6">
      <PageHeader
        titleId="suppliers-title"
        title="Proveedores"
        description={
          canManage
            ? "Las empresas que te surten productos."
            : "Consulta los datos de contacto de los proveedores. Solo un administrador puede modificarlos."
        }
        actions={
          canManage ? (
            <ButtonLink href="/proveedores/nuevo">Nuevo proveedor</ButtonLink>
          ) : (
            <Badge tone="neutral" className="px-3 py-1">
              Solo lectura
            </Badge>
          )
        }
      />

      {notice !== null && (
        <Alert tone="success" onDismiss={() => setNotice(null)}>
          <p>{notice}</p>
        </Alert>
      )}

      <search className="sm:max-w-md">
        <Field id={searchId} label="Buscar">
          <TextInput
            id={searchId}
            type="search"
            placeholder="Nombre, contacto, correo o teléfono"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setPageNumber(1);
            }}
          />
        </Field>
      </search>

      {list.status === "loading" && <LoadingText>Cargando proveedores…</LoadingText>}

      {list.status === "error" && <RetryAlert message={list.message} onRetry={reload} />}

      {list.status === "ready" && (
        <>
          {page.items.length === 0 ? (
            <EmptyState>
              {suppliers.length === 0 ? "Todavía no hay proveedores registrados." : "Ningún proveedor coincide con la búsqueda."}
            </EmptyState>
          ) : (
            <Table caption="Proveedores">
              <TableHead>
                <TableHeaderCell>Proveedor</TableHeaderCell>
                <TableHeaderCell>Contacto</TableHeaderCell>
                <TableHeaderCell>Teléfono</TableHeaderCell>
                <TableHeaderCell>Correo</TableHeaderCell>
                <TableHeaderCell>Dirección</TableHeaderCell>
              </TableHead>
              <TableBody>
                {page.items.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      <Link href={`/proveedores/${supplier.id}`} className="text-primary hover:underline">
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>{supplier.contactName ?? <MissingValue />}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {supplier.phone !== null ? (
                        <a href={`tel:${supplier.phone.replace(/\s+/g, "")}`} className="hover:underline">
                          {supplier.phone}
                        </a>
                      ) : (
                        <MissingValue />
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.email !== null ? (
                        <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                          {supplier.email}
                        </a>
                      ) : (
                        <MissingValue />
                      )}
                    </TableCell>
                    <TableCell>{supplier.address ?? <MissingValue />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination page={page} onPageChange={setPageNumber} noun="proveedores" />
        </>
      )}
    </section>
  );
}
