import { APP_NAME, APP_VERSION, APP_ID, DEV_CONTACT } from "$lib/core/appInfo";

const HEADERS = {
    "User-Agent": `${APP_NAME}/${APP_VERSION} APP_ID=${APP_ID} (${DEV_CONTACT})`
}

export async function productFetch(code: string) {
    const start = performance.now();

    const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
        { headers: HEADERS }
    );

    const duration = (performance.now() - start).toFixed(0);
    console.log(`[Network] Fetch for ${code} finished in ${duration}ms (Status: ${res.status})`);

    return res;
}
