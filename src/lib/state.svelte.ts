import { db } from './db';
import { liveQuery } from 'dexie';

// Define types for better DX
export interface Product {
    code: string;
    product: {
        product_name: string;
        brands: string;
        image_url: string;
        nutriscore_grade: string;
        nutriments: Record<string, number | string>;
    };
}

class HistoryState {
    private _items = $state<Product[]>([]);

    loading = $state(false);
    error = $state<string | null>(null);

    constructor() {
        // Initialize the live observer
        liveQuery(() => db.products.reverse().toArray()).subscribe((items) => {
            this._items = items;
        });
    }

    get items() {
        return this._items;
    }

    async add(product: Product) {
        await db.products.put(product);
    }

    async remove(code: string) {
        await db.products.delete(code);
    }

    async getById(code: string) {
        return await db.products.get(code);
    }
}

export const history = new HistoryState();
