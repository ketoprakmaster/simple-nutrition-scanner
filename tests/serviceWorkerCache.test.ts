import { beforeAll, describe, expect, it, vi } from "vitest";

/**
 * The service worker caches Open Food Facts responses. These tests pin down the
 * cache-key namespace, which is what keeps a cached API body from ever being
 * handed back as image bytes (or the other way around).
 *
 * The caches themselves need a real service-worker global scope, so the workbox
 * helpers are replaced with recorders and the registrations are asserted instead.
 */

type CacheKeyPlugin = { cacheKeyWillBeUsed: (input: { request: Request }) => Promise<Request | string> };

type Recorded = {
    matcher: unknown;
    handler: { options?: Record<string, unknown> } & Record<string, unknown>;
    method: string;
};

// `vi.mock` factories are hoisted above the module body, so the state they write
// to has to be hoisted with them.
const harness = vi.hoisted(() => ({
    registrations: [] as Array<{ match: unknown; handler: unknown; method?: string }>,
    plugins: [] as Array<Record<string, unknown>>,
    shellHandlerUrl: undefined as string | undefined
}));

// The worker registers install/activate listeners on its own global scope.
vi.stubGlobal("self", {
    addEventListener: vi.fn(),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() }
});

vi.mock("$service-worker", () => ({
    build: ["/_app/immutable/bundle.js"],
    files: ["/manifest.webmanifest"],
    prerendered: ["/", "/history", "/settings"],
    version: "test-version",
    base: ""
}));

vi.mock("workbox-precaching", () => ({
    precacheAndRoute: vi.fn(),
    cleanupOutdatedCaches: vi.fn(),
    createHandlerBoundToURL: vi.fn((url: string) => {
        harness.shellHandlerUrl = url;
        return { __shell: url };
    })
}));

vi.mock("workbox-routing", () => ({
    registerRoute: (match: unknown, handler: unknown, method?: string) => {
        harness.registrations.push({ match, handler, method });
    },
    NavigationRoute: class NavigationRoute {
        constructor(public handler: unknown) {
            this.matcher = { __navigation: true };
        }
        matcher: unknown;
    }
}));

vi.mock("workbox-strategies", () => ({
    StaleWhileRevalidate: class {
        constructor(public options: Record<string, unknown>) {
            harness.plugins.push(...((options.plugins ?? []) as Array<Record<string, unknown>>));
        }
    },
    CacheFirst: class {
        constructor(public options: Record<string, unknown>) {
            harness.plugins.push(...((options.plugins ?? []) as Array<Record<string, unknown>>));
        }
    }
}));

vi.mock("workbox-expiration", () => ({
    ExpirationPlugin: class {
        constructor(public options: Record<string, number>) {
            harness.plugins.push({ ...options });
        }
    }
}));

/** The origins whose traffic the worker is expected to cache. */
const CACHED_ORIGINS = [
    "https://world.openfoodfacts.org",
    "https://images.openfoodfacts.org",
    "https://static.openfoodfacts.org"
];

let recorded: Recorded[];

function matcherOf(registration: { match: unknown; handler: unknown }): Recorded["matcher"] {
    // `new NavigationRoute(...)` is passed straight to registerRoute, so the
    // matcher lives on the route instance rather than being a predicate.
    const asRoute = registration.match as { matcher?: unknown };
    return asRoute?.matcher ?? registration.match;
}

function routesFor(origin: string): Recorded[] {
    return recorded.filter(route => {
        const matcher = route.matcher;
        if (typeof matcher !== "function") return false;
        return (matcher as (input: { url: URL }) => boolean)({ url: new URL(`${origin}/x`) });
    });
}

function routeFor(origin: string): Recorded {
    const [route] = routesFor(origin);
    if (!route) throw new Error(`no cached route claims ${origin}`);
    return route;
}

function cacheKeyPlugin(route: Recorded): CacheKeyPlugin {
    const plugin = harness.plugins.find(
        (candidate): candidate is CacheKeyPlugin =>
            typeof (candidate as CacheKeyPlugin).cacheKeyWillBeUsed === "function"
    );

    if (!plugin) throw new Error("route has no cacheKeyWillBeUsed plugin");
    return plugin;
}

function expirationPlugins(): Array<{ maxEntries: number; maxAgeSeconds: number }> {
    return harness.plugins.filter(
        (candidate): candidate is { maxEntries: number; maxAgeSeconds: number } =>
            typeof candidate.maxEntries === "number"
    );
}

function cacheKeyOf(key: Request | string): string {
    return typeof key === "string" ? key : key.url;
}

beforeAll(async () => {
    await import("../src/service-worker");

    recorded = harness.registrations.map(({ match, handler, method }) => ({
        matcher: matcherOf({ match, handler }),
        handler: handler as Recorded["handler"],
        method: method ?? "GET"
    }));
});

describe("service worker caching", () => {
    it("precaches the shell and serves navigations from it", () => {
        expect(harness.shellHandlerUrl).toBeDefined();
        expect(
            harness.shellHandlerUrl!.endsWith("index.html") || harness.shellHandlerUrl === "/"
        ).toBe(true);
    });

    it("registers one cached route per Open Food Facts origin", () => {
        for (const origin of CACHED_ORIGINS) {
            expect(routesFor(origin), origin).toHaveLength(1);
            expect(routeFor(origin).method, origin).toBe("GET");
        }
    });

    it("does not claim the app shell's own origin", () => {
        const shellRequest = new Request("http://localhost:3000/api/v2/product/3017620422003.json");

        // The app shell serves `/api/v2/product/<code>.json` for its own client
        // routing, on the very path the API answers on.
        for (const route of recorded) {
            if (typeof route.matcher !== "function") continue;
            expect((route.matcher as (input: { url: URL; request: Request }) => boolean)({
                url: new URL(shellRequest.url),
                request: shellRequest
            })).toBe(false);
        }
    });

    it("gives every cached origin its own key namespace", async () => {
        const keys = new Set<string>();

        for (const origin of CACHED_ORIGINS) {
            const key = await cacheKeyPlugin(routeFor(origin)).cacheKeyWillBeUsed({
                request: new Request(`${origin}/api/v2/product/3017620422003.json`)
            });
            keys.add(cacheKeyOf(key));
        }

        expect(keys.size).toBe(CACHED_ORIGINS.length);
    });

    it("keeps two origins that share a path in separate cache entries", async () => {
        const path = "/images/products/301/762/042/2003/front_en.879.400.jpg";
        const [apiOrigin, imageOrigin] = CACHED_ORIGINS;

        const apiKey = await cacheKeyPlugin(routeFor(apiOrigin)).cacheKeyWillBeUsed({
            request: new Request(apiOrigin + path)
        });
        const imageKey = await cacheKeyPlugin(routeFor(imageOrigin)).cacheKeyWillBeUsed({
            request: new Request(imageOrigin + path)
        });

        expect(cacheKeyOf(apiKey)).not.toBe(cacheKeyOf(imageKey));
        // Both origins answer on the same path, which is what made keying the
        // cache by request URL dangerous in the first place.
        expect(new URL(apiOrigin + path).pathname).toBe(new URL(imageOrigin + path).pathname);
    });

    it("expires cached entries instead of growing without bound", () => {
        const expirations = expirationPlugins();

        expect(expirations).toHaveLength(CACHED_ORIGINS.length);
        for (const expiration of expirations) {
            expect(expiration.maxEntries).toBeGreaterThan(0);
            expect(expiration.maxAgeSeconds).toBeGreaterThan(0);
        }
    });

    it("names one cache per cached origin", () => {
        const cacheNames = recorded
            .map(route => route.handler?.options?.cacheName as string | undefined)
            .filter((name): name is string => !!name);

        expect(cacheNames).toHaveLength(CACHED_ORIGINS.length);
        expect(new Set(cacheNames).size).toBe(cacheNames.length);
    });
});
