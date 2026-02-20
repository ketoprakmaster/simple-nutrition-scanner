import type { NutriScoreGrade, Product } from "$lib/types/product";

// Simplified list of common additives Yuka/OFF flagged as "Red" (Hazardous)
// In a production app, you'd fetch or store a larger dictionary.
const HAZARDOUS_ADDITIVES = ['e102', 'e110', 'e129', 'e150c', 'e150d', 'e250', 'e951'];

export class ProductAnalysis {
    #item: Product | undefined;

    constructor(item: Product | undefined) {
        this.#item = item;
    }

    get exists() { return !!this.#item?.product; }
    get raw() { return this.#item?.product; }

    private get nutritionPoints(): number {
        const grade = this.raw?.nutriscore_grade?.toLowerCase() as NutriScoreGrade;
        const map: Record<string, number> = { a: 60, b: 45, c: 30, d: 15, e: 0 };
        return map[grade || ''] ?? 0;
    }

    private get additivePoints(): number {
        const additives = this.raw?.additives_tags || [];
        if (additives.length === 0) return 30;

        // Clean the strings (e.g., "en:e150c" -> "e150c")
        const ids = additives.map(a => a.split(':').pop()?.toLowerCase());

        const hasHazardous = ids.some(id => HAZARDOUS_ADDITIVES.includes(id || ''));

        if (hasHazardous) return 0; // High penalty
        if (ids.length > 3) return 15; // "Moderate" penalty for quantity
        return 25; // Minor penalty for "Safe" additives
    }

    private get organicPoints(): number {
        const labels = this.raw?.labels_tags || [];
        return labels.some(l => l.includes('organic')) ? 10 : 0;
    }

    get scoreValue(): number {
        if (!this.exists) return 0;

        let total = this.nutritionPoints + this.additivePoints + this.organicPoints;

        // Logic: If there is a hazardous additive, cap the total score at 49.
        const additives = this.raw?.additives_tags || [];
        const ids = additives.map(a => a.split(':').pop()?.toLowerCase());
        const hasHazardous = ids.some(id => HAZARDOUS_ADDITIVES.includes(id || ''));

        if (hasHazardous && total > 49) {
            total = 49;
        }

        return Math.min(100, total);
    }

    get scoreLabel(): string {
        const s = this.scoreValue;
        if (s >= 75) return "Excellent";
        if (s >= 50) return "Good";
        if (s >= 25) return "Mediocre";
        return "Poor";
    }

    get colorClass(): string {
        const s = this.scoreValue;
        if (s >= 75) return 'text-green-600';
        if (s >= 50) return 'text-green-400';
        if (s >= 25) return 'text-yellow-500';
        return 'text-red-600';
    }

    get BgClass(): string {
        const s = this.scoreValue;
        if (s >= 75) return 'bg-green-600';
        if (s >= 50) return 'bg-green-400';
        if (s >= 25) return 'bg-yellow-500';
        return 'bg-red-600';

    }

    get nutrients() {
        if (!this.raw) return [];
        const levels = this.raw.nutrient_levels || {};
        const nutriments = this.raw.nutriments || {};

        return [
            { key: 'sugars', label: 'Sugar', icon: '🍭', unit: 'g' },
            { key: 'salt', label: 'Salt', icon: '🧂', unit: 'g' },
            { key: 'saturated-fat', label: 'Saturated Fat', icon: '🥓', unit: 'g' },
            { key: 'fat', label: 'Fat', icon: '🛢️', unit: 'g' }
        ].map(cfg => {
            const level = levels[cfg.key as keyof typeof levels];
            const val = nutriments[`${cfg.key}_100g`];
            return {
                ...cfg,
                level,
                displayValue: typeof val === 'number' ? val.toFixed(1) : '0',
                levelLabel: level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown',
                levelColor: level === 'low' ? 'bg-green-500' : level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
            };
        }).filter(n => n.level);
    }

    get nova() {
        const group = this.raw?.nova_group;
        const labels: Record<number, string> = {
            1: 'Unprocessed', 2: 'Culinary', 3: 'Processed', 4: 'Ultra-processed'
        };
        return { group, label: labels[group as number] || 'Unknown' };
    }
}
