import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { history } from "./state.svelte";
import { ui } from "$lib/alert.svelte";
import { APP_NAME, APP_VERSION, DEV_CONTACT, APP_ID } from "$lib/global.svelte";

let requestCount = 0
let isFetching = $state(false)

setInterval(() => {
    requestCount = 0;
    if (requestCount) console.log("reset count")
}, 60_000);

export async function getProduct(code: string | number | undefined) {
    // Prevent empty scans or concurrent identical requests
    const stringCode = String(code).trim();
    if (!stringCode || isFetching) return;
    isFetching = true;

    try {
        // Check Cache First
        const cached = await history.getById(stringCode);
        if (cached) {
            ui.show("Had already been scanned", "info");
            return goto(resolve("/history/[code]", {code: cached.code}));
        }

        // Check the request count
        if (requestCount > 40) {
            ui.show(`Too much request: ${requestCount}`, "warning")
            return
        }

        // Api request
        requestCount++;
        console.log("fetching: " + stringCode)
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v2/product/${stringCode}.json`,
            {
                method: "GET",
                headers: {
                    // User-Agent Identification
                    "User-Agent": `app-name=${APP_NAME} - app_version=${APP_VERSION} - app_id=${APP_ID} - dev_contacts:${DEV_CONTACT}`
                },
            }
        );

        if (response.status === 429)
            throw new Error("Too many requests. Please slow down.");

        if (!response.ok && response.status !== 404)
            throw new Error(`Server error: ${response.status}`);

        const data = await response.json();

        if (data.status === 1 && data.product) {
            ui.show("Product found!", "success");

            await history.add(data);
            goto(resolve("/history/[code]", { code: data.code }));
        } else {
            ui.show(`Product not found, code: ${code}` , "warning");
        }

    } catch (err) {
        ui.show(err instanceof Error ? err.message : "Connection failed", "error");
    } finally {
        isFetching = false;
    }
}
