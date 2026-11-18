"use client";

import { useEffect, useSyncExternalStore } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { onSessionReset } from "./session-reset";

/**
 * A store of a feature: state that lives outside the components, so it
 * survives navigating between screens and can be shared by all of them.
 *
 * Every store registers itself in the session reset when it is created, so
 * logging out empties all of them, mounted or not: nothing of one user is
 * left for the next one.
 */
export interface Store<S> {
  get(): S;
  set(next: S | ((current: S) => S)): void;
  subscribe(listener: () => void): () => void;
  /** How many components are reading it right now. */
  listenerCount(): number;
  /** Back to the initial state. Runs on logout. */
  reset(): void;
}

export function createStore<S>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<() => void>();

  const store: Store<S> = {
    get: () => state,
    set(next) {
      state = typeof next === "function" ? (next as (current: S) => S)(state) : next;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    listenerCount: () => listeners.size,
    reset: () => store.set(initial),
  };

  onSessionReset(store.reset);
  return store;
}

/** Reads a store and renders again when it changes. */
export function useStore<S>(store: Pick<Store<S>, "get" | "subscribe">): S {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export type ResourceState<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly previous: T | null }
  | { readonly status: "ready"; readonly data: T }
  | { readonly status: "error"; readonly message: string };

/**
 * Data loaded from the API, kept in a store. `ensure()` loads it only if it
 * is not there yet, which makes it a cache; `reload()` always asks again;
 * `invalidate()` marks it stale, so the next screen that needs it reloads it.
 * Two screens that ask at the same time share one request.
 */
export interface Resource<T> {
  readonly store: Store<ResourceState<T>>;
  ensure(): Promise<void>;
  reload(): Promise<void>;
  invalidate(): void;
}

export function createResource<T>(load: () => Promise<T>): Resource<T> {
  const store = createStore<ResourceState<T>>({ status: "idle" });
  let inFlight: Promise<void> | null = null;
  /** Bumped on logout: an answer that arrives after it belongs to the previous session. */
  let session = 0;
  /** The data changed while a request was running: its answer is already old. */
  let isStale = false;

  onSessionReset(() => {
    session += 1;
    inFlight = null;
    isStale = false;
  });

  function reload(): Promise<void> {
    if (inFlight !== null) return inFlight;

    const current = store.get();
    store.set({ status: "loading", previous: current.status === "ready" ? current.data : null });

    const startedIn = session;
    const request: Promise<void> = load()
      .then((data) => {
        if (startedIn === session && !isStale) store.set({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (startedIn === session && !isStale) store.set({ status: "error", message: errorMessage(error) });
      })
      .finally(() => {
        if (inFlight !== request) return;
        inFlight = null;
        if (isStale) {
          isStale = false;
          void reload();
        }
      });
    inFlight = request;
    return request;
  }

  return {
    store,
    reload,
    ensure() {
      const { status } = store.get();
      return status === "idle" || status === "error" ? reload() : (inFlight ?? Promise.resolve());
    },
    invalidate() {
      // Whoever is on screen sees fresh data now; otherwise the next ensure() reloads.
      if (store.get().status === "idle") return;
      // A request already running asks again as soon as it ends.
      if (inFlight !== null) isStale = true;
      else if (store.listenerCount() > 0) void reload();
      else store.set({ status: "idle" });
    },
  };
}

export type ResourceMode =
  /** Load once and keep it: catalogs that change seldom. */
  | "cached"
  /** Ask again every time a screen that needs it opens: lists that change all the time. */
  | "fresh"
  /** Only read it: the screen did not ask for it, so nothing is loaded. */
  | "none";

/** What a facade reads for a resource the screen did not ask for. */
const NOTHING = createStore<ResourceState<never>>({ status: "idle" });

/**
 * Reads a resource and loads it when the component mounts. While a fresh
 * reload runs, the previous data stays readable in `previous`, so the screen
 * does not go blank. With no resource (null) it stays idle.
 */
export function useResource<T>(resource: Resource<T> | null, mode: ResourceMode = "cached"): ResourceState<T> {
  const state = useStore<ResourceState<T>>(resource?.store ?? NOTHING);

  useEffect(() => {
    if (resource === null || mode === "none") return;
    void (mode === "fresh" ? resource.reload() : resource.ensure());
  }, [resource, mode]);

  return state;
}

/** What a screen reads from a resource: loading, the data, or the message of the error. */
export type LoadState<T> =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: T }
  | { readonly status: "error"; readonly message: string };

/** The state of a resource as a screen shows it: while it reloads, the previous data stays. */
export function loadStateOf<T>(state: ResourceState<T>): LoadState<T> {
  if (state.status === "ready" || state.status === "error") return state;
  if (state.status === "loading" && state.previous !== null) return { status: "ready", data: state.previous };
  return { status: "loading" };
}

/**
 * One resource per key (a date range, a limit): each one cached on its own.
 * `invalidate()` marks all of them stale, and logging out forgets them.
 */
export interface ResourceFamily<K, T> {
  get(key: K): Resource<T>;
  invalidate(): void;
}

export function createResourceFamily<K, T>(
  keyOf: (key: K) => string,
  load: (key: K) => Promise<T>,
): ResourceFamily<K, T> {
  const resources = new Map<string, Resource<T>>();
  onSessionReset(() => resources.clear());

  return {
    get(key) {
      const id = keyOf(key);
      let resource = resources.get(id);
      if (resource === undefined) {
        resource = createResource(() => load(key));
        resources.set(id, resource);
      }
      return resource;
    },
    invalidate() {
      for (const resource of resources.values()) resource.invalidate();
    },
  };
}
