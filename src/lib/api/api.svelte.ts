import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { history } from'$lib/api/state.svelte';
import { ui } from "$lib/alert.svelte";
import { APP_NAME, APP_VERSION, DEV_CONTACT, APP_ID } from "$lib/global.svelte";

const MAX_REQUEST : number = 40

class ApiManager {
    #isFetching = $state(false);
    #requestCount = $state(0);
    #lastReset = Date.now();
    #blacklistedCodes = new Set<string>();

    get loading() { return this.#isFetching; }
    get requestCount() { return this.#requestCount; }

    async getProduct(code: string | number | undefined) {
        const stringCode = String(code).trim();
        if (!stringCode || this.#isFetching) return;

        // Prevent re-scanning known failures
        if (this.#blacklistedCodes.has(stringCode)) {
            return;
        }

        // Local Rate Limit Check (Slide-window logic)
        const now = Date.now();
        if (now - this.#lastReset > 60_000) {
            this.#requestCount = 0;
            this.#lastReset = now;
        }

        if (this.#requestCount >= MAX_REQUEST) {
            ui.show("Rate limit reached. Wait a minute.", "warning");
            return;
        }

        this.#isFetching = true;

        try {
            // Check Cache
            const cached = await history.getById(stringCode);
            if (cached) {
                ui.show("Loading from history...", "info");
                return goto(resolve("/history/[code]", {code: cached.code}));
            }

            // Api request
            this.#requestCount++;
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${stringCode}.json`,
                {
                    headers: { "User-Agent": `${APP_NAME}/${APP_VERSION} APP_ID=${APP_ID} (${DEV_CONTACT})` }
                }
            );

            // Handle specific status codes
            if (response.status === 429) {
                this.#requestCount = MAX_REQUEST; // Max out local counter
                throw new Error("Slow down! Server rate limit hit.");
            }

            const data = await response.json();

            if (data.status === 1 && data.product) {
                ui.show("Product found!", "success");
                await history.add(data);
                goto(resolve("/history/[code]", { code: data.code }));
            } else {
                // Mark as failed to prevent repeat API calls
                this.#blacklistedCodes.add(stringCode);
                ui.show(`Product ${stringCode} not found`, "warning");
            }

        } catch (err) {
            ui.show(err instanceof Error ? err.message : "Connection failed", "error");
        } finally {
            this.#isFetching = false;
        }
    }

    clearBlacklist() {
        this.#blacklistedCodes.clear();
    }
}

export const FoodApi = new ApiManager();
