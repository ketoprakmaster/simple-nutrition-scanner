/**
 * Live ingestion check against the real Open Food Facts API — the only test
 * that proves the app's request headers, URL and parsing still match production.
 *
 * Network-dependent: run it explicitly with
 *   bunx vitest run tests/apiIngestion.live.test.ts
 * and deselect it in offline environments with `--exclude '**\/*.live.test.ts'`.
 */
import { describe, expect, it } from "vitest";
import { ProductService, type ProductStore } from "$lib/services/productService";
import { productFetch } from "$lib/services/api/apiClientFetch";
import { ProductAnalysis } from "$lib/models/productAnalysis";
import type { Product } from "$lib/types/product";

const TIMEOUT = 45_000;

/** Known barcodes with different real-world payload shapes. */
const CASES = [
    { code: "3017620422003", name: /nutella/i, grade: "e", nova: 4 },
    { code: "5449000000996", name: /coca/i, grade: "e", nova: 4 },
    { code: "20724696", name: /amandes/i, grade: "a", nova: 1 }
];

function recordingStore() {
    const rows = new Map<string, Product>();
    const store: ProductStore = {
        getById: async (code: string) => rows.get(code),
        add: async (product: Product) => {
            rows.set(product.code, product);
        }
    };
    return { store, rows };
}

describe("live Open Food Facts ingestion", () => {
    it("sends the documented URL and app identity to the real API", async () => {
        const realFetch = globalThis.fetch;
        let seen: { url: string; userAgent: string | null } | undefined;

        // stands in for the network boundary so the real request shape is observable
        globalThis.fetch = Object.assign(
            async (input: RequestInfo | URL, init?: RequestInit) => {
                const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
                seen = { url, userAgent: new Headers(init?.headers).get("User-Agent") };
                return realFetch(input, init);
            },
            realFetch
        );

        try {
            const res = await productFetch("3017620422003");
            expect(res.status).toBe(200);
        } finally {
            globalThis.fetch = realFetch;
        }

        expect(seen?.url).toBe("https://world.openfoodfacts.org/api/v2/product/3017620422003.json");
        expect(seen?.userAgent).toMatch(/^Simple-Nutrition-Scanner\/\d/);
        expect(seen?.userAgent).toMatch(/APP_ID=/);
    }, TIMEOUT);

    it("ingests a scanned barcode through the default network client", async () => {
        const { store } = recordingStore();
        const service = new ProductService({ repo: store });

        expect(await service.lookup("3017620422003")).toEqual({
            type: "found",
            code: "3017620422003",
            fromCache: false
        });
    }, TIMEOUT);

    it.each(CASES)("ingests $code ($name) into a usable product", async ({ code, name, grade, nova }) => {
        const { store, rows } = recordingStore();
        const service = new ProductService({ repo: store });

        const result = await service.lookup(code);

        expect(result).toEqual({ type: "found", code, fromCache: false });

        const stored = rows.get(code);
        expect(stored?.product.product_name).toMatch(name);
        expect(stored?.product.nutriscore_grade).toBe(grade);
        expect(stored?.product.nova_group).toBe(nova);

        const analysis = new ProductAnalysis(stored);
        expect(analysis.exists).toBe(true);
        expect(analysis.score).toBeGreaterThanOrEqual(0);
        expect(analysis.nutrients.length).toBe(4);
        expect(analysis.nutrients.filter(row => row.value !== "?").length).toBeGreaterThan(0);
    }, TIMEOUT);

    it("serves a second lookup of the same barcode from the store", async () => {
        const { store, rows } = recordingStore();
        const service = new ProductService({ repo: store });

        await service.lookup("3017620422003");
        const before = rows.size;

        const result = await service.lookup("3017620422003");

        expect(result).toEqual({ type: "found", code: "3017620422003", fromCache: true });
        expect(rows.size).toBe(before);
    }, TIMEOUT);

    it("reports a barcode that is not in the database as not_found", async () => {
        const { store } = recordingStore();
        const service = new ProductService({ repo: store });

        expect(await service.lookup("0000000000001")).toEqual({ type: "not_found", code: "0000000000001" });
    }, TIMEOUT);
});
