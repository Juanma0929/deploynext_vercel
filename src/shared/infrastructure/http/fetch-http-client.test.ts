import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/domain/app-error";

import { FetchHttpClient } from "./fetch-http-client";
import type { TokenStorage } from "./token-storage";

function storage(token: string | null): TokenStorage {
  return {
    read: async () => token,
    save: async () => {},
    clear: async () => {},
  };
}

function answer(status: number, body: unknown = {}): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function client(token: string | null = "jwt-123"): FetchHttpClient {
  return new FetchHttpClient("https://api.test", storage(token));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the interceptor", () => {
  it("attaches the token as a Bearer header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await client().get("/products");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/products");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jwt-123");
  });

  it("sends no Authorization header when there is no session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    await client(null).get("/health");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("drops the query parameters that carry no value", async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    await client().get("/products", { query: { category: "aseo", supplierId: undefined } });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("https://api.test/products?category=aseo");
  });
});

describe("the translation of the status code", () => {
  const cases: ReadonlyArray<[number, new (...args: never[]) => Error]> = [
    [400, ValidationError],
    [401, UnauthorizedError],
    [403, ForbiddenError],
    [409, ConflictError],
  ];

  for (const [status, expected] of cases) {
    it(`turns a ${status} into a ${expected.name}`, async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answer(status, { message: "nope" })));

      await expect(client().get("/products")).rejects.toBeInstanceOf(expected);
    });
  }

  it("keeps the message the API sends, so the form can show it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(answer(409, { message: "El proveedor tiene productos." })),
    );

    await expect(client().delete("/suppliers/1")).rejects.toThrow(
      "El proveedor tiene productos.",
    );
  });

  it("joins the list of field errors a 400 reports", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(answer(400, { message: ["price must be an integer", "name is required"] })),
    );

    await expect(client().post("/products", {})).rejects.toMatchObject({
      details: ["price must be an integer name is required"],
    });
  });

  it("reports a request that never reached the server as a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(client().get("/products")).rejects.toBeInstanceOf(NetworkError);
  });
});

describe("the body of the answer", () => {
  it("returns the parsed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answer(200, { id: 7, name: "Jabón" })));

    await expect(client().get("/products/7")).resolves.toEqual({ id: 7, name: "Jabón" });
  });

  it("accepts an empty answer, which is what a delete and a logout return", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answer(204)));

    await expect(client().delete("/suppliers/1")).resolves.toBeUndefined();
  });
});
