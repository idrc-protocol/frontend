if (typeof globalThis !== "undefined") {
  if (!globalThis.process) {
    globalThis.process = require("process/browser");
  }

  if (!globalThis.Buffer) {
    globalThis.Buffer = require("buffer").Buffer;
  }

  if (!globalThis.indexedDB) {
    const mockIndexedDB = {
      open: () => ({
        result: null,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      }),
      deleteDatabase: () => ({}),
      cmp: () => 0,
    };

    globalThis.indexedDB = mockIndexedDB as any;
    globalThis.IDBKeyRange = {} as any;
    globalThis.IDBCursor = {} as any;
    globalThis.IDBDatabase = {} as any;
    globalThis.IDBIndex = {} as any;
    globalThis.IDBObjectStore = {} as any;
    globalThis.IDBRequest = {} as any;
    globalThis.IDBTransaction = {} as any;
  }

  if (!globalThis.localStorage) {
    const storage = new Map();

    globalThis.localStorage = {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      key: (index: number) => Array.from(storage.keys())[index] || null,
      get length() {
        return storage.size;
      },
    } as Storage;
  }

  if (!globalThis.sessionStorage) {
    globalThis.sessionStorage = globalThis.localStorage;
  }

  // Only set up ethereum property if it doesn't already exist
  // This prevents conflicts with browser wallet extensions
  if (typeof window !== "undefined" && !(window as any).ethereum) {
    try {
      let originalEthereum = (window as any).ethereum;

      Object.defineProperty(window, "ethereum", {
        get() {
          return originalEthereum;
        },
        set(value) {
          if (!originalEthereum || originalEthereum === undefined) {
            originalEthereum = value;
          }
        },
        configurable: true,
      });
    } catch (error) {
      // Silently fail if ethereum property is already defined by extensions
      // This is expected behavior when wallet extensions are present
    }
  }
}

if (typeof global !== "undefined") {
  if (!global.process) {
    global.process = globalThis.process;
  }
  if (!global.Buffer) {
    global.Buffer = globalThis.Buffer;
  }
  if (!global.indexedDB) {
    global.indexedDB = globalThis.indexedDB;
  }
  if (!global.localStorage) {
    global.localStorage = globalThis.localStorage;
  }
  if (!global.sessionStorage) {
    global.sessionStorage = globalThis.sessionStorage;
  }
}
