import { ui } from "$lib/alert.svelte";
import Quagga from "@ericblade/quagga2";

export class ToggleTorch {
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
            ui.show(`Torch error: ${error}`, "error");
        }
    }

    async #disable() {
        try {
            await Quagga.CameraAccess.disableTorch();
            this.torchEnabled = false;
        } catch (error) {
            this.torchEnabled = false;
            console.error(error);
        }
    }
}
