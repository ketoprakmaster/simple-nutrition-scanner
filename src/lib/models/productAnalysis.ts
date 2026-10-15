import type { NutriScoreGrade, NutrientLevel, Product } from "$lib/types/product";
import { additives, type AdditiveImpact, type AdditiveInfo } from "$lib/services/additiveService";
import { settings } from "$lib/core/settings.svelte";

export type ScoreFunction = "nutriscore" | "app";

export type ScoreOptions = { useCustomScore?: ScoreFunction };

export type Rating = {
    grade: string;
    label: string;
    color: string;
    hex: string;
};

/** One score contribution, so the UI can explain a rating instead of just showing it. */
export type ScoreReason = {
    id: "nutrition" | "additives" | "organic" | "hazard-cap";
    label: string;
    points: number;
};

export type NutrientRow = {
    id: string;
    label: string;
    icon: string;
    value: string;
    unit: string;
    level: NutrientLevel | "unknown";
    color: string;
};

export type CalorieInfo = {
    value: number;
    unit: string;
    available: boolean;
};

const NUTRI_POINTS: Record<NutriScoreGrade, number> = { a: 60, b: 45, c: 30, d: 15, e: 0, unknown: 0 };
const NUTRI_SCORE_UI: Record<NutriScoreGrade, number> = { a: 100, b: 75, c: 50, d: 25, e: 10, unknown: 0 };
const MAX_ADDITIVE_POINTS = 30;
const ORGANIC_BONUS = 10;
const HAZARD_CAP = 49;
const KJ_TO_KCAL = 0.239;

const GRADES: readonly NutriScoreGrade[] = ["a", "b", "c", "d", "e", "unknown"];

const NUTRIENT_CONFIG = [
    { id: "sugars", label: "Sugar", icon: "🍭" },
    { id: "salt", label: "Salt", icon: "🧂" },
    { id: "saturated-fat", label: "Sat. Fat", icon: "🥓" },
    { id: "fat", label: "Fat", icon: "🛢️" }
] as const;

const LEVEL_COLORS: Record<NutrientLevel | "unknown", string> = {
    low: "bg-green-500",
    moderate: "bg-yellow-500",
    high: "bg-red-500",
    unknown: "bg-gray-400"
};

const UNKNOWN_REASONS: ScoreReason[] = [
    { id: "nutrition", label: "No nutrition data", points: 0 }
];

export class ProductAnalysis {
    readonly #product: Product["product"] | undefined;
    readonly #scoreFunction: ScoreFunction;
    readonly #additiveImpact: AdditiveImpact;

    constructor(item: Product | undefined, options: ScoreOptions = {}) {
        this.#product = item?.product;
        this.#scoreFunction = options.useCustomScore ?? (settings.useCustomScore as ScoreFunction);
        this.#additiveImpact = additives.impact(this.#product?.additives_tags);
    }

    get exists() {
        return !!this.#product;
    }

    get name(): string {
        return this.#product?.product_name?.trim() || "Unknown product";
    }

    get brands(): string {
        return this.#product?.brands?.trim() || "Unknown Brand";
    }

    get imageUrl(): string | undefined {
        return this.#product?.image_front_url || this.#product?.image_url;
    }

    get nutriscoreGrade(): NutriScoreGrade {
        const grade = this.#product?.nutriscore_grade?.toLowerCase();
        return GRADES.includes(grade as NutriScoreGrade) ? (grade as NutriScoreGrade) : "unknown";
    }

    get novaGroup(): number | undefined {
        return this.#product?.nova_group;
    }

    get ingredientsText(): string | undefined {
        return this.#product?.ingredients_text_en || this.#product?.ingredients_text;
    }

    get isOrganic(): boolean {
        return (this.#product?.labels_tags ?? []).some(label => label.includes("organic"));
    }

    /**
     * Public API: score, rating and the reasons behind them.
     */
    get score(): number {
        return this.#scoreFunction === "app" ? this.calculateAppScore() : NUTRI_SCORE_UI[this.nutriscoreGrade];
    }

    /** Contribution of every scoring rule, already clamped to the final score. */
    get scoreReasons(): ScoreReason[] {
        if (!this.#product) return UNKNOWN_REASONS;

        if (this.#scoreFunction !== "app") {
            return [
                {
                    id: "nutrition",
                    label: `Nutri-Score ${this.nutriscoreGrade.toUpperCase()}`,
                    points: this.score
                }
            ];
        }

        const nutrition = NUTRI_POINTS[this.nutriscoreGrade];
        const additivePoints = Math.max(0, MAX_ADDITIVE_POINTS - this.#additiveImpact.penalty);
        const organic = this.isOrganic ? ORGANIC_BONUS : 0;
        const raw = nutrition + additivePoints + organic;
        const reasons: ScoreReason[] = [
            { id: "nutrition", label: `Nutrition (Nutri-Score ${this.nutriscoreGrade.toUpperCase()})`, points: nutrition },
            { id: "additives", label: "Additives", points: additivePoints }
        ];

        if (organic) reasons.push({ id: "organic", label: "Organic label", points: organic });

        if (this.#additiveImpact.hasHazardous && raw > HAZARD_CAP) {
            reasons.push({ id: "hazard-cap", label: "Hazardous additive cap", points: HAZARD_CAP - raw });
        }

        return reasons;
    }

    get rating(): Rating {
        const s = this.score;
        if (s >= 90) return { grade: "A", label: "Excellent", color: "green-600", hex: "#16a34a" };
        if (s >= 75) return { grade: "B", label: "Good", color: "green-400", hex: "#4ade80" };
        if (s >= 60) return { grade: "C", label: "Mediocre", color: "yellow-500", hex: "#eab308" };
        if (s >= 45) return { grade: "D", label: "Poor", color: "orange-600", hex: "#dc2626" };
        if (s > 0) return { grade: "E", label: "Very Poor", color: "red-600", hex: "#dc2626" };
        return { grade: "?", label: "Unknown", color: "grey-200", hex: "" };
    }

    get nutrients(): NutrientRow[] {
        if (!this.#product) return [];

        const levels = this.#product.nutrient_levels ?? {};
        const nutriments = this.#product.nutriments ?? {};

        return NUTRIENT_CONFIG.map(item => {
            const level = (levels[item.id] as NutrientLevel | undefined) ?? "unknown";
            const { value, unit } = readNutrient(nutriments, item.id);

            return {
                id: item.id,
                label: item.label,
                icon: item.icon,
                value,
                unit,
                level,
                color: LEVEL_COLORS[level]
            };
        });
    }

    get additives(): AdditiveInfo[] {
        return additives.list(this.#product?.additives_tags);
    }

    riskOf(tag: string) {
        return additives.riskOf(this.#additiveImpact, tag);
    }

    get calories(): CalorieInfo {
        return readCalories(this.#product?.nutriments ?? {});
    }

    /**
     * Internal Calculation: App-specific scoring logic
     */
    private calculateAppScore(): number {
        if (!this.#product) return 0;

        const nutritionBase = NUTRI_POINTS[this.nutriscoreGrade];
        const additivePoints = Math.max(0, MAX_ADDITIVE_POINTS - this.#additiveImpact.penalty);
        const organicBonus = this.isOrganic ? ORGANIC_BONUS : 0;

        let total = nutritionBase + additivePoints + organicBonus;

        // Penalty for hazardous additives (Yuka style)
        if (this.#additiveImpact.hasHazardous) total = Math.min(total, HAZARD_CAP);

        return Math.min(100, Math.max(0, total));
    }
}

function readNutrient(nutriments: Record<string, number | string>, id: string): { value: string; unit: string } {
    // Open Food Facts only publishes `_value`/`_unit` for some products (salt and sodium especially)
    const keys = [`${id}_100g`, `${id}_prepared_100g`, id, `${id}_value`] as const;

    for (const key of keys) {
        const parsed = toFiniteNumber(nutriments[key]);
        if (parsed !== undefined) {
            const unit = nutriments[`${id}_unit`];
            return { value: parsed.toFixed(1), unit: unit ? String(unit) : "g" };
        }
    }

    return { value: "?", unit: "g" };
}

function readCalories(nutriments: Record<string, number | string>): CalorieInfo {
    const candidates: Array<[string, number]> = [
        ["energy-kcal_100g", 1],
        ["energy-kcal_prepared_100g", 1],
        ["energy-kj_100g", KJ_TO_KCAL],
        ["energy-kj_prepared_100g", KJ_TO_KCAL],
        ["energy_100g", KJ_TO_KCAL]
    ];

    for (const [key, factor] of candidates) {
        const parsed = toFiniteNumber(nutriments[key]);
        if (parsed !== undefined) {
            return { value: Math.round(parsed * factor), unit: "kcal", available: true };
        }
    }

    return { value: 0, unit: "kcal", available: false };
}

/** Open Food Facts publishes numbers as numbers *and* as numeric strings. */
function toFiniteNumber(raw: number | string | undefined): number | undefined {
    if (raw === undefined || raw === null || raw === "") return undefined;

    const parsed = typeof raw === "number" ? raw : Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
}
