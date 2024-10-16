export type UseClientCacheOptions<T> = {
  storage?: Storage;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  ttl?: number;
  namespace?: string;
};
