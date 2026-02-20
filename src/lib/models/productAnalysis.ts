import type { NutriScoreGrade, Product } from "$lib/types/product";

const gradeColors = {
    a: 'text-green-600', b: 'text-green-400', c: 'text-yellow-400',
    d: 'text-orange-500', e: 'text-red-600', unknown: 'text-gray-300'
};

const gradeBgColors = {
    a: 'bg-green-600', b: 'bg-green-400', c: 'bg-yellow-400',
    d: 'bg-orange-500', e: 'bg-red-600', unknown: 'bg-gray-300'
};

const scoreMap: Record<string, { label: string; value: number }> = {
    a: { label: "Excellent", value: 90 },
    b: { label: "Good", value: 70 },
    c: { label: "Mediocre", value: 45 },
    d: { label: "Poor", value: 25 },
    e: { label: "Bad", value: 10 },
    unknown: { label: "Unknown", value: 0 }
};

export class ProductAnalysis {
    #item: Product | undefined;

    constructor(item: Product | undefined) {
        this.#item = item;
    }

    get exists() { return !!this.#item?.product; }
    get raw() { return this.#item?.product; }

    get grade(): NutriScoreGrade {
        return this.raw?.nutriscore_grade?.toLowerCase() as NutriScoreGrade;
    }

    get scoreValue() {
        return scoreMap[this.grade]?.value ?? 0;
    }

    get scoreLabel() {
        return scoreMap[this.grade]?.label ?? "Unknown";
    }

    get colorClass() { return gradeColors[this.grade] || gradeColors.unknown; }
    get bgClass() { return gradeBgColors[this.grade] || gradeBgColors.unknown; }

    // This complex calculation only runs if it calles it
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
