import Quagga from '@ericblade/quagga2';
import { scannerConfig } from '$lib/config/scanner';
import { ui } from '$lib/alert.svelte';
import { FoodApi } from '$lib/api/api.svelte';

/** class for managing the camera/scanner components lifecycle and functionality */
class ScannerManager {
    isActive = $state(false);
    isLocked = $state(false);
    #detectedHandler = (data:any) => this.#handleDetected(data);

    async #handleDetected(data: any) {
        const code = data.codeResult?.code;
        if (!code || this.isLocked || !this.isActive) return;

        this.isLocked = true;
        this.#pauseScanning();

        try {
            // throw new Error("mock test code: " + code)
            await FoodApi.getProduct(code);
        } catch (err) {
            ui.show(err instanceof Error ? err.message : "Scan Error", "error");
        } finally {
            // extra guard
            if (this.isActive) {
                this.isLocked = false;
                this.#resumeScanning();
            }
        }
    }

    async processImage(file: File) {
        if (this.isLocked) return;
        this.isLocked = true;

        // Create a URL for the image file
        const src = URL.createObjectURL(file);

        Quagga.decodeSingle({
            ...scannerConfig,
            src: src,
            inputStream: { size: 800 } // Helps with high-res mobile photos
        }, async (result) => {
            const code = result?.codeResult?.code;

            if (code) {
                try {
                    await FoodApi.getProduct(code);
                } catch (err) {
                    ui.show(err instanceof Error ? err.message : "Scan Error", "error");
                } finally {
                    this.isLocked = false;
                }
            } else {
                ui.show("No barcode detected in image", "warning");
                this.isLocked = false;
            }
            URL.revokeObjectURL(src); // Clean up memory
        });
    }

    #resumeScanning() {
        if (!this.isActive) return;
        Quagga.onDetected(this.#detectedHandler);
    }

    #pauseScanning() {
        Quagga.offDetected(this.#detectedHandler);
    }

    start(target: HTMLElement) {
        if (this.isActive) return;
        console.log("starting stream")

        const config = { ...scannerConfig, inputStream: { ...scannerConfig.inputStream, target } };

        Quagga.init(config, (error) => {
            if (error) {
                this.handleCameraError(error);
                return;
            }

            Quagga.start();
            this.isActive = true;
            this.#resumeScanning();
        });
    }

    stop() {
        console.log("stopping stream")
        Quagga.offDetected();
        Quagga.stop();
        this.isActive = false;
        this.isLocked = false;
    }

    private handleCameraError(error: any) {
        if (error.name === 'NotAllowedError' || error.code === 'NotAllowedError') {
            ui.show('Camera permission denied', "error");
        } else if (error.name === 'NotFoundError' || error.code === 'NotFoundError') {
            ui.show('No camera found', "error");
        } else {
            ui.show(`Camera error: ${error.message || error}`, "error");
        }
    }
}

export const Scanner = new ScannerManager();
