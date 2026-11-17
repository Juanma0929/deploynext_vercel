import { describe, expect, it } from "vitest";

import { NetworkError, UnauthorizedError } from "@/shared/domain/app-error";

import { adminUser, FakeAuthRepository, InMemoryTokenStore } from "./auth.fakes";
import { GetCurrentUser } from "./get-current-user";

describe("GetCurrentUser", () => {
  it("answers null when there is no token, without asking the API", async () => {
    const repository = new FakeAuthRepository();

    await expect(
      new GetCurrentUser(repository, new InMemoryTokenStore()).execute(),
    ).resolves.toBeNull();
    expect(repository.calls.profile).toBe(0);
  });

  it("reads the user from the API, which is where the role comes from", async () => {
    const repository = new FakeAuthRepository({ user: adminUser });

    await expect(
      new GetCurrentUser(repository, new InMemoryTokenStore("jwt-123")).execute(),
    ).resolves.toBe(adminUser);
  });

  it("discards an expired token and reports no session", async () => {
    const store = new InMemoryTokenStore("jwt-vencido");
    const repository = new FakeAuthRepository({ profileFails: new UnauthorizedError() });

    await expect(new GetCurrentUser(repository, store).execute()).resolves.toBeNull();
    expect(await store.read()).toBeNull();
  });

  it("does not mistake a network failure for a logged-out user", async () => {
    const store = new InMemoryTokenStore("jwt-123");
    const repository = new FakeAuthRepository({ profileFails: new NetworkError() });

    await expect(new GetCurrentUser(repository, store).execute()).rejects.toBeInstanceOf(
      NetworkError,
    );
    // The session is still valid: the server was simply unreachable.
    expect(await store.read()).toBe("jwt-123");
  });
});
