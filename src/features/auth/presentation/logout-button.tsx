"use client";

import { Button } from "@/shared/presentation";

import { useAuth } from "./use-auth";

/** Ends the session everywhere and clears it from this device. */
export function LogoutButton() {
  const { logout, isWorking } = useAuth();

  return (
    <Button variant="secondary" size="sm" onClick={() => void logout()} isLoading={isWorking}>
      Cerrar sesión
    </Button>
  );
}
