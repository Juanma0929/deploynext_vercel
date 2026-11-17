/**
 * Lets every feature forget its in-memory state when the session ends.
 *
 * A feature store registers its reset once (for example, when the store is
 * created) and auth calls resetSessionState() on logout. Features do not
 * import each other: they only meet here, in shared.
 */
type ResetListener = () => void;

const listeners = new Set<ResetListener>();

/** Registers a reset; the returned function unregisters it. */
export function onSessionReset(listener: ResetListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Runs every registered reset. One that throws does not stop the others. */
export function resetSessionState(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch (error: unknown) {
      console.error("A session reset failed:", error);
    }
  }
}
