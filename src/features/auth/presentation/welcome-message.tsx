"use client";

import { useAuth } from "./use-auth";

export function WelcomeMessage() {
  const { state } = useAuth();
  const name = state.status === "authenticated" ? state.user.name : "";

  return <h1 className="text-2xl font-semibold">Hola, {name}</h1>;
}
