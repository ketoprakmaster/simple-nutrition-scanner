import { browser } from '$app/environment';

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
    items = $state<Product[]>(
        browser ? JSON.parse(localStorage.getItem('scan_history') || '[]') : []
    );

    loading = $state(false);
    error = $state<string | null>(null);

    // Get an item from cache
    getById(id: string) {
        return this.items.find(i => i.code === id);
    }

    add(product: Product) {
        // Prevent duplicates in history
        this.items = [product, ...this.items.filter(i => i.code !== product.code)];
        this.save();
    }

    remove(barcode: string) {
        this.items = this.items.filter(item => item.code !== barcode);
        this.save();
    }

    private save() {
        if (browser) {
            localStorage.setItem('scan_history', JSON.stringify(this.items));
        }
    }
}

export const history = new HistoryState();
