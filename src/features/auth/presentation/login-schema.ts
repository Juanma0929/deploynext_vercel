import { z } from "zod";

import { TWO_FACTOR_CODE_PATTERN } from "../domain/credentials";

/** The first step of the login form. */
export const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email("Ingresa un correo válido.")),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

/** The second step, only for accounts with two-factor authentication. */
export const twoFactorCodeSchema = z
  .string()
  .regex(TWO_FACTOR_CODE_PATTERN, "El código debe tener exactamente 6 dígitos.");

export type CredentialsInput = z.infer<typeof credentialsSchema>;
