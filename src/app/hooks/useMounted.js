"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** true só depois da hidratação no client — evita mismatch de SSR em next-themes etc. */
export function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
