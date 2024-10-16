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
  const [count, setCount] = useClientCache<number>("counter", 0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increase</button>
    </div>
  );
}

export default Counter;
```

- The `count` state will persist across page reloads.
- State changes are synchronized across multiple tabs.

### Using TTL (Time To Live)

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function TemporaryMessage() {
  const [message, setMessage] = useClientCache<string>(
    "welcomeMessage",
    "Hello!",
    {
      ttl: 5000, // State expires after 5000ms (5 seconds)
    }
  );

  return (
    <div>
      <p>{message}</p>
      <button onClick={() => setMessage("Welcome!")}>Change Message</button>
    </div>
  );
}

export default TemporaryMessage;
```

- The `message` state will reset to the initial value after 5 seconds.
- TTL helps keep your state data fresh and up-to-date.

### Custom Storage and Serialization

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function ComplexDataComponent() {
  const [data, setData] = useClientCache<{ [key: string]: any }>(
    "complexData",
    {},
    {
      namespace: "my-app",
      storage: sessionStorage, // Use sessionStorage instead of localStorage
      serialize: (value) => btoa(JSON.stringify(value)), // Custom serialization (Base64 encoding)
      deserialize: (value) => JSON.parse(atob(value)),
    }
  );

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* Update data as needed */}
    </div>
  );
}

export default ComplexDataComponent;
```

- Customize storage options and serialization methods as per your requirements.
- Namespaces help prevent key collisions in storage.

## API

### `useClientCache`

```typescript
const [state, setState] = useClientCache<T>(
  key: string,
  initialValue: T,
  options?: UseClientCacheOptions<T>
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

#### Returns

- `state`: The current state value.
- `setState`: Function to update the state.

## TypeScript Support

The library is written in TypeScript and provides full type definitions out of the box. This ensures type safety and better integration with TypeScript projects.

## Synchronization Across Tabs

State changes are synchronized across different browser tabs or windows. When the state updates in one tab, other tabs will automatically receive the updated state.

## Handling Server-Side Rendering (SSR)

The library includes checks to ensure compatibility with SSR environments. If `window` or `storage` is not available, the hook will fallback gracefully, but persistence will only work on the client side.

## Contributing

Please open issues or pull requests on the [GitHub repository](https://github.com/joseph0926/client-cache).

## License

This project is licensed under the MIT License.

---

# 클라이언트 캐시 쿼리

**[English](#client-cache) | 한국어**

클라이언트 캐시 쿼리는 React Query에서 영감을 받아 클라이언트 측 상태 관리에 강력한 캐싱 메커니즘을 제공하는 React 라이브러리입니다. TTL(Time To Live) 및 탭 간 동기화와 같은 기능을 통해 페이지를 새로 고침하더라도 로컬 상태를 지속적으로 유지할 수 있도록 설계되었습니다. 사용하기 쉽고 효율적으로 React 애플리케이션에 통합할 수 있습니다.

## 주요 기능

- **상태 지속성**: `localStorage` 또는 다른 스토리지를 사용하여 페이지 새로 고침 시에도 클라이언트 상태를 유지합니다.
- **TTL 지원**: 캐시된 상태의 만료 시간을 설정하여 최신 데이터를 유지합니다.
- **탭 간 동기화**: 여러 탭이나 창에서 상태 변경 사항을 자동으로 동기화합니다.
- **타입스크립트 지원**: 타입 안정성과 개발자 경험 향상을 위해 타입스크립트로 작성되었습니다.
- **사용의 간편함**: React Query에서 영감을 받은 간단한 API와 친숙한 훅을 제공합니다.
- **커스터마이징**: 커스텀 직렬화, 역직렬화 및 스토리지 옵션을 지원합니다.

## 설치

```bash
npm install client-cache
```

또는

```bash
yarn add client-cache
```

## 사용 방법

### 기본 사용법

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function Counter() {
  const [count, setCount] = useClientCache<number>("counter", 0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={increment}>증가</button>
    </div>
  );
}

export default Counter;
```

- `count` 상태는 페이지를 새로 고침하더라도 유지됩니다.
- 상태 변경 시 여러 탭에서 자동으로 동기화됩니다.

### TTL(Time To Live) 사용하기

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function TemporaryMessage() {
  const [message, setMessage] = useClientCache<string>(
    "welcomeMessage",
    "안녕하세요!",
    {
      ttl: 5000,
    }
  );

  return (
    <div>
      <p>{message}</p>
      <button onClick={() => setMessage("환영합니다!")}>메시지 변경</button>
    </div>
  );
}

export default TemporaryMessage;
```

- `message` 상태는 5초 후에 초기 값으로 재설정됩니다.
- TTL을 통해 상태 데이터를 신선하게 유지할 수 있습니다.

### 커스텀 스토리지 및 직렬화 사용

```tsx
import React from "react";
import { useClientCache } from "client-cache";

function ComplexDataComponent() {
  const [data, setData] = useClientCache<{ [key: string]: any }>(
    "complexData",
    {},
    {
      namespace: "my-app",
      storage: sessionStorage, // localStorage 대신 sessionStorage 사용
      serialize: (value) => btoa(JSON.stringify(value)), // 커스텀 직렬화 (Base64 인코딩)
      deserialize: (value) => JSON.parse(atob(value)),
    }
  );

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* 필요한 경우 데이터 업데이트 */}
    </div>
  );
}

export default ComplexDataComponent;
```

- 필요에 따라 스토리지 옵션과 직렬화 방법을 커스터마이징할 수 있습니다.
- 네임스페이스를 사용하여 스토리지 키 충돌을 방지합니다.

## API

### `useClientCache`

```typescript
const [state, setState] = useClientCache<T>(
  key: string,
  initialValue: T,
  options?: UseClientCacheOptions<T>
);
```

#### 매개변수

- `key`: 캐시된 상태를 식별하기 위한 고유한 문자열입니다.
- `initialValue`: 저장된 값이 없을 경우 상태의 초기 값입니다.
- `options` (선택 사항): 동작을 커스터마이징하기 위한 객체입니다.
  - `storage`: 사용할 스토리지 객체 (`localStorage` 또는 `sessionStorage`). 기본값은 `localStorage`입니다.
  - `serialize`: 상태를 저장하기 전에 직렬화하는 함수입니다. 기본값은 `JSON.stringify`입니다.
  - `deserialize`: 상태를 로드할 때 역직렬화하는 함수입니다. 기본값은 `JSON.parse`입니다.
  - `ttl`: 상태가 만료되는 시간(밀리초 단위)입니다. 기본값은 `undefined`로, 만료되지 않습니다.
  - `namespace`: 스토리지 키의 접두사로 사용되는 문자열로, 충돌을 방지합니다. 기본값은 `'client-cache'`입니다.

#### 반환값

- `state`: 현재 상태 값입니다.
- `setState`: 상태를 업데이트하는 함수입니다.

## 타입스크립트 지원

이 라이브러리는 타입스크립트로 작성되었으며, 완전한 타입 정의를 제공합니다. 이를 통해 타입 안정성을 보장하고 타입스크립트 프로젝트와의 통합을 개선합니다.

## 탭 간 동기화

상태 변경 사항은 다른 브라우저 탭이나 창에서도 동기화됩니다. 한 탭에서 상태가 업데이트되면 다른 탭에서도 자동으로 갱신된 상태를 받습니다.

## 서버 사이드 렌더링(SSR) 처리

이 라이브러리는 SSR 환경과의 호환성을 위해 체크 로직을 포함하고 있습니다. `window`나 `storage`가 사용 가능하지 않은 경우에도 문제가 발생하지 않으며, 상태 지속성은 클라이언트 측에서만 동작합니다.

## 기여 방법

[GitHub 리포지토리](https://github.com/joseph0926/client-cache)에 이슈나 풀 리퀘스트를 남겨주세요.

## 라이선스

이 프로젝트는 MIT 라이선스로 제공됩니다.
