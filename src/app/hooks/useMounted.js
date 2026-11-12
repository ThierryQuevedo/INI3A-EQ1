"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

// true so depois da hidratacao
export function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
