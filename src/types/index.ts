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
  serialize?: (value: any) => string;
  /**
   * 상태를 역직렬화하는 함수입니다.
   * 기본값은 `JSON.parse`입니다.
   */
  deserialize?: (value: string) => any;
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
};

/**
 * 저장할 데이터에 대한 타입입니다.
 */
export type StoredData<T> = {
  /** 저장할 데이터 타입 */
  value: T;
  /** 만료 시간 */
  expiry: number | null;
};
