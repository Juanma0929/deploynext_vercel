import { z } from "zod";

/** Only the name is required; the email, if written, must be valid. */
export const supplierSchema = z.object({
  name: z.string().trim().min(1, "El nombre del proveedor es obligatorio."),
  contactName: z.string(),
  phone: z.string(),
  email: z.union([z.string().trim().length(0), z.string().trim().pipe(z.email("Ingresa un correo válido."))]),
  address: z.string(),
});

export type SupplierFormField = keyof z.infer<typeof supplierSchema>;
