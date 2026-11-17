import { describe, expect, it } from "vitest";

import { DomainError } from "./app-error";
import { isRole, toRole } from "./role";

describe("toRole", () => {
  it("accepts the two roles of the API", () => {
    expect(toRole("admin")).toBe("admin");
    expect(toRole("seller")).toBe("seller");
  });

  it("rejects anything else, so a bad answer fails at the mapper", () => {
    expect(() => toRole("manager")).toThrow(DomainError);
    expect(() => toRole(undefined)).toThrow(DomainError);
  });
});

describe("isRole", () => {
  it("narrows a value read from the API", () => {
    expect(isRole("seller")).toBe(true);
    expect(isRole("")).toBe(false);
  });
});
