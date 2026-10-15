import type { Product } from "$lib/types/product";

/**
 * Dexie returns rows in primary-key order, which for products is the barcode —
 * not the scan order the history feed promises. Sort on the scan timestamp and
 * fall back to the barcode only for rows that predate the field, so the order
 * stays stable for older databases.
 */
export function newestFirst(products: Product[]): Product[] {
    return [...products].sort((a, b) => {
        const left = a.scannedAt ?? 0;
        const right = b.scannedAt ?? 0;
        if (left !== right) return right - left;
        return b.code.localeCompare(a.code);
    });
}
