import { copyToClip } from "../utils/helpers/clipboard";

class LogManager {
    logs = $state<string[]>([]);
    maxLogs = 100; // Prevent memory issues

    #addEntry(method: string, args: any[]) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        const entry = `[${timestamp}] [${method.toUpperCase()}] ${message}`;

        // Update Svelte state (keeping it under the limit)
        this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
    }

    log(...args: any[]) {
        console.log(...args);
        this.#addEntry('log', args);
    }

    warn(...args: any[]) {
        console.warn(...args);
        this.#addEntry('warn', args);
    }

    error(...args: any[]) {
        console.error(...args);
        this.#addEntry('error', args);
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
