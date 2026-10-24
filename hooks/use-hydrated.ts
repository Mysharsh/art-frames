import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * True only after the client has hydrated. Use it to gate UI that depends on
 * browser-only state (e.g. the persisted cart) so the server HTML and the first
 * client render match.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
