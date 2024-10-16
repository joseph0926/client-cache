type Listener = () => void;

export class ExternalStore<T> {
  private listeners = new Set<Listener>();
  private storage: Storage;
  private key: string;
  private serialize: (value: any) => string;
  private deserialize: (value: string) => any;
  private initialValue: T;
  private ttl?: number;

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

    window.addEventListener("storage", this.handleStorageEvent);
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.storageArea === this.storage && event.key === this.key) {
      this.notifySubscribers();
    }
  };

  private notifySubscribers() {
    this.listeners.forEach((listener) => listener());
  }

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

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  cleanup() {
    window.removeEventListener("storage", this.handleStorageEvent);
    this.listeners.clear();
  }
}

export function createExternalStore<T>(options: {
  storage: Storage;
  key: string;
  serialize: (value: any) => string;
  deserialize: (value: string) => any;
  initialValue: T;
  ttl?: number;
}): ExternalStore<T> {
  return new ExternalStore<T>(options);
}
