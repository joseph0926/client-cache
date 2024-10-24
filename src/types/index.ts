/**
 * `useClientCache` 훅의 옵션을 정의하는 타입입니다.
 * @template T 저장할 상태의 타입
 */
export type UseClientCacheOptions<T> = {
  /**
   * 사용할 스토리지 (`localStorage`, `sessionStorage` 등).
   * 기본값은 `window.localStorage`입니다.
   */
  storage?: Storage;
  /**
   * 상태를 직렬화하는 함수입니다.
   * 기본값은 `JSON.stringify`입니다.
   */
  serialize?: (value: StoredData<T>) => string;
  /**
   * 상태를 역직렬화하는 함수입니다.
   * 기본값은 `JSON.parse`입니다.
   */
  deserialize?: (value: string) => StoredData<T>;
  /**
   * 상태의 TTL(Time To Live)로, 밀리초(ms) 단위입니다.
   * 설정하지 않으면 만료되지 않습니다.
   */
  ttl?: number;
  /**
   * 키 충돌을 방지하기 위한 네임스페이스입니다.
   * 기본값은 `"client-cache"`입니다.
   */
  namespace?: string;
  /**
   * 에러 발생 시 호출될 콜백 함수입니다.
   * 기본값은 `console.error`입니다.
   */
  onError?: (error: Error) => void;
  /**
   * 데이터 로드 시 무결성 검증 여부입니다.
   * 기본값은 `true`입니다.
   */
  validateOnLoad?: boolean;
  /**
   * 데이터 압축 사용 여부입니다.
   * 기본값은 `false`입니다.
   */
  compression?: boolean;
  /**
   * 데이터 암호화에 사용될 키입니다.
   * 설정하지 않으면 암호화를 사용하지 않습니다.
   */
  encryptionKey?: string;
  /**
   * 저장소의 최대 크기(bytes)입니다.
   * 기본값은 5MB입니다.
   */
  maxSize?: number;
  /**
   * stale-while-revalidate 기간(밀리초)입니다.
   * 기본값은 0(사용하지 않음)입니다.
   */
  staleWhileRevalidate?: number;
};

/**
 * 저장소에 저장되는 데이터의 구조입니다.
 * @template T 저장할 데이터의 타입
 */
export type StoredData<T> = {
  /** 저장할 실제 데이터 값 */
  value: T;
  /** 만료 시간 (null인 경우 만료되지 않음) */
  expiry: number | null;
  /** 데이터 버전 */
  version: string;
  /** 데이터 저장 시간 */
  timestamp: number;
  /** 데이터 무결성 검증을 위한 해시 */
  hash?: string;
};

/**
 * 기본 옵션 값의 타입입니다.
 */
export type DefaultOptions = {
  onError: (error: Error) => void;
  validateOnLoad: boolean;
  compression: boolean;
  maxSize: number;
  staleWhileRevalidate: number;
};

/**
 * 스토어의 전체 옵션 타입입니다.
 */
export type StoreOptions<T> = UseClientCacheOptions<T> & {
  storage: Storage;
  key: string;
  serialize: (value: any) => string;
  deserialize: (value: string) => any;
  initialValue: T;
};
