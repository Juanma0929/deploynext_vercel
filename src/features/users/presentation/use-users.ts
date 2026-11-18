"use client";

import { useContext } from "react";

import { UsersContext, type UsersContextValue } from "./users-context";

/** The facade of users: the list and the actions of the admin. */
export function useUsers(): UsersContextValue {
  const value = useContext(UsersContext);
  if (value === null) throw new Error("useUsers must be used inside <UsersProvider>.");
  return value;
}
