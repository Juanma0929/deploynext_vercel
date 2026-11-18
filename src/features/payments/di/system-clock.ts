import type { PollingClock } from "../application/poll-payment-status.use-case";

/** The real clock: Date.now() and setTimeout, cleared when the signal aborts. */
export const systemClock: PollingClock = {
  now: () => Date.now(),
  wait: (ms, signal) =>
    new Promise<void>((resolve) => {
      if (signal?.aborted === true) {
        resolve();
        return;
      }
      const timer = setTimeout(done, ms);
      signal?.addEventListener("abort", done, { once: true });

      function done() {
        clearTimeout(timer);
        signal?.removeEventListener("abort", done);
        resolve();
      }
    }),
};
