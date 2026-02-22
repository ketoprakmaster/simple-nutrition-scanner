import type { Product } from "$lib/types/product";


// safely extract the calorie value
export function getCalories(item: Product) {
    if (!item.product.nutriments) return { value: 0, unit: 'kcal' };

    if (item.product.nutriments['energy-kcal_100g'] !== undefined) {
        return {
            value: Math.round(Number(item.product.nutriments['energy-kcal_100g'])),
            unit: 'kcal'
        };
    }

    if (item.product.nutriments['energy-kj_100g'] !== undefined) {
        return {
            value: Math.round(Number(item.product.nutriments['energy-kj_100g']) * 0.239),
            unit: 'kcal'
        };
    }

    return { value: 0, unit: 'kcal' };
}
