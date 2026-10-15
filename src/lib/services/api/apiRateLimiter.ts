/**
 * Allows at most `maxRequests` calls in any trailing `windowMs` span.
 *
 * The timestamps of recent calls are retained, so a burst cannot slip through
 * either side of a window boundary the way a fixed-window counter would allow.
 * The budget is only spent by `allow()`, and a back-off set by `forceMax()`
 * costs no allocation, so an "unlimited" limiter stays cheap.
 */
export class SlidingWindowLimiter {

    readonly #recent: number[] = [];
    #blockedUntil = 0;

    constructor(
        private maxRequests:number,
        private windowMs:number
    ) {}

    allow() {
        const now = Date.now();

        if (now < this.#blockedUntil) {
            return false;
        }

        this.#forgetExpired(now);

        if (this.#recent.length >= this.maxRequests) {
            return false;
        }

        this.#recent.push(now);
        return true;
    }

    /** Refuse every call for a full window, so a 429 is not retried immediately. */
    forceMax() {
        this.#recent.length = 0;
        this.#blockedUntil = Date.now() + this.windowMs;
    }

    #forgetExpired(now: number) {
        while (this.#recent.length > 0 && now - this.#recent[0] >= this.windowMs) {
            this.#recent.shift();
        }
    }
}
