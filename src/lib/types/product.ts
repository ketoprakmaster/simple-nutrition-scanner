export type NutriScoreGrade =
    "a" | "b" | "c" | "d" | "e" | "unknown";

/** Eco-Score letters as published by Open Food Facts; non-grades are dropped at parse time. */
export type EcoScoreGrade = "a" | "b" | "c" | "d" | "e";

export type NutrientLevel = "low" | "moderate" | "high";

export type Product = {
    code: string;
    product: {
        product_name: string;
        brands?: string;
        image_url?: string;
        image_front_url?: string;
        nutriscore_grade?: NutriScoreGrade;
        nutriscore_score?: number;
        nova_group?: number;
        ecoscore_grade?: EcoScoreGrade;
        ingredients_text_en?: string;
        ingredients_text?: string;
        additives_tags?: string[];
        labels_tags?: string[];
        nutrient_levels?: {
            fat?: NutrientLevel;
            salt?: NutrientLevel;
            "saturated-fat"?: NutrientLevel;
            sugars?: NutrientLevel;
        };
        nutriments: Record<string, number | string>;
    };
}
