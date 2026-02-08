import Quagga from '@ericblade/quagga2';
import type { QuaggaJSConfigObject } from '@ericblade/quagga2'

export const scannerConfig: QuaggaJSConfigObject = {
    inputStream: {
        type: "LiveStream",
        target: undefined,
        constraints: {
            facingMode: "environment",
            aspectRatio: { min: 1, max: 2 }
        },
    },
    decoder: {
        readers: ["ean_reader", "ean_8_reader", "upc_reader"]
    },
    locate: true
};
