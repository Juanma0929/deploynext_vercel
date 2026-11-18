import type { Metadata } from "next";

import { SuppliersRoute } from "./suppliers-route";

export const metadata: Metadata = {
  title: "Proveedores",
};

/** Every role may read it (suppliers:read); only an admin may change it (suppliers:write). */
export default function SuppliersPage() {
  return <SuppliersRoute />;
}
