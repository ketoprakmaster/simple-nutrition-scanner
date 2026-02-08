import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { history } from "./state.svelte";
import { ui } from "$lib/alert.svelte";
import { APP_NAME, APP_VERSION, DEV_CONTACT, APP_ID } from "$lib/global.svelte";

let isFetching = $state(false);

export async function getProduct(code: string | number | undefined) {
    // Prevent empty scans or concurrent identical requests
    const stringCode = String(code).trim();
    if (!stringCode || isFetching) return;

    // Check Cache First
    const cached = await history.getById(stringCode);
    if (cached) {
        ui.show("Already in Database", "info");
        return goto(resolve("/history/[code]", {code: cached.code}));
    }

    isFetching = true;
    history.loading = true;

    try {
        console.log("fetching: " + stringCode)
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v2/product/${stringCode}.json`,
            {
                method: "GET",
                headers: {
                    // User-Agent Identification
                    "User-Agent": `app-name:${APP_NAME} - version:${APP_VERSION} - app-id${APP_ID} - contacts:${DEV_CONTACT}`
                }
            }
        );

        if (response.status === 429) {
            throw new Error("Too many requests. Please slow down.");
        }

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();

        if (data.status === 1 && data.product) {
            ui.show("Product found!", "success");

            await history.add(data);
            goto(resolve("/history/[code]", {code: data.code}));
        } else {
            ui.show("Product not found in database", "warning");
        }

    } catch (err) {
        ui.show(err instanceof Error ? err.message : "Connection failed", "error");

    } finally {
        isFetching = false;
        history.loading = false;
    }
}
