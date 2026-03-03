import type { Alert, AlertType} from '$lib/types/alert';

// prevent refresh spam
const REFRESH_COOLDOWN = 1000

class AlertState {
    private _alerts = $state<Alert[]>([]);
    private _nextId = 0;

    get items() {
        return this._alerts;
    }

    show(message: string, type: AlertType = 'info', duration = 3000) {
        const existing = this._alerts.find(
            a => a.message === message && a.type === type
        );

        if (existing) {
            this.resetTimer(existing, duration);
            return
        }

        const id = ++this._nextId;

        this._alerts.push({
            id, type, message, date: Date.now()
        });

        this.consoleMsg(message, type);

        this.addTimer(this._alerts.at(-1)!, duration);
    }

    dismiss(id: number) {
        const index = this._alerts.findIndex(a => a.id === id);
        if (index !== -1) {
            const alert = this._alerts[index];
            // Clean up
            if (alert.timeoutId) clearTimeout(alert.timeoutId);
            this._alerts.splice(index, 1);
        }
    }

    private resetTimer(alert: Alert, duration: number) {
        if (alert.date + REFRESH_COOLDOWN > Date.now()) {
            return;
        }

        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
        }

        alert.date = Date.now();

        this.addTimer(alert, duration);
    }

    private addTimer(alert: Alert , duration: number) {
        alert.timeoutId = setTimeout(() => {
            this.dismiss(alert.id);
        }, duration);
    }

    private consoleMsg(message: string, type: AlertType) {
        if (type === 'error') {
            console.error(`[UI ALERT] ${message}`);
        } else if (type === 'warning') {
            console.warn(`[UI ALERT] ${message}`);
        } else {
            console.log(`[UI ALERT] ${message}`);
        }
    }
}

export const ui = new AlertState();
