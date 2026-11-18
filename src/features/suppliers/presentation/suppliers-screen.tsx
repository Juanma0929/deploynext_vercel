"use client";

import { useId, useMemo, useState } from "react";

import { paginate } from "@/shared/domain/collections";
import { Pagination } from "@/shared/presentation/pagination";

import type { Supplier } from "../domain/supplier";
import { searchSuppliers } from "../domain/supplier-filters";
import { SuppliersProvider } from "./suppliers-context";
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
}

/** The list of suppliers, for every role. */
export function SuppliersScreen({ canManage }: SuppliersScreenProps) {
  return (
    <SuppliersProvider>
      <SuppliersList canManage={canManage} />
    </SuppliersProvider>
  );
}

function SuppliersList({ canManage }: SuppliersScreenProps) {
  const { list, reload } = useSuppliers();
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="suppliers-title" className="text-2xl font-semibold">
            Proveedores
          </h1>
          <p className="text-muted text-sm">
            {canManage
              ? "Las empresas que te surten productos."
              : "Consulta los datos de contacto de los proveedores. Solo un administrador puede modificarlos."}
          </p>
        </div>
        {!canManage && (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
            Solo lectura
          </span>
        )}
      </header>

      <search className="flex flex-col gap-1 sm:max-w-md">
        <label htmlFor={searchId} className="text-xs font-medium">
          Buscar
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Nombre, contacto, correo o teléfono"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setPageNumber(1);
          }}
          className="focus:border-primary focus:ring-primary/20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </search>

      {list.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando proveedores…
        </p>
      )}

      {list.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{list.message}</p>
          <button type="button" onClick={reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {list.status === "ready" && (
        <>
          {page.items.length === 0 ? (
            <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
              {suppliers.length === 0
                ? "Todavía no hay proveedores registrados."
                : "Ningún proveedor coincide con la búsqueda."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Proveedor</th>
                    <th scope="col" className="px-4 py-3 font-medium">Contacto</th>
                    <th scope="col" className="px-4 py-3 font-medium">Teléfono</th>
                    <th scope="col" className="px-4 py-3 font-medium">Correo</th>
                    <th scope="col" className="px-4 py-3 font-medium">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page.items.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-4 py-3 font-medium">{supplier.name}</td>
                      <td className="px-4 py-3">{supplier.contactName ?? <Missing />}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {supplier.phone !== null ? (
                          <a href={`tel:${supplier.phone.replace(/\s+/g, "")}`} className="hover:underline">
                            {supplier.phone}
                          </a>
                        ) : (
                          <Missing />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {supplier.email !== null ? (
                          <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                            {supplier.email}
                          </a>
                        ) : (
                          <Missing />
                        )}
                      </td>
                      <td className="px-4 py-3">{supplier.address ?? <Missing />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} onPageChange={setPageNumber} noun="proveedores" />
        </>
      )}
    </section>
  );
}

function Missing() {
  return (
    <span className="text-slate-400" aria-label="Sin dato">
      —
    </span>
  );
}
