import { expect, type Page } from "@playwright/test";

export type SeedRole = "admin" | "seller";

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

function prefixOf(role: SeedRole): string {
  return role === "admin" ? "E2E_ADMIN" : "E2E_SELLER";
}

/** The email of a seed user; the default is the one of the .env.example of the API. */
export function emailOf(role: SeedRole): string {
  return process.env[`${prefixOf(role)}_EMAIL`] ?? `${role}@stockpyme.com`;
}

/** The users of the API seed. The passwords come from the environment, never from the repo. */
export function credentialsOf(role: SeedRole): Credentials {
  const prefix = prefixOf(role);
  const email = emailOf(role);
  const password = process.env[`${prefix}_PASSWORD`];
  if (password === undefined || password === "") {
    throw new Error(
      `Falta ${prefix}_PASSWORD: copia .env.e2e.example a .env.e2e.local y escribe las contraseñas del seed.`,
    );
  }
  return { email, password };
}

/** The labels of the role in the sidebar, as ROLE_LABELS shows them. */
const ROLE_LABEL: Readonly<Record<SeedRole, RegExp>> = {
  admin: /administrador/i,
  seller: /vendedor/i,
};

export async function fillLogin(page: Page, { email, password }: Credentials): Promise<void> {
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/** Logs in through the form, as a person would, and waits for the home page. */
export async function loginAs(page: Page, role: SeedRole): Promise<void> {
  await page.goto("/login");
  await fillLogin(page, credentialsOf(role));
  await expect(page).toHaveURL(/\/$/);
  // The sidebar is rendered twice (desktop and the closed mobile drawer): only the visible one.
  await expect(page.getByTestId("current-user").filter({ visible: true })).toContainText(ROLE_LABEL[role]);
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
}

/** The main navigation of the sidebar. */
export function mainNav(page: Page) {
  return page.getByRole("navigation", { name: "Principal" });
}
