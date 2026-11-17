"use client";

import { useAuth } from "./use-auth";

/** Ends the session everywhere and clears it from this device. */
export function LogoutButton() {
  const { logout, isWorking } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={isWorking}
      className="border-border hover:bg-background rounded-md border px-3 py-1.5 text-sm disabled:opacity-60"
    >
      Cerrar sesión
    </button>
  );
}
