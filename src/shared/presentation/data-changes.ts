/**
 * "These data changed": how one feature tells the others their cached copy is
 * stale, without importing them. A sale lowers the stock, so after a sale the
 * products catalog has to be read again; sales says so here, products listens.
 *
 * Like the session reset, features only meet here, in shared.
 */
export type DataTopic =
  /** Products and their stock: a product was written, or a sale moved the stock. */
  | "products"
  /** Suppliers: one was created, edited or deleted. */
  | "suppliers"
  /** Sales: one was registered, cancelled, or its payment settled. */
  | "sales";

type Listener = () => void;

const listeners = new Map<DataTopic, Set<Listener>>();

/** Registers a listener for one topic; the returned function unregisters it. */
export function onDataChanged(topic: DataTopic, listener: Listener): () => void {
  const set = listeners.get(topic) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(topic, set);
  return () => {
    set.delete(listener);
  };
}

/** Tells every listener of these topics that their data is stale. */
export function notifyDataChanged(...topics: readonly DataTopic[]): void {
  for (const topic of topics) {
    for (const listener of listeners.get(topic) ?? []) listener();
  }
}
