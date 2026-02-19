import type { Product } from '$lib/types/product';
import Dexie, { type Table } from 'dexie';

export class ScanDatabase extends Dexie {
    products!: Table<Product>;

    constructor() {
        super('FoodScanDB');
        this.version(1).stores({
            products: 'code, product.product_name, product.brands'
        });
    }
}

export const db = new ScanDatabase();
