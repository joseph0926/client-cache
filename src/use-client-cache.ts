"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import { UseClientCacheOptions } from "./types";
import { createExternalStore, ExternalStore } from "./store";

type UseClientCacheReturn<T> = [T, (value: T) => void];

/**
 * localStorage 및 useSyncExternalStore를 사용하여 클라이언트 상태를 유지하고 동기화하는 커스텀 훅입니다.
 * @template T 저장된 상태의 타입입니다.
 * @param key 상태 값의 고유 키입니다.
 * @param initialValue 초기 값입니다.
 * @param options 선택적 구성입니다.
 * @returns state & setState
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

  const namespacedKey = `${namespace}:${encodeURIComponent(key)}`;

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
    () => store.getSnapshot(),
    () => initialValue
  );

  const setState = (action: SetStateAction<T>) => {
    if (typeof action === "function") {
      store.setState((action as (prevState: T) => T)(store.getSnapshot()));
    } else {
      store.setState(action);
    }
  };

  useEffect(() => {
    return () => {
      store.cleanup();
    };
  }, []);

  return [state, setState];
}

export { useClientCache };
