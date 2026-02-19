import { ui } from "$lib/ui/alert.svelte";
import Quagga from "@ericblade/quagga2";

class ToggleTorch {
    // Use the $state rune for reactive UI updates
    torchEnabled = $state(false);

    async toggle() {
        if (this.torchEnabled) {
            await this.#disable();
        } else {
            await this.#enable();
        }
    }

    async #enable() {
        try {
            await Quagga.CameraAccess.enableTorch();
            this.torchEnabled = true;
        } catch (error) {
            this.torchEnabled = false;
            this.#handleError(error);
        }
    }

    async #disable() {
        try {
            await Quagga.CameraAccess.disableTorch();
            this.torchEnabled = false;
        } catch (error) {
            this.torchEnabled = false;
            this.#handleError(error);
        }
    }

    async #handleError(error: any) {
        console.error('Torch control failed:', error);
        ui.show('Torch not available on this device',"error");
    }
}

export const Torch = new ToggleTorch();
