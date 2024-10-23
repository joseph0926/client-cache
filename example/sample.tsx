import { useClientCache } from "client-cache-query";
import { useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface UserPreferences {
  theme: "light" | "dark";
  fontSize: number;
  notifications: boolean;
}

export default function Sample() {
  // 1. 기본적인 카운터 예제 (영구 저장)
  const [count, setCount] = useClientCache<number>("test-counter", 0);

  // 2. TTL이 있는 임시 메시지 (5초 후 만료)
  const [message, setMessage] = useClientCache<string>("test-message", "", {
    ttl: 5000,
  });

  // 3. 압축이 적용된 큰 데이터
  const [todos, setTodos] = useClientCache<TodoItem[]>("test-todos", [], {
    compression: true,
  });

  // 4. 암호화된 사용자 설정
  const [preferences, setPreferences] = useClientCache<UserPreferences>(
    "test-preferences",
    {
      theme: "light",
      fontSize: 16,
      notifications: true,
    },
    {
      encryptionKey: "your-secret-key",
    }
  );

  // 폼 입력을 위한 로컬 상태
  const [todoInput, setTodoInput] = useState("");

  // Todo 추가 핸들러
  const handleAddTodo = async () => {
    if (todoInput.trim()) {
      await setTodos((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: todoInput.trim(),
          completed: false,
        },
      ]);
      setTodoInput("");
    }
  };

  // Todo 토글 핸들러
  const handleToggleTodo = async (id: number) => {
    await setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 테마 토글 핸들러
  const handleToggleTheme = async () => {
    await setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  return (
    <div
      className={`p-6 ${
        preferences.theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
      }`}
    >
      {/* 1. 카운터 테스트 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Persistent Counter Test</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount((prev) => prev - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            -
          </button>
          <span className="text-2xl">{count}</span>
          <button
            onClick={() => setCount((prev) => prev + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            +
          </button>
        </div>
      </section>

      {/* 2. TTL 메시지 테스트 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">TTL Message Test (5s)</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This message will expire in 5s"
            className="px-4 py-2 border rounded text-black"
          />
          <p>Current message: {message || "No message"}</p>
        </div>
      </section>

      {/* 3. 압축된 Todo 리스트 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Compressed Todos Test</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder="Add new todo"
              className="px-4 py-2 border rounded flex-1 text-black"
            />
            <button
              onClick={handleAddTodo}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Todo
            </button>
          </div>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                onClick={() => handleToggleTodo(todo.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  readOnly
                  className="h-4 w-4"
                />
                <span
                  className={`${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. 암호화된 사용자 설정 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Encrypted Preferences Test</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleTheme}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Toggle Theme
            </button>
            <span>Current theme: {preferences.theme}</span>
          </div>
          <div className="flex items-center gap-4">
            <label>Font Size:</label>
            <input
              type="range"
              min="12"
              max="24"
              value={preferences.fontSize}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  fontSize: Number(e.target.value),
                }))
              }
              className="w-48"
            />
            <span>{preferences.fontSize}px</span>
          </div>
          <div className="flex items-center gap-4">
            <label>Notifications:</label>
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  notifications: e.target.checked,
                }))
              }
              className="h-4 w-4"
            />
          </div>
        </div>
      </section>

      {/* 디버그 정보 */}
      <section className="mt-8 p-4 bg-gray-100 rounded dark:bg-gray-700">
        <h2 className="text-xl font-bold mb-4">Debug Info</h2>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(
            {
              count,
              message,
              todosCount: todos.length,
              preferences,
            },
            null,
            2
          )}
        </pre>
      </section>
    </div>
  );
}
