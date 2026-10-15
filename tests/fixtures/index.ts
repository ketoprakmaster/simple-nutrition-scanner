import nutellaJson from "./nutella.json" with { type: "json" };
import organicAlmondsJson from "./organic-almonds.json" with { type: "json" };
import notFoundJson from "./not-found.json" with { type: "json" };

export type OffFixture = {
    status: number;
    status_verbose?: string;
    code?: string;
    product?: Record<string, unknown>;
};

/** Minimal hand-built envelope for parser edge cases. */
export function envelope(product: Record<string, unknown> = {}): OffFixture {
    return {
        status: 1,
        status_verbose: "product found",
        code: product.code as string | undefined,
        product: { code: "1234567890123", product_name: "Test product", nutriments: {}, ...product }
    };
}

/** Real Nutella envelope captured from the v2 API. */
export const nutella = nutellaJson as OffFixture;

/** Real organic almonds envelope: Nutri-Score A, no additives. */
export const organicAlmonds = organicAlmondsJson as OffFixture;

export const notFound = notFoundJson as OffFixture;
