import { useEffect, useRef, useSyncExternalStore } from "react";
import { UseClientCacheOptions } from "./types";
import { createExternalStore, ExternalStore } from "./store";

type UseClientCacheReturn<T> = [T, (value: T) => void];

function useClientCache<T>(
  key: string,
  initialValue: T,
  options: UseClientCacheOptions<T> = {}
): UseClientCacheReturn<T> {
  const {
    storage = window.localStorage,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    ttl,
    namespace = "client-cache",
  } = options;

  const namespacedKey = `${namespace}:${key}`;

  /** 외부 스토어 참조값. */
  const storeRef = useRef<ExternalStore<T> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createExternalStore<T>({
      storage,
      key: namespacedKey,
      serialize,
      deserialize,
      initialValue,
      ttl,
    });
  }

  /** 외부 스토어 */
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
