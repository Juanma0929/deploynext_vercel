/**
 * Shared by Server and Client Components, so it lives outside any
 * "use client" file: importing a value from one of those into a Server
 * Component yields a client reference, not the value.
 */

/** The id of the products section of the detail, for the link of the 409. */
export const SUPPLIER_PRODUCTS_ANCHOR = "productos-del-proveedor";

/** The query param the list reads to confirm what was deleted. */
export const DELETED_SUPPLIER_PARAM = "eliminado";
