import { expect, type Page } from "@playwright/test";

export interface Account {
  readonly email: string;
  readonly password: string;
}

/**
 * The accounts the suite logs in with.
 *
 * They are read from the environment and never written here: the statement
 * asks for no credentials in the repository, and these are real accounts of a
 * deployed API. `.env.example` documents the four variables.
 */
function account(role: "ADMIN" | "SELLER"): Account {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];

  if (email === undefined || password === undefined) {
    throw new Error(
      `Faltan E2E_${role}_EMAIL y E2E_${role}_PASSWORD. Ver .env.example.`,
    );
  }

  return { email, password };
}

export const admin = (): Account => account("ADMIN");
export const seller = (): Account => account("SELLER");

/**
 * Logs in through the interface, the same way a person would, and waits until
 * the protected area has rendered. Every test calls it, which is what keeps
 * them independent: none depends on a session another test left behind.
 */
export async function logIn(page: Page, who: Account): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(who.email);
  await page.getByLabel("Contraseña").fill(who.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
}
