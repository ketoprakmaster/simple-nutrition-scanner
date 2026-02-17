import Dexie, { type Table } from 'dexie';
import type { Product } from '$lib/api/state.svelte';

export class ScanDatabase extends Dexie {
    // 'products' is the table name
    products!: Table<Product>;

    constructor() {
        super('FoodScanDB');
        this.version(1).stores({
            // Primary key is 'code', we index 'product.product_name' for searching
            products: 'code, product.product_name, product.brands'
        });
    }
}

export const db = new ScanDatabase();
