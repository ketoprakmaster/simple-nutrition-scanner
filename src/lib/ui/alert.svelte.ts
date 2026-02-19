import type { Alert, AlertType} from '$lib/types/alert';

class AlertState {
    private _alerts = $state<Alert[]>([]);
    private _nextId = 0;

    get items() {
        return this._alerts;
    }

    show(message: string, type: AlertType = 'info', duration = 3000) {
        const id = ++this._nextId;

        if (type === 'error') {
            console.error(`[UI ALERT] ${message}`);
        } else if (type === 'warning') {
            console.warn(`[UI ALERT] ${message}`);
        } else {
            console.log(`[UI ALERT] ${message}`);
        }

        this._alerts = [...this._alerts, { id, type, message }];

        setTimeout(() => {
            this._alerts = this._alerts.filter(a => a.id !== id);
        }, duration);
    }
}

export const ui = new AlertState();
