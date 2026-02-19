export type NutriScoreGrade =
    "a" | "b" | "c" | "d" | "e" | "unknown";

export type Product = {
    code: string;
    product: {
        product_name: string;
        brands: string;
        image_url: string;
        nutriscore_grade: NutriScoreGrade;
        nutriments: Record<string, number | string>;
    };
}
