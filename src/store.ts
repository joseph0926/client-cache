"use client";

import { StoredData, StoreOptions, DefaultOptions } from "./types";

/** 리스너 함수 타입 */
type Listener = () => void;

/**
 * 외부 스토어 클래스 - 클라이언트 상태 관리와 지속성을 제공합니다.
 * @template T 저장할 상태의 타입
 *
 * @example
 * ```typescript
 * const store = new ExternalStore({
 *   storage: localStorage,
 *   key: 'my-key',
 *   serialize: JSON.stringify,
 *   deserialize: JSON.parse,
 *   initialValue: { count: 0 },
 *   ttl: 3600000 // 1시간
 * });
 * ```
 */
export class ExternalStore<T> {
  /** 상태 변경 구독자 집합 */
  private listeners = new Set<Listener>();
  /** 스토어 설정 옵션 */
  private options: StoreOptions<T> & DefaultOptions;
  /** 메모리 캐시 저장소 */
  private memoryCache: StoredData<T> | null = null;
  /** 현재 스토어 버전 */
  private readonly VERSION = "1.0.0";
  /** 스토리지 이벤트 핸들러 */
  private storageEventHandler: ((event: StorageEvent) => void) | null = null;
  /** 정리 이벤트 핸들러 */
  private cleanupEventHandler: ((event: StorageEvent) => void) | null = null;
  private currentValue: T;

  /**
   * ExternalStore 인스턴스를 생성합니다.
   * @param options 스토어 설정 옵션
   */
  constructor(options: StoreOptions<T>) {
    this.options = {
      ...options,
      onError: options.onError || console.error,
      validateOnLoad: options.validateOnLoad ?? true,
      compression: options.compression ?? false,
      maxSize: options.maxSize || 5 * 1024 * 1024,
      staleWhileRevalidate: options.staleWhileRevalidate || 0,
    };
    this.currentValue = options.initialValue;

    if (typeof window !== "undefined") {
      this.loadInitialValue();
    }
  }

  /**
   * 에러 메시지를 추출합니다.
   * @param error - 알 수 없는 에러 객체
   * @returns 에러 메시지 문자열
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === "string") {
      return error;
    } else if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    return "Unknown error occurred";
  }

  /**
   * 초기 값을 비동기적으로 로드합니다.
   * @private
   */
  private async loadInitialValue(): Promise<void> {
    try {
      const value = await this.getAsyncSnapshot();
      this.currentValue = value;
      this.notifySubscribers();
    } catch (error: unknown) {
      this.options.onError(
        new Error(
          `Failed to load initial value: ${this.getErrorMessage(error)}`
        )
      );
    }
  }

  /**
   * useSyncExternalStore를 위한 동기적 스냅샷을 반환합니다.
   * @returns 현재 상태값
   */
  getSnapshot(): T {
    return this.currentValue;
  }

  /**
   * 서버 사이드 렌더링을 위한 스냅샷을 반환합니다.
   * @returns 초기 상태값
   */
  getServerSnapshot(): T {
    return this.options.initialValue;
  }

  /**
   * 비동기적으로 상태값을 가져옵니다.
   * @returns Promise<T> 현재 상태값
   * @private
   */
  private async getAsyncSnapshot(): Promise<T> {
    try {
      if (this.memoryCache) {
        const { value, expiry } = this.memoryCache;
        if (!expiry || Date.now() < expiry) {
          return value;
        }
      }

      const storedValue = this.options.storage.getItem(this.options.key);
      if (storedValue !== null) {
        const decryptedValue = await this.decryptData(storedValue);
        const decompressedValue = await this.decompressData(decryptedValue);
        const parsed = this.options.deserialize(
          decompressedValue
        ) as StoredData<T>;

        if (this.options.validateOnLoad) {
          const calculatedHash = this.calculateHash(parsed.value);
          if (parsed.hash && calculatedHash !== parsed.hash) {
            throw new Error("Data integrity check failed");
          }
        }

        if (parsed.version !== this.VERSION) {
          console.warn(
            `Version mismatch: stored=${parsed.version}, current=${this.VERSION}`
          );
        }

        if (parsed.expiry === null || Date.now() < parsed.expiry) {
          this.memoryCache = parsed;
          return parsed.value;
        } else if (
          this.options.staleWhileRevalidate &&
          Date.now() < parsed.expiry + this.options.staleWhileRevalidate
        ) {
          return parsed.value;
        }

        this.options.storage.removeItem(this.options.key);
        this.memoryCache = null;
      }

      return this.options.initialValue;
    } catch (error: unknown) {
      this.options.onError(
        new Error(
          `Failed to get async snapshot: ${this.getErrorMessage(error)}`
        )
      );
      return this.options.initialValue;
    }
  }

  /**
   * 상태를 업데이트합니다.
   * @param value - 새로운 상태값
   */
  async setState(value: T): Promise<void> {
    try {
      const data: StoredData<T> = {
        value,
        expiry: this.options.ttl ? Date.now() + this.options.ttl : null,
        version: this.VERSION,
        timestamp: Date.now(),
        hash: this.calculateHash(value),
      };

      const serialized = this.options.serialize(data);

      if (!this.validateDataSize(serialized)) {
        throw new Error("Data size exceeds maximum allowed size");
      }

      const compressed = await this.compressData(serialized);
      const encrypted = await this.encryptData(compressed);

      this.options.storage.setItem(this.options.key, encrypted);
      this.memoryCache = data;
      this.currentValue = value; // 동기적 상태 업데이트
      this.notifySubscribers();
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Failed to set state: ${this.getErrorMessage(error)}`)
      );
    }
  }

  /**
   * 데이터를 암호화합니다.
   * @param data - 암호화할 데이터
   * @returns 암호화된 데이터 문자열
   * @private
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.options.encryptionKey) return data;

    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.options.encryptionKey);
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
      );

      return JSON.stringify({
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedData)),
      });
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Encryption failed: ${this.getErrorMessage(error)}`)
      );
      return data;
    }
  }

  /**
   * 암호화된 데이터를 복호화합니다.
   * @param encryptedData - 복호화할 암호화된 데이터
   * @returns 복호화된 데이터 문자열
   * @private
   */
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.options.encryptionKey) return encryptedData;

    try {
      const { iv, data } = JSON.parse(encryptedData);
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.options.encryptionKey);
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Decryption failed: ${this.getErrorMessage(error)}`)
      );
      return encryptedData;
    }
  }

  /**
   * 데이터를 압축합니다.
   * @param data - 압축할 데이터
   * @returns 압축된 데이터 문자열
   * @private
   */
  private async compressData(data: string): Promise<string> {
    if (!this.options.compression) return data;

    try {
      const stream = new Blob([data]).stream();
      const compressedStream = stream.pipeThrough(
        new CompressionStream("gzip")
      );
      const compressedData = await new Response(compressedStream).arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(compressedData)));
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Compression failed: ${this.getErrorMessage(error)}`)
      );
      return data;
    }
  }

  /**
   * 압축된 데이터를 해제합니다.
   * @param data - 압축 해제할 데이터
   * @returns 압축 해제된 데이터 문자열
   * @private
   */
  private async decompressData(data: string): Promise<string> {
    if (!this.options.compression) return data;

    try {
      const compressedData = Uint8Array.from(atob(data), (c) =>
        c.charCodeAt(0)
      );
      const stream = new Blob([compressedData]).stream();
      const decompressedStream = stream.pipeThrough(
        new DecompressionStream("gzip")
      );
      return await new Response(decompressedStream).text();
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Decompression failed: ${this.getErrorMessage(error)}`)
      );
      return data;
    }
  }

  /**
   * 데이터의 해시값을 계산합니다.
   * @param data - 해시를 계산할 데이터
   * @returns 계산된 해시값
   * @private
   */
  private calculateHash(data: any): string {
    try {
      return btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(new TextEncoder().encode(JSON.stringify(data))).reduce(
            (arr, byte) => [...arr, byte],
            [] as number[]
          )
        )
      );
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Hash calculation failed: ${this.getErrorMessage(error)}`)
      );
      return "";
    }
  }

  /**
   * 데이터 크기가 제한을 초과하는지 검사합니다.
   * @param data - 검사할 데이터
   * @returns 크기 제한 준수 여부
   * @private
   */
  private validateDataSize(data: string): boolean {
    const size = new Blob([data]).size;
    return size <= this.options.maxSize;
  }

  /**
   * 스토리지 변경 이벤트를 처리합니다.
   * @param event - StorageEvent 객체
   * @private
   */
  private handleStorageEvent(event: StorageEvent): void {
    try {
      if (
        event.storageArea === this.options.storage &&
        event.key === this.options.key
      ) {
        this.memoryCache = null;
        this.notifySubscribers();
      }
    } catch (error: unknown) {
      this.options.onError(
        new Error(
          `Storage event handling failed: ${this.getErrorMessage(error)}`
        )
      );
    }
  }

  /**
   * 스토리지 정리 이벤트를 처리합니다.
   * @param event - StorageEvent 객체
   * @private
   */
  private handleCleanupEvent(event: StorageEvent): void {
    try {
      if (event.storageArea === this.options.storage) {
        const totalSize = this.calculateStorageSize();
        if (totalSize > this.options.maxSize) {
          this.cleanupExpiredItems();
        }
      }
    } catch (error: unknown) {
      this.options.onError(
        new Error(
          `Cleanup event handling failed: ${this.getErrorMessage(error)}`
        )
      );
    }
  }

  /**
   * 현재 스토리지의 총 크기를 계산합니다.
   * @returns 총 크기 (bytes)
   * @private
   */
  private calculateStorageSize(): number {
    return Object.entries(this.options.storage).reduce((size, [, value]) => {
      if (value) {
        return size + new Blob([value]).size;
      }
      return size;
    }, 0);
  }

  /**
   * 만료된 항목들을 정리합니다.
   * @private
   */
  private cleanupExpiredItems(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      Object.keys(this.options.storage).forEach((key) => {
        try {
          const item = this.options.storage.getItem(key);
          if (item) {
            const data = this.options.deserialize(item);
            if (data.expiry && now > data.expiry) {
              keysToRemove.push(key);
            }
          }
        } catch (error: unknown) {
          this.options.onError(
            new Error(
              `Failed to process item ${key}: ${this.getErrorMessage(error)}`
            )
          );
        }
      });

      keysToRemove.forEach((key) => {
        try {
          this.options.storage.removeItem(key);
        } catch (error: unknown) {
          this.options.onError(
            new Error(
              `Failed to remove item ${key}: ${this.getErrorMessage(error)}`
            )
          );
        }
      });

      if (keysToRemove.includes(this.options.key)) {
        this.memoryCache = null;
        this.notifySubscribers();
      }
    } catch (error: unknown) {
      this.options.onError(
        new Error(`Cleanup process failed: ${this.getErrorMessage(error)}`)
      );
    }
  }

  /**
   * 상태 변경 구독을 설정합니다.
   * @param listener - 구독할 리스너 함수
   * @returns 구독 취소 함수
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 모든 구독자에게 상태 변경을 알립니다.
   * @private
   */
  private notifySubscribers(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error: unknown) {
        this.options.onError(
          new Error(
            `Listener notification failed: ${this.getErrorMessage(error)}`
          )
        );
      }
    });
  }

  /**
   * 리소스를 정리합니다.
   */
  cleanup(): void {
    if (typeof window !== "undefined") {
      if (this.storageEventHandler) {
        window.removeEventListener("storage", this.storageEventHandler);
        this.storageEventHandler = null;
      }
      if (this.cleanupEventHandler) {
        window.removeEventListener("storage", this.cleanupEventHandler);
        this.cleanupEventHandler = null;
      }
    }
    this.listeners.clear();
    this.memoryCache = null;
  }
}
