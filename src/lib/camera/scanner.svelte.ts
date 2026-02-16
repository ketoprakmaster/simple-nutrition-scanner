import Quagga from '@ericblade/quagga2';
import { scannerConfig } from '$lib/config/scanner';
import { ui } from '$lib/alert.svelte';
import { getProduct } from '$lib/api.svelte';

/** class for managing the camera/scanner components lifecycle and functionality */
export class ScannerManager {
    isActive = false;
    isLocked = false;

    async #handleDetected(data: any) {
        const code = data.codeResult?.code;
        if (!code || this.isLocked || !this.isActive) return;

        this.isLocked = true;
        this.#pauseScanning();

        try {
            // throw new Error("mock test code: " + code)
            await getProduct(code);
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
                    await getProduct(code);
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

    #pauseScanning() {
        Quagga.offDetected();
    }

    #resumeScanning() {
        if (!this.isActive) return
        Quagga.onDetected((data) => this.#handleDetected(data));
    }

    start(target: HTMLElement) {
        if (this.isActive) return;

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
