import { db } from "$lib/config/database";
import type { Product } from "$lib/types/product";
import { liveQuery } from "dexie";

export class ProductRepository {
    async getById(code: string) {
        return db.products.get(code);
    }

    async getAll() {
        return db.products.toArray();
    }

    async add(product: Product) {
        await db.products.put(product);
    }

    async remove(code: string) {
        await db.products.delete(code);
    }

    async clear() {
        await db.products.clear();
    }

    stream() {
        return liveQuery(() =>
            db.products.reverse().toArray(),
        );
    }
}
