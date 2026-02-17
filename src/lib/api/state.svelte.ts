import { db } from '$lib/config/db';
import { ui } from '$lib/alert.svelte'
import { liveQuery } from 'dexie';

// Define types for NutriScore
type NutriScoreGrade = "a" | "b" | "c" | "d" | "e" | "unknown";

// Define types for Product
export interface Product {
    code: string;
    product: {
        product_name: string;
        brands: string;
        image_url: string;
        nutriscore_grade: NutriScoreGrade;
        nutriments: Record<string, number | string>;
    };
}

class HistoryState {
    private _items = $state<Product[]>([]);

    constructor() {
        liveQuery(() => db.products.reverse().toArray()).subscribe((items) => {
            this._items = items;
        });
    }

    async clearAll() {
            try {
                await db.products.clear();
            } catch (err) {
                ui.show("Failed to clear history:", "error");
            }
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

    async getById(code: string | undefined) {
        return await db.products.get(code);
    }
}

export const history = new HistoryState();
