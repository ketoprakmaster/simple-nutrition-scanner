import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProductAnalysis } from "$lib/models/productAnalysis";
import { settings } from "$lib/core/settings.svelte";
import type { Product } from "$lib/types/product";
import { parseProductPayload } from "$lib/services/api/productParse";
import { envelope, nutella, organicAlmonds } from "./fixtures";

function toProduct(fixture: unknown): Product {
    const parsed = parseProductPayload(fixture);
    if (parsed.type !== "product") throw new Error("fixture is not a product envelope");
    return parsed.product;
}

function product(overrides: Record<string, unknown> = {}): Product {
    const parsed = parseProductPayload(envelope(overrides));
    if (parsed.type !== "product") throw new Error("bad test product");
    return parsed.product;
}

describe("ProductAnalysis", () => {
    beforeEach(() => {
        settings.useCustomScore = "nutriscore";
    });

    afterEach(() => {
        settings.useCustomScore = "nutriscore";
    });

    describe("empty analysis", () => {
        const empty = new ProductAnalysis(undefined);

        it("reports that nothing exists", () => {
            expect(empty.exists).toBe(false);
            expect(empty.score).toBe(0);
            expect(empty.nutrients).toEqual([]);
            expect(empty.additives).toEqual([]);
            expect(empty.calories.available).toBe(false);
        });

        it("falls back to readable placeholders", () => {
            expect(empty.name).toBe("Unknown product");
            expect(empty.brands).toBe("Unknown Brand");
            expect(empty.nutriscoreGrade).toBe("unknown");
            expect(empty.rating.grade).toBe("?");
        });
    });

    describe("nutriscore mode", () => {
        it.each([
            ["a", 100],
            ["b", 75],
            ["c", 50],
            ["d", 25],
            ["e", 10]
        ])("maps grade %s to %i", (grade, expected) => {
            const analysis = new ProductAnalysis(product({ nutriscore_grade: grade }), { useCustomScore: "nutriscore" });
            expect(analysis.score).toBe(expected);
        });

        it("scores an unknown grade as zero", () => {
            const analysis = new ProductAnalysis(product({ nutriscore_grade: "not-a-grade" }), {
                useCustomScore: "nutriscore"
            });

            expect(analysis.nutriscoreGrade).toBe("unknown");
            expect(analysis.score).toBe(0);
            expect(analysis.rating.grade).toBe("?");
        });

        it("reports a single nutriscore reason", () => {
            const analysis = new ProductAnalysis(toProduct(nutella), { useCustomScore: "nutriscore" });

            expect(analysis.scoreReasons).toEqual([
                { id: "nutrition", label: "Nutri-Score E", points: 10 }
            ]);
        });

        it("follows the global setting when no override is given", () => {
            const item = toProduct(organicAlmonds);

            expect(new ProductAnalysis(item).score).toBe(100);

            settings.useCustomScore = "app";
            expect(new ProductAnalysis(item).score).toBe(90);
        });
    });

    describe("app score mode", () => {
        it("gives a clean Nutri-Score A product the full additive allowance", () => {
            const analysis = new ProductAnalysis(toProduct(organicAlmonds), { useCustomScore: "app" });

            expect(analysis.score).toBe(90);
            expect(analysis.isOrganic).toBe(false);
            expect(analysis.rating).toMatchObject({ grade: "A", label: "Excellent" });
        });

        it("caps a hazardous additive product below 50", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:e202"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.score).toBe(49);
            expect(analysis.rating).toMatchObject({ grade: "D", label: "Poor" });
            expect(analysis.riskOf("en:e202")).toBe(3);
        });

        it("deducts for moderate additives without capping", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:e955"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.riskOf("en:e955")).toBe(2);
            expect(analysis.score).toBe(70);
        });

        it("deducts for low-risk additives", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:e150d"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.riskOf("en:e150d")).toBe(1);
            expect(analysis.score).toBe(82);
        });

        it("never lets additives push the score above the clean baseline", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:e150d", "en:e955", "en:e202"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.score).toBeLessThanOrEqual(90);
        });

        it("adds the organic bonus on top of the additive allowance", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "c", labels_tags: ["en:organic", "fr:triman"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.isOrganic).toBe(true);
            expect(analysis.score).toBe(70);
        });

        it("never leaves the 0-100 range", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "e", additives_tags: ["en:e202", "en:e202"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.score).toBe(0);
            expect(analysis.rating.grade).toBe("?");
        });

        it("explains the score with reasons that add up to it", () => {
            const analysis = new ProductAnalysis(toProduct(organicAlmonds), { useCustomScore: "app" });
            const total = analysis.scoreReasons.reduce((sum, reason) => sum + reason.points, 0);

            expect(total).toBe(analysis.score);
            expect(analysis.scoreReasons.map(reason => reason.id)).toEqual(["nutrition", "additives"]);
        });

        it("adds an explicit organic reason for an organic-labelled product", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "b", labels_tags: ["en:organic"] }),
                { useCustomScore: "app" }
            );
            const total = analysis.scoreReasons.reduce((sum, reason) => sum + reason.points, 0);

            expect(analysis.score).toBe(85);
            expect(total).toBe(analysis.score);
            expect(analysis.scoreReasons.map(reason => reason.id)).toEqual(["nutrition", "additives", "organic"]);
        });

        it("shows the hazard cap as a negative reason", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:e202"] }),
                { useCustomScore: "app" }
            );

            const total = analysis.scoreReasons.reduce((sum, reason) => sum + reason.points, 0);
            const cap = analysis.scoreReasons.find(reason => reason.id === "hazard-cap");

            expect(total).toBe(analysis.score);
            expect(cap?.points).toBeLessThan(0);
        });

        it("ignores additives that are missing from the reference data", () => {
            const analysis = new ProductAnalysis(
                product({ nutriscore_grade: "a", additives_tags: ["en:not-in-the-database"] }),
                { useCustomScore: "app" }
            );

            expect(analysis.riskOf("en:not-in-the-database")).toBe(0);
            expect(analysis.score).toBe(90);
        });
    });

    describe("nutrients", () => {
        it("reads the real per-100g values and levels", () => {
            const rows = new ProductAnalysis(toProduct(nutella), { useCustomScore: "app" }).nutrients;

            expect(rows.map(row => row.id)).toEqual(["sugars", "salt", "saturated-fat", "fat"]);
            expect(rows[0]).toMatchObject({ label: "Sugar", value: "56.3", unit: "g", level: "high" });
            expect(rows[1]).toMatchObject({ value: "0.1", level: "low" });
        });

        it("prefers the plain value and unit when no 100g key exists", () => {
            const analysis = new ProductAnalysis(
                product({ nutriments: { salt_value: "1.25", salt_unit: "g" } }),
                { useCustomScore: "app" }
            );

            const salt = analysis.nutrients.find(row => row.id === "salt");
            expect(salt).toMatchObject({ value: "1.3", unit: "g", level: "unknown", color: "bg-gray-400" });
        });

        it("falls back to the prepared measurement", () => {
            const analysis = new ProductAnalysis(
                product({ nutriments: { sugars_prepared_100g: 8 } }),
                { useCustomScore: "app" }
            );

            expect(analysis.nutrients.find(row => row.id === "sugars")?.value).toBe("8.0");
        });

        it("marks a nutrient with no data as unknown", () => {
            const analysis = new ProductAnalysis(product({ nutriments: {} }), { useCustomScore: "app" });

            expect(analysis.nutrients.find(row => row.id === "fat")).toMatchObject({ value: "?", level: "unknown" });
        });
    });

    describe("calories", () => {
        it("uses the kcal value when present", () => {
            expect(new ProductAnalysis(toProduct(nutella)).calories).toEqual({
                value: 539,
                unit: "kcal",
                available: true
            });
        });

        it("converts kilojoules when only kJ is published", () => {
            const analysis = new ProductAnalysis(product({ nutriments: { "energy-kj_100g": 2567 } }));

            expect(analysis.calories).toEqual({ value: 614, unit: "kcal", available: true });
        });

        it("converts prepared kilojoules instead of treating them as kcal", () => {
            const analysis = new ProductAnalysis(product({ nutriments: { "energy-kj_prepared_100g": 1000 } }));

            expect(analysis.calories.value).toBe(239);
        });

        it("reports missing energy", () => {
            expect(new ProductAnalysis(product({ nutriments: {} })).calories.available).toBe(false);
        });
    });

    describe("presentation helpers", () => {
        it("prefers the front image and falls back to the generic one", () => {
            expect(new ProductAnalysis(toProduct(nutella)).imageUrl).toContain("front_en");
            expect(new ProductAnalysis(product({ image_url: "https://example.test/x.jpg" })).imageUrl).toBe(
                "https://example.test/x.jpg"
            );
        });

        it("prefers the English ingredients text", () => {
            const analysis = new ProductAnalysis(
                product({ ingredients_text: "sucre", ingredients_text_en: "sugar" })
            );

            expect(analysis.ingredientsText).toBe("sugar");
        });

        it("labels known additives with their stored name and risk", () => {
            const analysis = new ProductAnalysis(product({ additives_tags: ["en:e202", "en:e955", "en:e150d"] }));

            expect(analysis.additives).toEqual([
                { tag: "en:e202", name: "Potassium sorbate", risk: 3, code: "HAZARD" },
                { tag: "en:e955", name: "Sucralose", risk: 2, code: "MODERATE" },
                { tag: "en:e150d", name: "Sulphite ammonia caramel", risk: 1, code: "RISK" }
            ]);
        });

        it("humanises additives missing from the reference data instead of hiding them", () => {
            const analysis = new ProductAnalysis(toProduct(nutella));

            expect(analysis.additives).toEqual([
                { tag: "en:e322", name: "E322", risk: 0, code: "?" },
                { tag: "en:e322i", name: "E322I", risk: 0, code: "?" }
            ]);
        });
    });
});
