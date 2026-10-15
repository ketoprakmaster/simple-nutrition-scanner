import { SlidingWindowLimiter } from "$lib/services/api/apiRateLimiter";
import { productFetch } from "$lib/services/api/apiClientFetch";
import { productCache } from "$lib/services/api/apiBlacklist";
import { parseProductPayload } from "$lib/services/api/productParse";
import { ProductRepository } from "./productRepository";
import type { Product } from "$lib/types/product";
import type { LookupResult } from "$lib/types/result";

/** The storage surface the service needs; `ProductRepository` satisfies it. */
export type ProductStore = Pick<ProductRepository, "getById" | "add">;

/** The network surface the service needs: a barcode in, a raw API response out. */
export type ProductFetch = (code: string) => Promise<Response>;

export type ProductServiceDeps = {
    repo: ProductStore;
    /** Defaults to the real Open Food Facts client; tests inject a stub. */
    fetchImpl?: ProductFetch;
    /** Defaults to the process-wide limiter so scans share one Open Food Facts budget. */
    limiter?: SlidingWindowLimiter;
};

/**
 * Open Food Facts allows 15 product reads per minute per IP for a read-only
 * client, and asks callers to stay well inside it because breaching the limit
 * can get the IP banned. The limiter only spends budget on calls that actually
 * reach the network, so local history never eats into that allowance.
 */
const READS_PER_MINUTE = 15;

const sharedLimiter = new SlidingWindowLimiter(READS_PER_MINUTE, 60_000);

export class ProductService {
    readonly #repo: ProductStore;
    readonly #fetch: ProductFetch;
    readonly #limiter: SlidingWindowLimiter;

    constructor({ repo, fetchImpl, limiter = sharedLimiter }: ProductServiceDeps) {
        this.#repo = repo;
        this.#fetch = fetchImpl ?? productFetch;
        this.#limiter = limiter;
    }

    async lookup(rawCode: string | number | undefined): Promise<LookupResult> {
        const code = String(rawCode ?? "").trim();

        if (!code) {
            return { type: "error", message: "Invalid code" };
        }

        if (productCache.isBlacklisted(code)) {
            return { type: "blacklisted" };
        }

        try {
            // A local hit is instant and never leaves the device, so it must not
            // spend any of the Open Food Facts allowance.
            const cached = await this.#repo.getById(code);
            if (cached) {
                return { type: "found", code, fromCache: true };
            }

            if (!this.#limiter.allow()) {
                return { type: "rate_limited" };
            }

            const outcome = await this.#ingest(code);

            switch (outcome.type) {
                case "rate_limited":
                    this.#limiter.forceMax();
                    return { type: "rate_limited" };

                case "not_found":
                    productCache.addToBlacklist(code);
                    return { type: "not_found", code };

                case "malformed":
                    return { type: "error", message: "Unexpected response from Open Food Facts" };

                case "product":
                    await this.#repo.add({ ...outcome.product, scannedAt: Date.now() });
                    return { type: "found", code: outcome.product.code, fromCache: false };
            }
        } catch (err) {
            return {
                type: "error",
                message: err instanceof Error ? err.message : "Connection failed"
            };
        }
    }

    /** Network + parsing step only, so it can be tested without a database. */
    async #ingest(code: string): Promise<IngestOutcome> {
        const res = await this.#fetch(code);

        // 429 is the per-client limit; 503 is the global one Open Food Facts
        // applies to an endpoint regardless of who is asking.
        if (res.status === 429 || res.status === 503) return { type: "rate_limited" };
        if (!res.ok) return { type: "malformed" };

        const parsed = parseProductPayload(await res.json());

        return parsed.type === "product"
            ? { type: "product", product: parsed.product }
            : { type: parsed.reason };
    }
}

type IngestOutcome =
    | { type: "rate_limited" }
    | { type: "not_found" }
    | { type: "malformed" }
    | { type: "product"; product: Product };
