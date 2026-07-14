import type { NutriScoreGrade, Product, NutrientLevel } from "$lib/types/product";
import additivesMap from '$lib/data/additives-min.json' with { type: "json" };
import { settings } from "$lib/core/settings.svelte";

// Move these to a constants file later
const NUTRI_POINTS: Record<NutriScoreGrade, number> = { a: 60, b: 45, c: 30, d: 15, e: 0, unknown: 0 };
const NUTRI_SCORE_UI: Record<NutriScoreGrade, number> = { a: 100, b: 75, c: 50, d: 25, e: 10, unknown: 0 };

export class ProductAnalysis {
    readonly #product: Product['product'] | undefined;

    constructor(item: Product | undefined) {
        this.#product = item?.product;
    }

    get exists() { return !!this.#product; }

    /**
     * Internal Calculation: App-specific scoring logic
     */
    private calculateAppScore(): number {
        if (!this.#product) return 0;

        // 1. Nutrition Base
        const grade = (this.#product.nutriscore_grade?.toLowerCase() || 'e') as NutriScoreGrade;
        const nutritionBase = NUTRI_POINTS[grade] ?? 0;

        // 2. Additives
        const { score: additiveScore, hasHazardous } = this.getAdditiveImpact();

        // 3. Organic Bonus
        const labels = this.#product.labels_tags || [];
        const organicBonus = labels.some(l => l.includes('organic')) ? 10 : 0;

        let total = nutritionBase + additiveScore + organicBonus;

        // Penalty for hazardous additives (Yuka style)
        if (hasHazardous) total = Math.min(total, 49);

        return Math.min(100, Math.max(0, total));
    }

    private getAdditiveImpact() {
        const tags = this.#product?.additives_tags || [];
        let score = 30;
        let hasHazardous = false;

        for (const tag of tags) {
            const info = (additivesMap as any)[tag];
            if (!info) continue;

            if (info.r === 3) { score -= 20; hasHazardous = true; }
            else if (info.r === 2) { score -= 10; }
            else if (info.r === 1) { score -= 5; }
        }

        return { score: Math.max(0, score), hasHazardous };
    }

    /**
     * Public API: Formatting & UI
     */
    get score(): number {
        if (settings.useCustomScore === 'nutriscore') {
            const grade = (this.#product?.nutriscore_grade?.toLowerCase() || 'unknown') as NutriScoreGrade;
            return NUTRI_SCORE_UI[grade];
        }
        return this.calculateAppScore();
    }

    get rating() {
        const s = this.score;
        if (s >= 90) return {score: 'A', label: "Excellent", color: "green-600", hex: "#16a34a" };
        if (s >= 75) return {score: 'B', label: "Good", color: "green-400", hex: "#4ade80" };
        if (s >= 60) return {score: 'C', label: "Mediocre", color: "yellow-500", hex: "#eab308" };
        if (s >= 45) return {score: 'D', label: "Poor", color: "orange-600", hex: "#dc2626" };
        if (s > 0) return {score: 'E', label: "Very Poor", color: "red-600", hex: "#dc2626" };
        return {score: '?', label: "Unknown", color: "grey-200", hex:""}
    }

    get nutrients() {
        if (!this.#product) return [];

        const { nutrient_levels: levels = {}, nutriments = {} } = this.#product;

        const CONFIG = [
            { id: 'sugars', label: 'Sugar', icon: '🍭' },
            { id: 'salt', label: 'Salt', icon: '🧂' },
            { id: 'saturated-fat', label: 'Sat. Fat', icon: '🥓' },
            { id: 'fat', label: 'Fat', icon: '🛢️' }
        ];

        return CONFIG.map(item => {
            const level = levels[item.id as keyof typeof levels] as NutrientLevel;

            const standardKey = `${item.id}_100g`;
            const preparedKey = `${item.id}_prepared_100g`;

            const value = nutriments[standardKey] ?? nutriments[preparedKey];

            return {
                ...item,
                level: level || 'unknown',
                value: typeof value === 'number' ? value.toFixed(1) : '?',
                unit: 'g',
                color: this.getLevelColor(level)
            };
        });
    }

    private getLevelColor(level: NutrientLevel | undefined) {
        switch (level) {
            case 'low': return 'bg-green-500';
            case 'moderate': return 'bg-yellow-500';
            case 'high': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    }
}
