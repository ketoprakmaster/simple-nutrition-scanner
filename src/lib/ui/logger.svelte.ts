import { copyToClip } from "../utils/helpers/clipboard";

class LogManager {
    logs = $state<string[]>([]);
    maxLogs = 100; // Prevent memory issues

    constructor() {
        if (typeof window === 'undefined') return;

        // Capture standard console methods
        const methods: ('log' | 'warn' | 'error')[] = ['log', 'warn', 'error'];

        methods.forEach(method => {
            const original = console[method];
            console[method] = (...args: any[]) => {
                // 1. Call the original so you still see it in dev tools
                original.apply(console, args);

                // 2. Format and save to our state
                const timestamp = new Date().toLocaleTimeString();
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ');

                const entry = `[${timestamp}] [${method.toUpperCase()}] ${message}`;

                // Update Svelte state (keeping it under the limit)
                this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
            };
        });
    }

    get rawLogs() {
        return this.logs.join('\n');
    }

    copyToClipboard() {
        if (this.logs.length === 0) return;
        copyToClip(this.rawLogs);
    }

    clear() {
        this.logs = [];
    }
}

export const logger = new LogManager();
