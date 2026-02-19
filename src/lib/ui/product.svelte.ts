import { ProductRepository } from "$lib/services/productRepository";
import { ProductService } from "$lib/services/productService";
import type { Product } from "$lib/types/product";
import { ui } from "./alert.svelte";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";

class ProductStore {
    items = $state<Product[]>([]);
    loading = $state(false);
    current = $state<Product | undefined>();

    #repo = new ProductRepository();
    #service = new ProductService(this.#repo);

    constructor() {
        this.#repo.stream().subscribe((products) => {
            this.items = products;
        });
    }

    async lookup(code: string | undefined) {
        if (!code || this.loading) return;

        this.loading = true;

        const result = await this.#service.lookup(code);

        switch (result.type) {
            case "found":
                ui.show(
                    result.fromCache
                        ? "Loaded from history"
                        : "Product found!",
                    "success",
                );
                goto(resolve(`/history/${result.code}`));
                break;

            case "not_found":
                ui.show(
                    `Product ${result.code} not found`,
                    "warning",
                );
                break;

            case "rate_limited":
                ui.show("Rate limit reached", "warning");
                break;

            case "blacklisted":
                ui.show(
                    "Product previously not found",
                    "info",
                );
                break;

            case "error":
                ui.show(result.message, "error");
                break;
        }

        this.loading = false;
    }

    async ensure(code: string | undefined) {
        if (!code) return;

        this.loading = true;

        // Try DB first silently
        const existing = await this.#repo.getById(code);

        if (existing) {
            this.current = existing;
            this.loading = false;
            return;
        }

        const result = await this.#service.lookup(code);

        if (result.type === "found") {
            ui.show("product found!", "success");
            this.current = await this.#repo.getById(
                result.code,
            );
        } else {
            ui.show(
                `product not found: ${code}`,
                "warning",
            );
            this.current = undefined;
        }

        this.loading = false;
    }

    async remove(code: string | undefined) {
        if (!code) return;

        await this.#repo.remove(code);

        if (this.current?.code === code) {
            this.current = undefined;
        }
    }

    async clear() {
        await this.#repo.clear();
    }
}

export const productStore = new ProductStore();
