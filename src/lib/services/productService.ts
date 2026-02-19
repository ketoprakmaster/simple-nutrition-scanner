import { SlidingWindowLimiter } from "$lib/services/api/apiRateLimiter";
import { productFetch } from "$lib/services/api/apiClientFetch";
import { productCache } from "$lib/services/api/apiBlacklist";
import { ProductRepository } from "./productRepository";
import type { LookupResult } from "$lib/types/result";

const limiter = new SlidingWindowLimiter(40, 60_000);

export class ProductService {
    constructor(private repo: ProductRepository) {}

    async lookup(
        rawCode: string | number | undefined,
    ): Promise<LookupResult> {
        const code = String(rawCode).trim();

        if (!code) {
            return {
                type: "error",
                message: "Invalid code",
            };
        }

        if (productCache.isBlacklisted(code)) {
            return { type: "blacklisted" };
        }

        if (!limiter.allow()) {
            return { type: "rate_limited" };
        }

        try {
            const cached = await this.repo.getById(code);
            if (cached) {
                return {
                    type: "found",
                    code,
                    fromCache: true,
                };
            }

            const res = await productFetch(code);

            if (res.status === 429) {
                limiter.forceMax();
                return { type: "rate_limited" };
            }

            const data = await res.json();

            if (data.status === 1 && data.product) {
                await this.repo.add(data);
                return {
                    type: "found",
                    code: data.code,
                    fromCache: false,
                };
            }

            productCache.addToBlacklist(code);
            return { type: "not_found", code };
        } catch (err) {
            return {
                type: "error",
                message:
                    err instanceof Error
                        ? err.message
                        : "Connection failed",
            };
        }
    }
}
