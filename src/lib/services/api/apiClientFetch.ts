import { APP_NAME, APP_VERSION, APP_ID, DEV_CONTACT } from "$lib/core/appInfo";

const HEADERS = {
    "User-Agent": `${APP_NAME}/${APP_VERSION} APP_ID=${APP_ID} (${DEV_CONTACT})`
}

export async function productFetch(code: string) {
    console.log("fetching product with code: " + code)

    const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
        { headers: HEADERS }
    );

    return res;
}
