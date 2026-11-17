import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/app-error";

import { AuthenticatedUser } from "./authenticated-user";

const valid = {
  id: "u-1",
  name: "Ana Admin",
  email: "admin@stockpyme.com",
  role: "admin",
  isActive: true,
  isTwoFactorEnabled: false,
} as const;

describe("AuthenticatedUser", () => {
  it("cannot be built without an identifier", () => {
    expect(() => new AuthenticatedUser({ ...valid, id: "  " })).toThrow(DomainError);
  });

  it("cannot be built for a deactivated account", () => {
    // Users are deactivated instead of deleted, so this is a real case and not
    // a hypothetical one.
    expect(() => new AuthenticatedUser({ ...valid, isActive: false })).toThrow(
      "La cuenta está desactivada.",
    );
  });

  it("falls back to the email when the name is empty", () => {
    expect(new AuthenticatedUser({ ...valid, name: "   " }).name).toBe(
      "admin@stockpyme.com",
    );
  });

  it("answers which roles it holds", () => {
    const admin = new AuthenticatedUser(valid);
    const seller = new AuthenticatedUser({ ...valid, role: "seller" });

    expect(admin.isAdmin()).toBe(true);
    expect(seller.isAdmin()).toBe(false);
    expect(seller.hasAnyRole(["admin", "seller"])).toBe(true);
    expect(seller.hasAnyRole(["admin"])).toBe(false);
  });

  it("survives the trip to a Client Component as a snapshot", () => {
    const user = new AuthenticatedUser(valid);

    expect(AuthenticatedUser.fromSnapshot(user.toSnapshot())).toEqual(user);
  });
});
