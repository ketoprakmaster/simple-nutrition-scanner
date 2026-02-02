import { goto } from "$app/navigation";
import { history } from "./state.svelte";

let message: unknown = $state('')

export async function fetchProduct(code: number | string) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}`);
    const data = await res.json();

    if (data.status === 1) {
      history.add(data);
      console.log(`successfully fetch product (${code})`)
    } else {
      throw(`product not found! (${code})`)
    }
  } catch (err) {
      console.error(err);
      message = err
  }
}

export function getProduct(code: number | string) {
    let itemExists : boolean = history.items.find((item) => item.code === code) ? true : false

    if (itemExists) {
        message = `fetch from cache storages! ${code}`
        console.log(message)
    } else {
        fetchProduct(code)
    }

    goto(`/history/${code}`)
}
