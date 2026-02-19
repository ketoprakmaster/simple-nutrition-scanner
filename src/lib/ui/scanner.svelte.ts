// lib/ui/scanner.svelte.ts
import { ScannerEngine } from "$lib/services/scannerEngine";
import { ProductService } from "$lib/services/productService";
import { ProductRepository } from "$lib/services/productRepository";
import { ui } from "./alert.svelte";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";

class ScannerController {
    isActive = $state(false);
    isProcessing = $state(false);

    #engine = new ScannerEngine();
    #service = new ProductService(new ProductRepository());

    async start(target: HTMLElement) {
        if (this.isActive) return;

        try {
            await this.#engine.start(target, (code) => {
                if (!this.isProcessing) {
                    this.#handleCode(code);
                }
            });

            this.isActive = true;
        } catch (err: any) {
            this.#handleCameraError(err);
        }
    }

    stop() {
        this.#engine.stop();
        this.isActive = false;
        this.isProcessing = false;
    }

    async processImage(file: File) {
        if (this.isProcessing) return;

        const code = await this.#engine.decodeImage(file);

        if (!code) {
            ui.show("No barcode detected", "warning");
            return;
        }

        await this.#handleCode(code);
    }

    async #handleCode(code: string) {
        if (this.isProcessing || !this.isActive) return;

        this.isProcessing = true;

        try {
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
                    this.isActive = false;
                    break;

                case "not_found":
                    ui.show(
                        `Product ${result.code} not found`,
                        "warning",
                    );
                    break;

                case "rate_limited":
                    ui.show(
                        "Rate limit reached. Wait a minute.",
                        "warning",
                    );
                    break;

                case "blacklisted":
                    break;

                case "error":
                    ui.show(result.message, "error");
                    break;
            }
        } finally {
            this.isProcessing = false;
        }
    }

    #handleCameraError(error: any) {
        if (error?.name === "NotAllowedError")
            ui.show("Camera permission denied", "error");
        else if (error?.name === "NotFoundError")
            ui.show("No camera found", "error");
        else ui.show("Camera error", "error");
    }
}

export const Scanner = new ScannerController();
