import {
  type SetStateAction,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { ExternalStore } from "./store";
import type { UseClientCacheOptions } from "./types";

/**
 * 클라이언트 상태를 캐시하고 관리하는 React 훅입니다.
 * @template T 저장할 상태의 타입
 * @param key 상태를 식별하는 고유 키
 * @param initialValue 초기값
 * @param options 캐시 옵션
 * @returns [현재 상태, 상태 업데이트 함수]
 */
export function useClientCache<T>(
  key: string,
  initialValue: T,
  options: UseClientCacheOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => Promise<void>] {
  const {
    storage = typeof window !== "undefined" ? window.localStorage : undefined,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    ttl,
    namespace = "client-cache",
    onError = console.error,
    validateOnLoad = true,
    compression = false,
    encryptionKey,
    maxSize = 5 * 1024 * 1024,
    staleWhileRevalidate = 0,
  } = options;

  const namespacedKey = `${namespace}:${encodeURIComponent(key)}`;
  const storeRef = useRef<ExternalStore<T> | null>(null);

  if (!storeRef.current) {
    if (!storage) {
      console.warn(
        "Storage is not available. Falling back to in-memory storage."
      );
      return [initialValue, async () => {}];
    }

    storeRef.current = new ExternalStore<T>({
      storage,
      key: namespacedKey,
      serialize,
      deserialize,
      initialValue,
      ttl,
      onError,
      validateOnLoad,
      compression,
      encryptionKey,
      maxSize,
      staleWhileRevalidate,
    });
  }

  const store = storeRef.current;

  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store),
    store.getServerSnapshot.bind(store)
  );

  const setState = async (action: T | ((prev: T) => T)): Promise<void> => {
    try {
      const newValue =
        typeof action === "function"
          ? (action as (prev: T) => T)(store.getSnapshot())
          : action;

      await store.setState(newValue);
    } catch (error) {
      onError(new Error(`Failed to set state: ${error}`));
    }
  };

  useEffect(() => {
    return () => {
      store.cleanup();
    };
  }, []);

  return [state, setState];
}
