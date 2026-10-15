import { afterEach, describe, expect, it, vi } from "vitest";
import { SlidingWindowLimiter } from "$lib/services/api/apiRateLimiter";

describe("SlidingWindowLimiter", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("allows the configured number of calls, then refuses", () => {
        const limiter = new SlidingWindowLimiter(3, 60_000);

        expect([limiter.allow(), limiter.allow(), limiter.allow()]).toEqual([true, true, true]);
        expect(limiter.allow()).toBe(false);
    });

    it("slides the window instead of resetting it in one go", () => {
        vi.useFakeTimers();
        const limiter = new SlidingWindowLimiter(2, 1000);

        vi.setSystemTime(0);
        expect(limiter.allow()).toBe(true);

        vi.setSystemTime(900);
        expect(limiter.allow()).toBe(true);
        expect(limiter.allow()).toBe(false);

        // A fixed-window counter would have reset at 1000 and granted two more
        // calls at once, which is the burst this limiter exists to prevent.
        vi.setSystemTime(1000);
        expect(limiter.allow()).toBe(true);
        expect(limiter.allow()).toBe(false);

        // The call made at 900 is a full window old, so its slot frees up.
        vi.setSystemTime(1900);
        expect(limiter.allow()).toBe(true);
    });

    it("refuses every call for a full window after forceMax", () => {
        vi.useFakeTimers();
        const limiter = new SlidingWindowLimiter(5, 1000);

        vi.setSystemTime(0);
        expect(limiter.allow()).toBe(true);

        limiter.forceMax();
        expect(limiter.allow()).toBe(false);

        vi.setSystemTime(999);
        expect(limiter.allow()).toBe(false);

        vi.setSystemTime(1000);
        expect(limiter.allow()).toBe(true);
    });

    it("backs off without allocating an entry per request", () => {
        // The tests build an effectively unlimited limiter, so a forceMax that
        // pushed one timestamp per request would try to allocate forever.
        const limiter = new SlidingWindowLimiter(Number.MAX_SAFE_INTEGER, 60_000);

        expect(limiter.allow()).toBe(true);
        expect(() => limiter.forceMax()).not.toThrow();
        expect(limiter.allow()).toBe(false);
    });
});
