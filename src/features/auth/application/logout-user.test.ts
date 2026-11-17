import { describe, expect, it } from "vitest";

import { NetworkError } from "@/shared/domain/app-error";

import { FakeAuthRepository, InMemoryTokenStore } from "./auth.fakes";
import { LogoutUser } from "./logout-user";

describe("LogoutUser", () => {
  it("invalidates the session on the server and clears it locally", async () => {
    const repository = new FakeAuthRepository();
    const store = new InMemoryTokenStore("jwt-123");

    await new LogoutUser(repository, store).execute();

    expect(repository.calls.logout).toBe(1);
    expect(await store.read()).toBeNull();
  });

  it("clears the local session even when the request fails", async () => {
    const store = new InMemoryTokenStore("jwt-123");
    const repository = new FakeAuthRepository({ logoutFails: new NetworkError() });

    await expect(new LogoutUser(repository, store).execute()).rejects.toBeInstanceOf(
      NetworkError,
    );
    // The user asked to leave: the token cannot stay on the device just because
    // the network was down.
    expect(await store.read()).toBeNull();
  });
});
