import { z } from "zod";

import { ROLES } from "@/shared/domain/role";

import { PASSWORD_MIN_LENGTH } from "../domain/user-input";

const name = z.string().trim().min(1, "El nombre es obligatorio.");
const role = z.enum(ROLES, "Elige un rol.");
const passwordMessage = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;

export const createUserSchema = z.object({
  name,
  email: z.string().trim().pipe(z.email("Ingresa un correo válido.")),
  password: z.string().min(PASSWORD_MIN_LENGTH, passwordMessage),
  role,
});

/** Editing: the password is optional (empty keeps the current one) and there is no email. */
export const editUserSchema = z.object({
  name,
  password: z.union([z.literal(""), z.string().min(PASSWORD_MIN_LENGTH, passwordMessage)]),
  role,
  isActive: z.boolean(),
});

export type UserFormField = "name" | "email" | "password" | "role";
