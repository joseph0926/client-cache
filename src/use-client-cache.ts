"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { UseClientCacheOptions } from "./types";
import { createExternalStore, ExternalStore } from "./store";

type UseClientCacheReturn<T> = [T, (value: T) => void];

/**
 * Custom hook to persist and synchronize client state using localStorage and useSyncExternalStore.
 * @template T Type of the stored state.
 * @param key Unique key for the state value.
 * @param initialValue Initial value of the state.
 * @param options Optional configurations.
 * @returns A tuple containing the state and a setter function.
 */
function useClientCache<T>(
  key: string,
  initialValue: T,
  options: UseClientCacheOptions<T> = {}
): UseClientCacheReturn<T> {
  const {
    storage = typeof window !== "undefined" ? window.localStorage : undefined,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    ttl,
    namespace = "client-cache",
  } = options;

  const namespacedKey = `${namespace}:${key}`;

  /** External store ref */
  const storeRef = useRef<ExternalStore<T> | null>(null);

  if (!storeRef.current) {
    /** 외부 store에 접근 불가능하면 인메모리에 상태를 저장합니다 */
    if (!storage) {
      console.warn(
        "Storage is not available. Falling back to in-memory storage."
      );
      return [initialValue, () => {}];
    }

    storeRef.current = createExternalStore<T>({
      storage,
      key: namespacedKey,
      serialize,
      deserialize,
      initialValue,
      ttl,
    });
  }

  /** External store */
  const store = storeRef.current;

  const state = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot()
  );

  const setState = (value: T) => {
    store.setState(value);
  };

  useEffect(() => {
    return () => {
      store.cleanup();
    };
  }, [store]);

  return [state, setState];
}

export { useClientCache };
