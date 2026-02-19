import Quagga from "@ericblade/quagga2";
import { scannerConfig } from "$lib/config/scanner";

export class ScannerEngine {
    async start(
        target: HTMLElement,
        onDetected: (code: string) => void,
    ) {
        const config = {
            ...scannerConfig,
            inputStream: {
                ...scannerConfig.inputStream,
                target,
            },
        };

        await Quagga.init(config);

        Quagga.onDetected((data: any) => {
            const code = data?.codeResult?.code;
            if (code) onDetected(code);
        });

        Quagga.start();
    }

    stop() {
        Quagga.stop();
        Quagga.offDetected();
    }

    async decodeImage(file: File): Promise<string | null> {
        const src = URL.createObjectURL(file);

        return new Promise((resolve) => {
            Quagga.decodeSingle(
                {
                    ...scannerConfig,
                    src,
                    inputStream: { size: 800 },
                },
                (result) => {
                    URL.revokeObjectURL(src);
                    resolve(
                        result?.codeResult?.code ?? null,
                    );
                },
            );
        });
    }
}
