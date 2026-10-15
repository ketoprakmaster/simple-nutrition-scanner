class MemoryStorage implements Storage {
    #items = new Map<string, string>();

    get length() {
        return this.#items.size;
    }

    clear() {
        this.#items.clear();
    }

    getItem(key: string) {
        return this.#items.get(key) ?? null;
    }

    key(index: number) {
        return [...this.#items.keys()][index] ?? null;
    }

    removeItem(key: string) {
        this.#items.delete(key);
    }

    setItem(key: string, value: string) {
        this.#items.set(key, String(value));
    }
}

Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
});

if (!("crypto" in globalThis) || !globalThis.crypto?.randomUUID) {
    Object.defineProperty(globalThis, "crypto", {
        value: { randomUUID: () => "00000000-0000-4000-8000-000000000000" },
        configurable: true,
    });
}
