# Client Cache Query

**English | [한국어](#클라이언트-캐시)**

Client Cache Query is a React library that brings powerful caching mechanisms to client-side state management, inspired by React Query. It enables persistent local state across page reloads with features like TTL (Time To Live) and synchronization across tabs. The library is designed to be simple, efficient, and easy to integrate into your React applications.

## Features

- **Persistent State**: Maintain client-side state across page reloads using `localStorage` or other storage options.
- **TTL Support**: Set expiration times for your cached state to keep data fresh.
- **Cross-Tab Synchronization**: Automatically synchronize state changes across multiple tabs or windows.
- **TypeScript Support**: Built with TypeScript for type safety and better developer experience.
- **Easy to Use**: Simple API inspired by React Query, with familiar hooks and patterns.
- **Customization**: Support for custom serialization, deserialization, and storage options.
- **Data Encryption**: Optional encryption for sensitive data using AES-GCM.
- **Data Compression**: Optional data compression to reduce storage size.
- **Data Integrity**: Hash-based data integrity validation.
- **Memory Cache**: Efficient in-memory caching layer for better performance.
- **Stale While Revalidate**: Support for stale-while-revalidate pattern.
- **Version Control**: Built-in version control for data schema updates.

## Installation

```bash
npm install client-cache
```

or

```bash
yarn add client-cache
```

## Usage

### Basic Usage

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function Counter() {
  const [count, setCount] = useClientCache("counter", 0);

  const increment = () => {
    setCount(count + 1);
  };

  return (

      Count: {count}
      Increase

  );
}

export default Counter;
```

### Using TTL with Encryption

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function SecureMessage() {
  const [message, setMessage] = useClientCache(
    "secureMessage",
    "Hello!",
    {
      ttl: 5000, // State expires after 5000ms (5 seconds)
      encryptionKey: "your-secret-key", // Enable encryption
      compression: true, // Enable compression
    }
  );

  return (

      {message}
      <button onClick={() => setMessage("Welcome!")}>Change Message

  );
}
```

### Advanced Configuration

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function ComplexDataComponent() {
  const [data, setData] = useClientCache(
    "complexData",
    {},
    {
      namespace: "my-app",
      storage: sessionStorage,
      serialize: (value) => btoa(JSON.stringify(value)),
      deserialize: (value) => JSON.parse(atob(value)),
      validateOnLoad: true, // Enable data integrity validation
      maxSize: 1024 * 1024, // 1MB size limit
      staleWhileRevalidate: 60000, // Allow stale data for 1 minute
      onError: (error) => console.error('Cache error:', error),
    }
  );

  return (

      {JSON.stringify(data, null, 2)}

  );
}
```

## API

### `useClientCache`

```typescript
const [state, setState] = useClientCache(
  key: string,
  initialValue: T,
  options?: UseClientCacheOptions
);
```

#### Parameters

- `key`: A unique string to identify the cached state.
- `initialValue`: The initial value of the state if not already stored.
- `options` (optional): An object to customize behavior.
  - `storage`: The Storage object to use (`localStorage` or `sessionStorage`). Default is `localStorage`.
  - `serialize`: Function to serialize the state before saving. Default is `JSON.stringify`.
  - `deserialize`: Function to deserialize the state when loading. Default is `JSON.parse`.
  - `ttl`: Time in milliseconds after which the state expires. Default is `undefined` (no expiration).
  - `namespace`: A string to prefix the storage key to prevent collisions. Default is `'client-cache'`.
  - `encryptionKey`: Optional key for AES-GCM encryption.
  - `compression`: Boolean to enable data compression. Default is `false`.
  - `validateOnLoad`: Boolean to enable data integrity validation. Default is `true`.
  - `maxSize`: Maximum size in bytes for stored data. Default is 5MB.
  - `staleWhileRevalidate`: Time in milliseconds to allow stale data. Default is 0.
  - `onError`: Error handler function. Default is `console.error`.

#### Returns

- `state`: The current state value.
- `setState`: Async function to update the state.

## Advanced Features

### Data Encryption

The library provides AES-GCM encryption for sensitive data:

```typescript
const [sensitiveData, setSensitiveData] = useClientCache(
  "sensitive",
  initialData,
  {
    encryptionKey: process.env.ENCRYPTION_KEY,
  }
);
```

### Data Compression

Enable compression for large datasets:

```typescript
const [largeData, setLargeData] = useClientCache("large-data", initialData, {
  compression: true,
});
```

### Data Integrity

Validate data integrity using hash validation:

```typescript
const [data, setData] = useClientCache("important-data", initialData, {
  validateOnLoad: true,
});
```

### Memory Caching

The library automatically maintains an in-memory cache layer for better performance while ensuring consistency with persistent storage.

### Error Handling

Comprehensive error handling with custom callbacks:

```typescript
const [data, setData] = useClientCache("data", initialValue, {
  onError: (error) => {
    logger.error("Cache error:", error);
    notifyUser("Failed to update cache");
  },
});
```

## TypeScript Support

The library is written in TypeScript and provides full type definitions out of the box. This ensures type safety and better integration with TypeScript projects.

## Synchronization Across Tabs

State changes are synchronized across different browser tabs or windows using the Storage Event API. When the state updates in one tab, other tabs will automatically receive the updated state.

## Handling Server-Side Rendering (SSR)

The library includes checks to ensure compatibility with SSR environments. If `window` or `storage` is not available, the hook will fallback gracefully, but persistence will only work on the client side.

## Contributing

Please open issues or pull requests on the [GitHub repository](https://github.com/joseph0926/client-cache).

## License

This project is licensed under the MIT License.

---

# 클라이언트 캐시 쿼리

**[English](#client-cache-query) | 한국어**

클라이언트 캐시 쿼리는 React Query에서 영감을 받아 클라이언트 측 상태 관리에 강력한 캐싱 메커니즘을 제공하는 React 라이브러리입니다. TTL(Time To Live) 및 탭 간 동기화와 같은 기능을 통해 페이지를 새로 고침하더라도 로컬 상태를 지속적으로 유지할 수 있도록 설계되었습니다. 사용하기 쉽고 효율적으로 React 애플리케이션에 통합할 수 있습니다.

## 주요 기능

- **상태 지속성**: `localStorage` 또는 다른 스토리지를 사용하여 페이지 새로 고침 시에도 클라이언트 상태를 유지합니다.
- **TTL 지원**: 캐시된 상태의 만료 시간을 설정하여 최신 데이터를 유지합니다.
- **탭 간 동기화**: 여러 탭이나 창에서 상태 변경 사항을 자동으로 동기화합니다.
- **타입스크립트 지원**: 타입 안정성과 개발자 경험 향상을 위해 타입스크립트로 작성되었습니다.
- **사용의 간편함**: React Query에서 영감을 받은 간단한 API와 친숙한 훅을 제공합니다.
- **커스터마이징**: 커스텀 직렬화, 역직렬화 및 스토리지 옵션을 지원합니다.
- **데이터 암호화**: AES-GCM을 사용한 선택적 데이터 암호화를 지원합니다.
- **데이터 압축**: 저장소 크기를 줄이기 위한 선택적 데이터 압축을 지원합니다.
- **데이터 무결성**: 해시 기반 데이터 무결성 검증을 제공합니다.
- **메모리 캐시**: 성능 향상을 위한 효율적인 인메모리 캐싱 레이어를 제공합니다.
- **Stale While Revalidate**: stale-while-revalidate 패턴을 지원합니다.
- **버전 관리**: 데이터 스키마 업데이트를 위한 내장 버전 관리를 제공합니다.

## 설치

```bash
npm install client-cache-query
```

또는

```bash
yarn add client-cache-query
```

## 사용 방법

### 기본 사용법

```tsx
import React from "react";
import { useClientCache } from "client-cache-query";

function Counter() {
  const [count, setCount] = useClientCache("counter", 0);

  const increment = () => {
    setCount(count + 1);
  };

  return (

      카운트: {count}
      증가

  );
}
```

### TTL과 암호화 사용하기

```tsx
import React from "react";
import { useClientCache } from "client-cache-query";

function SecureMessage() {
  const [message, setMessage] = useClientCache(
    "secureMessage",
    "안녕하세요!",
    {
      ttl: 5000, // 5초 후 만료
      encryptionKey: "your-secret-key", // 암호화 활성화
      compression: true, // 압축 활성화
    }
  );

  return (

      {message}
      <button onClick={() => setMessage("환영합니다!")}>메시지 변경

  );
}
```

### 고급 설정

```tsx
import React from "react";
import { useClientCache } from "client-cache-query";

function ComplexDataComponent() {
  const [data, setData] = useClientCache(
    "complexData",
    {},
    {
      namespace: "my-app",
      storage: sessionStorage,
      serialize: (value) => btoa(JSON.stringify(value)),
      deserialize: (value) => JSON.parse(atob(value)),
      validateOnLoad: true, // 데이터 무결성 검증 활성화
      maxSize: 1024 * 1024, // 1MB 크기 제한
      staleWhileRevalidate: 60000, // 1분 동안 오래된 데이터 허용
      onError: (error) => console.error('캐시 오류:', error),
    }
  );

  return (

      {JSON.stringify(data, null, 2)}

  );
}
```

## API

### `useClientCache`

```typescript
const [state, setState] = useClientCache(
  key: string,
  initialValue: T,
  options?: UseClientCacheOptions
);
```

#### 매개변수

- `key`: 캐시된 상태를 식별하기 위한 고유한 문자열입니다.
- `initialValue`: 저장된 값이 없을 경우 상태의 초기 값입니다.
- `options` (선택 사항): 동작을 커스터마이징하기 위한 객체입니다.
  - `storage`: 사용할 스토리지 객체입니다. 기본값은 `localStorage`입니다.
  - `serialize`: 상태를 저장하기 전에 직렬화하는 함수입니다.
  - `deserialize`: 상태를 로드할 때 역직렬화하는 함수입니다.
  - `ttl`: 상태가 만료되는 시간(밀리초)입니다.
  - `namespace`: 스토리지 키 충돌 방지를 위한 접두사입니다.
  - `encryptionKey`: AES-GCM 암호화를 위한 선택적 키입니다.
  - `compression`: 데이터 압축 활성화 여부입니다. 기본값은 `false`입니다.
  - `validateOnLoad`: 데이터 무결성 검증 활성화 여부입니다. 기본값은 `true`입니다.
  - `maxSize`: 저장 데이터의 최대 크기(바이트)입니다. 기본값은 5MB입니다.
  - `staleWhileRevalidate`: 오래된 데이터 허용 시간(밀리초)입니다. 기본값은 0입니다.
  - `onError`: 에러 처리 함수입니다. 기본값은 `console.error`입니다.

#### 반환값

- `state`: 현재 상태 값입니다.
- `setState`: 상태를 업데이트하는 비동기 함수입니다.

## 고급 기능

### 데이터 암호화

중요한 데이터를 위한 AES-GCM 암호화를 제공합니다:

```typescript
const [sensitiveData, setSensitiveData] = useClientCache(
  "sensitive",
  initialData,
  {
    encryptionKey: process.env.ENCRYPTION_KEY,
  }
);
```

### 데이터 압축

대용량 데이터셋을 위한 압축 기능:

```typescript
const [largeData, setLargeData] = useClientCache("large-data", initialData, {
  compression: true,
});
```

### 데이터 무결성

해시 검증을 통한 데이터 무결성 검증:

```typescript
const [data, setData] = useClientCache("important-data", initialData, {
  validateOnLoad: true,
});
```

### 메모리 캐싱

라이브러리는 자동으로 인메모리 캐시 레이어를 유지하면서 영구 저장소와의 일관성을 보장합니다.

### 에러 처리

커스텀 콜백을 통한 포괄적인 에러 처리:

```typescript
const [data, setData] = useClientCache("data", initialValue, {
  onError: (error) => {
    logger.error("캐시 오류:", error);
    notifyUser("캐시 업데이트 실패");
  },
});
```

## 타입스크립트 지원

이 라이브러리는 타입스크립트로 작성되었으며, 완전한 타입 정의를 제공합니다. 이를 통해 타입 안정성을 보장하고 타입스크립트 프로젝트와의 통합을 개선합니다.

## 탭 간 동기화

Storage Event API를 사용하여 서로 다른 브라우저 탭이나 창에서 상태 변경 사항을 동기화합니다. 한 탭에서 상태가 업데이트되면 다른 탭에서도 자동으로 갱신된 상태를 받습니다.

## 서버 사이드 렌더링(SSR) 처리

이 라이브러리는 SSR 환경과의 호환성을 위한 체크 로직을 포함하고 있습니다. `window`나 `storage`가 사용 가능하지 않은 경우에도 문제없이 동작하며, 상태 지속성은 클라이언트 측에서만 동작합니다.

## 기여 방법

[GitHub 리포지토리](https://github.com/joseph0926/client-cache-query)에 이슈나 풀 리퀘스트를 남겨주세요.

## 라이선스

이 프로젝트는 MIT 라이선스로 제공됩니다.
