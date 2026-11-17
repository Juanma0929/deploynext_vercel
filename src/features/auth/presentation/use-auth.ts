"use client";

import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "./auth-context";

/** The facade of auth: the session state and the login action. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}
