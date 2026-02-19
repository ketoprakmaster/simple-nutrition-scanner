export class SlidingWindowLimiter {

    #count = 0;
    #lastReset = Date.now();

    constructor(
        private maxRequests:number,
        private windowMs:number
    ) {}

    allow() {
        const now = Date.now();

        if (now - this.#lastReset > this.windowMs) {
            this.#count = 0;
            this.#lastReset = now;
        }

        if (this.#count >= this.maxRequests) {
            return false;
        }

        this.#count++;
        return true;
    }

    forceMax() {
        this.#count = this.maxRequests;
    }

    get count() {
        return this.#count;
    }
}
