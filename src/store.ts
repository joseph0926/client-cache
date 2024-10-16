"use client";

type Listener = () => void;

/**
 * 외부 스토어 클래스 - `useSyncExternalStore`와 연동하여 상태를 관리합니다.
 * @template T 저장할 상태의 타입
 */
export class ExternalStore<T> {
  /** 상태 변경 시 호출될 리스너들의 집합입니다. */
  private listeners = new Set<Listener>();
  /** 사용할 스토리지 (`localStorage`, `sessionStorage` 등). */
  private storage: Storage;
  /** 상태를 저장할 때 사용할 키입니다. */
  private key: string;
  /** 상태를 직렬화하는 함수입니다. */
  private serialize: (value: any) => string;
  /** 상태를 역직렬화하는 함수입니다. */
  private deserialize: (value: string) => any;
  /** 상태의 초기 값입니다. */
  private initialValue: T;
  /** 상태의 TTL(Time To Live)로, 밀리초(ms) 단위입니다. */
  private ttl?: number;

  /**
   * ExternalStore 생성
   * @param options ExternalStore 옵션
   */
  constructor(options: {
    storage: Storage;
    key: string;
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
    initialValue: T;
    ttl?: number;
  }) {
    this.storage = options.storage;
    this.key = options.key;
    this.serialize = options.serialize;
    this.deserialize = options.deserialize;
    this.initialValue = options.initialValue;
    this.ttl = options.ttl;

    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  /**
   * `StorageEvent`를 활용하여 여러 탭의 스토리지를 동기화합니다
   * @param event StorageEvent
   */
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.storageArea === this.storage && event.key === this.key) {
      this.notifySubscribers();
    }
  };

  /**
   * 구독한 리스너에게 상태 변경을 알립니다
   */
  private notifySubscribers() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * 현재 상태(스냅샷)를 가져옵니다
   * @returns current state
   */
  getSnapshot(): T {
    try {
      const storedValue = this.storage.getItem(this.key);
      if (storedValue !== null) {
        const parsed = this.deserialize(storedValue) as {
          value: T;
          expiry: number | null;
        };

        if (parsed.expiry === null || Date.now() < parsed.expiry) {
          return parsed.value;
        } else {
          this.storage.removeItem(this.key);
          return this.initialValue;
        }
      } else {
        return this.initialValue;
      }
    } catch (error) {
      console.error("Failed to retrieve state from storage:", error);
      return this.initialValue;
    }
  }

  /**
   * 저장소에 상태를 저장합니다
   * @param value new state
   */
  setState(value: T) {
    try {
      const data = {
        value,
        expiry: this.ttl ? Date.now() + this.ttl : null,
      };
      this.storage.setItem(this.key, this.serialize(data));
      this.notifySubscribers();
    } catch (error) {
      console.error("Failed to save state to storage:", error);
    }
  }

  /**
   * 리스너를 구독합니다
   * @param listener listener function
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * clean up
   */
  cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent);
    }
    this.listeners.clear();
  }
}

const storeCache = new Map<string, ExternalStore<any>>();

/**
 * `key`를 기준으로 `ExternalStore` 인스턴스를 생성(검색)합니다
 * @template T 저장될 데이터 타입
 * @param options ExternalStore options
 * @returns ExternalStore instance
 */
export function createExternalStore<T>(options: {
  storage: Storage;
  key: string;
  serialize: (value: any) => string;
  deserialize: (value: string) => any;
  initialValue: T;
  ttl?: number;
}): ExternalStore<T> {
  const { key } = options;

  if (storeCache.has(key)) {
    return storeCache.get(key) as ExternalStore<T>;
  } else {
    const store = new ExternalStore<T>(options);
    storeCache.set(key, store);
    return store;
  }
}
