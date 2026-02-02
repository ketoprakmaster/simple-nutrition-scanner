import { browser } from '$app/environment';

class HistoryState {
    items = $state(
        browser ? JSON.parse(localStorage.getItem('scan_history') || '[]') : []
    );

    add(product: unknown) {
        this.items = [product, ...this.items];
        this.save();
    }

    remove(barcode: String) {
        this.items = this.items.filter(item => item.code !== barcode);
        this.save();
    }

    save() {
        if (browser) {
            localStorage.setItem('scan_history', JSON.stringify(this.items));
        }
    }
}

// Export a single instance (singleton)
export const history = new HistoryState();
