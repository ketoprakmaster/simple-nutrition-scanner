import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductService, type ProductStore } from "$lib/services/productService";
import { SlidingWindowLimiter } from "$lib/services/api/apiRateLimiter";
import { productCache } from "$lib/services/api/apiBlacklist";
import type { Product } from "$lib/types/product";
import { envelope, notFound, nutella } from "./fixtures";

/** Records what the service persisted, so the DB layer stays out of these tests. */
function createStore(seeded?: Product) {
    const rows = new Map<string, Product>();
    if (seeded) rows.set(seeded.code, seeded);

    const store: ProductStore = {
        getById: vi.fn(async (code: string) => rows.get(code)),
        add: vi.fn(async (product: Product) => {
            rows.set(product.code, product);
        })
    };

    return { store, rows };
}

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

function serviceWith(response: Response | Error, seeded?: Product) {
    const { store, rows } = createStore(seeded);
    // a fresh, effectively unlimited limiter keeps tests independent of shared rate-limit state
    const limiter = new SlidingWindowLimiter(Number.MAX_SAFE_INTEGER, 60_000);
    const fetchImpl = vi.fn(async () => {
        if (response instanceof Error) throw response;
        return response.clone();
    });

    return { service: new ProductService({ repo: store, fetchImpl, limiter }), store, rows, fetchImpl };
}

describe("ProductService ingestion", () => {
    beforeEach(() => {
        productCache.clear();
    });

    it("stores a product parsed from a live-shaped response", async () => {
        const { service, store, rows, fetchImpl } = serviceWith(jsonResponse(nutella));

        const result = await service.lookup("3017620422003");

        expect(result).toEqual({ type: "found", code: "3017620422003", fromCache: false });
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(store.add).toHaveBeenCalledTimes(1);
        expect(rows.get("3017620422003")?.product.nutriscore_grade).toBe("e");
        expect(rows.get("3017620422003")?.product.product_name).toBe("Nutella");
    });

    it("trims the scanned code before using it", async () => {
        const { service } = serviceWith(jsonResponse(nutella));

        expect(await service.lookup("  3017620422003  ")).toEqual({
            type: "found",
            code: "3017620422003",
            fromCache: false
        });
    });

    it("serves a stored product without touching the network", async () => {
        const stored = nutella.product as unknown as Product["product"];
        const { service, fetchImpl } = serviceWith(jsonResponse(nutella), {
            code: "3017620422003",
            product: stored
        });

        expect(await service.lookup("3017620422003")).toEqual({
            type: "found",
            code: "3017620422003",
            fromCache: true
        });
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("blacklists and reports a product the API does not know", async () => {
        const { service, store } = serviceWith(jsonResponse(notFound));

        expect(await service.lookup("9999999999999")).toEqual({ type: "not_found", code: "9999999999999" });
        expect(store.add).not.toHaveBeenCalled();
        expect(productCache.isBlacklisted("9999999999999")).toBe(true);
        expect(await service.lookup("9999999999999")).toEqual({ type: "blacklisted" });
    });

    it("reports a 200 response with an unusable body as an error and stores nothing", async () => {
        const { service, store } = serviceWith(jsonResponse({ status: 1, product: { product_name: "No code" } }));

        const result = await service.lookup("1234567890123");

        expect(result).toEqual({ type: "error", message: "Unexpected response from Open Food Facts" });
        expect(store.add).not.toHaveBeenCalled();
    });

    it("never asks the database to store a response with no product", async () => {
        const { service, store } = serviceWith(jsonResponse({ status: 0, status_verbose: "no code found" }));

        expect(await service.lookup("1234567890123")).toEqual({ type: "not_found", code: "1234567890123" });
        expect(store.add).not.toHaveBeenCalled();
    });

    it("treats an HTTP error status as a failure, not a cached product", async () => {
        const { service, store } = serviceWith(new Response("nope", { status: 500 }));

        expect(await service.lookup("1234567890123")).toEqual({
            type: "error",
            message: "Unexpected response from Open Food Facts"
        });
        expect(store.add).not.toHaveBeenCalled();
    });

    it("reports a 429 as rate limited", async () => {
        const { service } = serviceWith(new Response("slow down", { status: 429 }));

        expect(await service.lookup("1234567890123")).toEqual({ type: "rate_limited" });
    });

    it("reports a transport failure with its message", async () => {
        const { service } = serviceWith(new Error("Connection failed"));

        expect(await service.lookup("1234567890123")).toEqual({ type: "error", message: "Connection failed" });
    });

    it("reports invalid JSON as an error instead of throwing", async () => {
        const { service } = serviceWith(new Response("<html>gateway</html>", { status: 200 }));

        expect(await service.lookup("1234567890123")).toMatchObject({ type: "error" });
    });

    it("rejects an empty code before any work happens", async () => {
        const { service, fetchImpl, store } = serviceWith(jsonResponse(nutella));

        expect(await service.lookup(undefined)).toEqual({ type: "error", message: "Invalid code" });
        expect(await service.lookup("   ")).toEqual({ type: "error", message: "Invalid code" });
        expect(fetchImpl).not.toHaveBeenCalled();
        expect(store.getById).not.toHaveBeenCalled();
    });

    it("stores the code returned by the API when it differs from the scanned one", async () => {
        const { service, rows } = serviceWith(
            jsonResponse(envelope({ code: "3017620422003", product_name: "Renamed" }))
        );

        const result = await service.lookup("0000000000000");

        expect(result).toEqual({ type: "found", code: "3017620422003", fromCache: false });
        expect(rows.has("3017620422003")).toBe(true);
    });
});
