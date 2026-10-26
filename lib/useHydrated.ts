import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False during server render and hydration, true afterwards. Use it to show
 * values that depend on the viewer's clock, time zone or locale, which the
 * server (UTC on Vercel) can't know.
 */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
