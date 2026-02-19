class ProductCachePolicy {

    #blacklist = new Set<string>();

    isBlacklisted(code:string) {
        return this.#blacklist.has(code);
    }

    addToBlacklist(code:string) {
        this.#blacklist.add(code);
    }

    clear() {
        this.#blacklist.clear();
    }
}

export const productCache = new ProductCachePolicy();
