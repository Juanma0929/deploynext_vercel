import { describe, expect, it } from "vitest";

import { DomainError, UnauthorizedError } from "@/shared/domain/app-error";

import { FakeAuthRepository, InMemoryTokenStore, sellerUser } from "./auth.fakes";
import { LoginUser } from "./login-user";

describe("LoginUser", () => {
  it("stores the token before reading the profile, which needs it", async () => {
    const repository = new FakeAuthRepository({ token: "jwt-abc", user: sellerUser });
    const store = new InMemoryTokenStore();

    const user = await new LoginUser(repository, store).execute({
      email: "seller@stockpyme.com",
      password: "Seller12345",
    });

    expect(user).toBe(sellerUser);
    expect(await store.read()).toBe("jwt-abc");
    expect(repository.calls.profile).toBe(1);
  });

  it("normalises the email, so spaces and capitals do not block a login", async () => {
    const repository = new FakeAuthRepository();

    await new LoginUser(repository, new InMemoryTokenStore()).execute({
      email: "  ADMIN@stockpyme.com ",
      password: "Admin12345",
    });

    expect(repository.calls.login[0]?.email).toBe("admin@stockpyme.com");
  });

  it("sends the two-factor code only when there is one", async () => {
    const repository = new FakeAuthRepository();
    const login = new LoginUser(repository, new InMemoryTokenStore());

    await login.execute({ email: "a@b.co", password: "x", twoFactorCode: "123456" });
    await login.execute({ email: "a@b.co", password: "x", twoFactorCode: "" });

    expect(repository.calls.login[0]?.twoFactorCode).toBe("123456");
    expect(repository.calls.login[1]?.twoFactorCode).toBeUndefined();
  });

  it("rejects an invalid email without spending a request", async () => {
    const repository = new FakeAuthRepository();

    await expect(
      new LoginUser(repository, new InMemoryTokenStore()).execute({
        email: "no-es-un-correo",
        password: "Admin12345",
      }),
    ).rejects.toBeInstanceOf(DomainError);
    expect(repository.calls.login).toHaveLength(0);
  });

  it("leaves no session behind when the credentials are wrong", async () => {
    const store = new InMemoryTokenStore();
    const repository = new FakeAuthRepository({ loginFails: new UnauthorizedError() });

    await expect(
      new LoginUser(repository, store).execute({ email: "a@b.co", password: "mala" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(await store.read()).toBeNull();
  });

  it("throws away the token when the profile cannot be read", async () => {
    const store = new InMemoryTokenStore();
    const repository = new FakeAuthRepository({ profileFails: new UnauthorizedError() });

    await expect(
      new LoginUser(repository, store).execute({ email: "a@b.co", password: "x" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    // A half-open session is worse than none: the cookie would keep the user
    // logged in with no user behind it.
    expect(await store.read()).toBeNull();
  });

  it("does not accept an empty token as a session", async () => {
    const repository = new FakeAuthRepository({ token: "   " });

    await expect(
      new LoginUser(repository, new InMemoryTokenStore()).execute({
        email: "a@b.co",
        password: "x",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
